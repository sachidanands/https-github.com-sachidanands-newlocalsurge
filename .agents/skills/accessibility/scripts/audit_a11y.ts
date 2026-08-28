import fs from 'fs';
import path from 'path';

interface Issue {
  file: string;
  line: number;
  type: 'ERROR' | 'WARNING';
  code: string;
  message: string;
  recommendation: string;
}

const ROOT_DIR = path.resolve(process.cwd(), 'src');
const ISSUES: Issue[] = [];

function walkDir(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
        walkDir(fullPath, fileList);
      }
    } else if (/\.(tsx|jsx|html)$/.test(file)) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function auditFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const relPath = path.relative(process.cwd(), filePath);

  // Check 1: <img> elements
  const imgRegex = /<img\b([^>]*?)(?:\/?>|>)/gi;
  let match: RegExpExecArray | null;

  while ((match = imgRegex.exec(content)) !== null) {
    const attrs = match[1];
    const matchIndex = match.index;
    const lineNumber = content.substring(0, matchIndex).split('\n').length;

    // Skip if not a real <img> element (e.g. mentions in comments or strings like 'No <img> elements')
    const hasSrc = /\bsrc\s*=\s*(?:["']|{)/.test(attrs);
    if (!hasSrc) {
      continue;
    }

    // Check alt attribute existence
    const hasAlt = /\balt\s*=\s*(?:["']|{)/.test(attrs);
    const ariaHidden = /\baria-hidden\s*=\s*(?:["']true["']|{\s*true\s*})/.test(attrs);

    if (!hasAlt) {
      ISSUES.push({
        file: relPath,
        line: lineNumber,
        type: 'ERROR',
        code: 'IMG_MISSING_ALT',
        message: '<img /> is missing an alt attribute.',
        recommendation: 'Add alt="Descriptive text" for informative images, or alt="" role="presentation" for decorative images.'
      });
    } else {
      // Check for placeholder or filename alt
      const altMatch = attrs.match(/\balt\s*=\s*["']([^"']*)["']/);
      if (altMatch) {
        const altText = altMatch[1].trim().toLowerCase();
        if (altText === 'image' || altText === 'photo' || altText === 'picture' || /\.(jpg|png|svg|webp|jpeg)$/i.test(altText)) {
          ISSUES.push({
            file: relPath,
            line: lineNumber,
            type: 'WARNING',
            code: 'IMG_GENERIC_ALT',
            message: `<img /> has generic alt text: "${altMatch[1]}".`,
            recommendation: 'Provide meaningful description of what is depicted instead of generic placeholder text.'
          });
        }

        // Check conflicting aria-hidden and non-empty alt
        if (ariaHidden && altText.length > 0) {
          ISSUES.push({
            file: relPath,
            line: lineNumber,
            type: 'ERROR',
            code: 'CONFLICTING_ARIA_HIDDEN_ALT',
            message: '<img /> has aria-hidden="true" but also defines non-empty alt text.',
            recommendation: 'Remove aria-hidden="true" if image is informative, or use alt="" if decorative.'
          });
        }
      }
    }
  }

  // Check 2: Non-semantic clickable elements
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Look for <div or <span with onClick
    if (/<(div|span)\b[^>]*onClick/.test(line)) {
      // Check surrounding lines (in case attributes are split across multiple lines)
      const contextChunk = lines.slice(Math.max(0, i - 2), Math.min(lines.length, i + 8)).join(' ');
      const hasRole = /\brole\s*=\s*["'](button|link|tab)["']/.test(contextChunk);
      const hasTabIndex = /\btabIndex\s*=\s*(?:["']?\d+["']?|{\s*\d+\s*})/.test(contextChunk);
      const hasKeyboardHandler = /\b(onKeyDown|onKeyUp|onKeyPress)\b/.test(contextChunk);

      // Check if it's an overlay backdrop or pure event stopper
      const isBackdrop = /aria-hidden\s*=\s*(?:["']true["']|{\s*true\s*})/.test(contextChunk);
      const isEventStopperOnly = /onClick=\s*\{\s*e\s*=>\s*e\.stopPropagation\(\)\s*\}/.test(line) && !hasRole;

      if (!isBackdrop && !isEventStopperOnly && (!hasRole || !hasTabIndex || !hasKeyboardHandler)) {
        ISSUES.push({
          file: relPath,
          line: lineNum,
          type: 'WARNING',
          code: 'CLICKABLE_NON_SEMANTIC',
          message: 'Clickable <div/span> lacks keyboard accessibility attributes.',
          recommendation: 'Convert to a <button type="button"> or add role="button", tabIndex={0}, and onKeyDown handler for Enter/Space.'
        });
      }
    }

    // Check 3: Icon-only buttons or links without accessible name
    if (/<button\b[^>]*>/.test(line)) {
      const buttonChunk = lines.slice(i, Math.min(lines.length, i + 6)).join(' ');
      const hasAriaLabel = /\baria-label\s*=\s*(?:["']|{)/.test(buttonChunk);
      const hasTitle = /\btitle\s*=\s*(?:["']|{)/.test(buttonChunk);
      const hasSrOnly = /sr-only/.test(buttonChunk);
      const isOnlyIcon = /<[A-Z][A-Za-z0-9]*\s*className="[^"]*"\s*\/>\s*<\/button>/.test(buttonChunk.replace(/\s+/g, ' '));

      if (isOnlyIcon && !hasAriaLabel && !hasTitle && !hasSrOnly) {
        ISSUES.push({
          file: relPath,
          line: lineNum,
          type: 'WARNING',
          code: 'BUTTON_MISSING_ACCESSIBLE_NAME',
          message: 'Button appears to contain only an icon with no accessible name.',
          recommendation: 'Add aria-label="..." to the <button> or provide an inner <span className="sr-only"> description.'
        });
      }
    }
  }
}

function runAudit() {
  console.log('\n🔍 Running ADA Compliance & Accessibility (WCAG 2.1 AA) Audit...\n');
  const files = walkDir(ROOT_DIR);

  for (const file of files) {
    auditFile(file);
  }

  // Check landmark in App.tsx
  const appTsxPath = path.join(ROOT_DIR, 'App.tsx');
  if (fs.existsSync(appTsxPath)) {
    const appContent = fs.readFileSync(appTsxPath, 'utf-8');
    if (!/<main[^>]*id\s*=\s*["']main-content["']/.test(appContent)) {
      ISSUES.push({
        file: 'src/App.tsx',
        line: 1,
        type: 'WARNING',
        code: 'LANDMARK_MAIN_ID_MISSING',
        message: '<main> element is missing id="main-content" for skip navigation.',
        recommendation: 'Add id="main-content" and tabIndex={-1} to <main>.'
      });
    }
    if (!/href\s*=\s*["']#main-content["']/.test(appContent)) {
      ISSUES.push({
        file: 'src/App.tsx',
        line: 1,
        type: 'WARNING',
        code: 'SKIP_LINK_MISSING',
        message: 'No skip-to-content link found in App.tsx.',
        recommendation: 'Add a "Skip to main content" link as the first focusable element in App.tsx.'
      });
    }
  }

  console.log(`Audited ${files.length} JSX/TSX files.`);

  if (ISSUES.length === 0) {
    console.log('✅ 0 accessibility violations found! Excellent job.\n');
    process.exit(0);
  }

  console.log(`\nFound ${ISSUES.length} accessibility issue(s):\n`);

  let errorCount = 0;
  let warningCount = 0;

  for (const issue of ISSUES) {
    if (issue.type === 'ERROR') errorCount++;
    else warningCount++;

    const icon = issue.type === 'ERROR' ? '❌' : '⚠️';
    console.log(`${icon} [${issue.type}] ${issue.file}:${issue.line} (${issue.code})`);
    console.log(`   Issue: ${issue.message}`);
    console.log(`   Fix:   ${issue.recommendation}\n`);
  }

  console.log(`Summary: ${errorCount} error(s), ${warningCount} warning(s).\n`);

  if (errorCount > 0) {
    process.exit(1);
  }
}

runAudit();
