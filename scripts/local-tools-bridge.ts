import fs from 'fs';
import path from 'path';
import { spawn, spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

export type ToolStack = 'node' | 'python' | 'rust' | 'go' | 'binary' | 'unknown';

export interface ToolEntry {
  name: string;
  path: string;
  stack: ToolStack;
  repoUrl?: string;
  installedAt?: string;
  registered: boolean;
}

interface RegistryFile {
  version: string;
  baseDir: string;
  updatedAt: string;
  tools: Array<{
    name: string;
    path: string;
    stack: ToolStack;
    repoUrl?: string;
    installedAt?: string;
  }>;
}

export interface RunToolOptions {
  env?: Record<string, string>;
  cwdSubpath?: string;
}

export interface RunToolResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

/**
 * Resolves the external local-tools hub directory outside this repository.
 */
export function getLocalToolsDir(): string {
  const configured = process.env.LOCAL_TOOLS_DIR;
  return configured
    ? path.resolve(process.cwd(), configured)
    : path.resolve(process.cwd(), '..', 'local-tools');
}

/**
 * Validates a tool folder name and resolves its path safely within local-tools.
 */
export function getToolPath(toolName: string): string {
  const trimmed = toolName.trim();
  if (!trimmed || trimmed === '.' || trimmed === '..' || /[\\/]/.test(trimmed)) {
    throw new Error(`Invalid tool name: "${toolName}"`);
  }

  const baseDir = path.resolve(getLocalToolsDir());
  const resolved = path.resolve(baseDir, trimmed);
  const relative = path.relative(baseDir, resolved);

  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Tool path escapes local-tools directory: "${toolName}"`);
  }

  return resolved;
}

function detectToolStack(toolDir: string): ToolStack {
  if (fs.existsSync(path.join(toolDir, 'package.json'))) return 'node';
  if (
    fs.existsSync(path.join(toolDir, 'pyproject.toml')) ||
    fs.existsSync(path.join(toolDir, 'requirements.txt')) ||
    fs.existsSync(path.join(toolDir, 'setup.py'))
  ) {
    return 'python';
  }
  if (fs.existsSync(path.join(toolDir, 'Cargo.toml'))) return 'rust';
  if (fs.existsSync(path.join(toolDir, 'go.mod'))) return 'go';
  if (fs.existsSync(path.join(toolDir, 'Makefile')) || fs.existsSync(path.join(toolDir, 'bin'))) {
    return 'binary';
  }
  return 'unknown';
}

function getRegistryPath(): string {
  return path.join(getLocalToolsDir(), 'registry.json');
}

function readRegistry(): RegistryFile {
  const baseDir = getLocalToolsDir();
  const registryPath = getRegistryPath();
  if (fs.existsSync(registryPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(registryPath, 'utf-8')) as Partial<RegistryFile>;
      return {
        version: parsed.version || '1.0.0',
        baseDir: parsed.baseDir || baseDir,
        updatedAt: parsed.updatedAt || new Date().toISOString(),
        tools: Array.isArray(parsed.tools) ? parsed.tools : []
      };
    } catch {
      // Fall back to fresh structure if registry.json is unreadable
    }
  }
  return {
    version: '1.0.0',
    baseDir,
    updatedAt: new Date().toISOString(),
    tools: []
  };
}

function writeRegistry(registry: RegistryFile): void {
  const baseDir = getLocalToolsDir();
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }
  registry.updatedAt = new Date().toISOString();
  fs.writeFileSync(getRegistryPath(), JSON.stringify(registry, null, 2) + '\n', 'utf-8');
}

/**
 * Lists installed external tools by combining registry.json with directory scanning.
 */
export function listInstalledTools(): ToolEntry[] {
  const baseDir = getLocalToolsDir();
  const registry = readRegistry();
  const regMap = new Map(registry.tools.map((entry) => [entry.name, entry]));
  const results: ToolEntry[] = [];

  if (fs.existsSync(baseDir)) {
    const entries = fs.readdirSync(baseDir, { withFileTypes: true });
    for (const dirent of entries) {
      if (!dirent.isDirectory() || dirent.name.startsWith('.')) continue;
      const toolDir = path.join(baseDir, dirent.name);
      const regEntry = regMap.get(dirent.name);
      results.push({
        name: dirent.name,
        path: toolDir,
        stack: regEntry?.stack && regEntry.stack !== 'unknown' ? regEntry.stack : detectToolStack(toolDir),
        repoUrl: regEntry?.repoUrl,
        installedAt: regEntry?.installedAt,
        registered: Boolean(regEntry)
      });
    }
  }

  return results.sort((a, b) => a.name.localeCompare(b.name));
}

function resolveToolCwd(toolName: string, cwdSubpath?: string): string {
  const toolDir = getToolPath(toolName);
  if (!fs.existsSync(toolDir)) {
    throw new Error(`Tool "${toolName}" is not installed at ${toolDir}`);
  }
  if (!cwdSubpath) return toolDir;

  const targetCwd = path.resolve(toolDir, cwdSubpath);
  const rel = path.relative(toolDir, targetCwd);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new Error(`Subpath "${cwdSubpath}" escapes tool directory "${toolDir}"`);
  }
  if (!fs.existsSync(targetCwd)) {
    throw new Error(`Subpath does not exist: ${targetCwd}`);
  }
  return targetCwd;
}

/**
 * Runs an external tool command inside /home/ved/Websites/local-tools/<toolName>
 * and resolves with its exit code, stdout, and stderr.
 */
export function runLocalTool(
  toolName: string,
  command: string,
  args: string[] = [],
  options: RunToolOptions = {}
): Promise<RunToolResult> {
  return new Promise((resolve, reject) => {
    let cwd: string;
    try {
      cwd = resolveToolCwd(toolName, options.cwdSubpath);
    } catch (err) {
      reject(err);
      return;
    }

    const child = spawn(command, args, {
      cwd,
      env: options.env ? { ...process.env, ...options.env } : process.env,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (chunk: Buffer | string) => {
      stdout += chunk.toString();
    });

    child.stderr?.on('data', (chunk: Buffer | string) => {
      stderr += chunk.toString();
    });

    child.on('error', (err) => reject(err));
    child.on('close', (code) => {
      resolve({
        exitCode: code ?? 1,
        stdout,
        stderr
      });
    });
  });
}

function extractRepoName(repoUrl: string): string {
  const cleaned = repoUrl.trim().replace(/\/+$/, '').replace(/\.git$/i, '');
  const parts = cleaned.split(/[/:]/).filter(Boolean);
  const name = parts[parts.length - 1];
  if (!name) {
    throw new Error(`Could not determine repository name from URL: "${repoUrl}"`);
  }
  return name;
}

function handleListCli(): void {
  const baseDir = getLocalToolsDir();
  const tools = listInstalledTools();

  console.log(`\nLocal Tools Hub: ${baseDir}`);
  if (tools.length === 0) {
    console.log('No external tools installed yet.');
    console.log('Add one with: npm run tools:add <github-repo-url> [optional-name]\n');
    return;
  }

  console.table(
    tools.map((t) => ({
      name: t.name,
      stack: t.stack,
      registered: t.registered ? 'yes' : 'dir-only',
      repoUrl: t.repoUrl || '-',
      path: t.path
    }))
  );
}

function handleAddCli(repoUrl: string | undefined, folderName?: string): void {
  if (!repoUrl) {
    console.error('Usage: npm run tools:add <github-repo-url> [optional-name]');
    process.exit(1);
  }

  const baseDir = getLocalToolsDir();
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  const targetName = folderName ? folderName.trim() : extractRepoName(repoUrl);
  const targetPath = getToolPath(targetName);

  if (fs.existsSync(targetPath)) {
    console.error(`Error: Tool directory already exists at ${targetPath}`);
    process.exit(1);
  }

  console.log(`Cloning ${repoUrl} into ${targetPath}...`);
  const cloneRes = spawnSync('git', ['clone', repoUrl, targetPath], { stdio: 'inherit' });
  if (cloneRes.status !== 0) {
    process.exit(cloneRes.status ?? 1);
  }

  const stack = detectToolStack(targetPath);
  console.log(`Detected stack: ${stack}`);

  if (stack === 'node') {
    console.log('Installing Node.js dependencies (npm install)...');
    const npmRes = spawnSync('npm', ['install'], { cwd: targetPath, stdio: 'inherit' });
    if (npmRes.status !== 0) {
      console.warn('Warning: npm install exited with non-zero status.');
    }
  } else if (stack === 'python') {
    console.log(
      `Python project detected. Create an isolated venv when ready:\n  cd "${targetPath}" && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt`
    );
  }

  const registry = readRegistry();
  const now = new Date().toISOString();
  const filtered = registry.tools.filter((t) => t.name !== targetName);
  filtered.push({
    name: targetName,
    path: targetPath,
    stack,
    repoUrl,
    installedAt: now
  });
  registry.tools = filtered.sort((a, b) => a.name.localeCompare(b.name));
  writeRegistry(registry);

  console.log(`Registered "${targetName}" in ${getRegistryPath()}`);
}

function handleRunCli(args: string[]): void {
  const [toolName, ...rest] = args;
  const cmdArgs = rest[0] === '--' ? rest.slice(1) : rest;
  const [command, ...commandArgs] = cmdArgs;

  if (!toolName || !command) {
    console.error('Usage: npm run tools:run <tool-name> -- <command> [...args]');
    process.exit(1);
  }

  const cwd = resolveToolCwd(toolName);
  const child = spawnSync(command, commandArgs, {
    cwd,
    env: process.env,
    stdio: 'inherit'
  });

  if (child.error) {
    console.error(`Failed to execute "${command}": ${child.error.message}`);
    process.exit(1);
  }
  process.exit(child.status ?? 0);
}

function main(): void {
  const [, , subcommand, ...args] = process.argv;

  switch (subcommand) {
    case 'list':
    case undefined:
      handleListCli();
      break;
    case 'add':
      handleAddCli(args[0], args[1]);
      break;
    case 'run':
      handleRunCli(args);
      break;
    default:
      console.error(`Unknown subcommand "${subcommand}". Expected: list | add | run`);
      process.exit(1);
  }
}

const isEntryPoint = (() => {
  if (!process.argv[1]) return false;
  try {
    return fs.realpathSync(fileURLToPath(import.meta.url)) === fs.realpathSync(process.argv[1]);
  } catch {
    return false;
  }
})();

if (isEntryPoint) {
  main();
}

