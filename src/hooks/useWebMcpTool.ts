import { useEffect } from 'react';
import { registerWebMcpTool, unregisterWebMcpTool, WebMcpTool } from '../utils/webmcp';

export function useWebMcpTool(toolConfig: WebMcpTool) {
  useEffect(() => {
    // Register tool contextually on component mount
    if (typeof navigator !== 'undefined' && (navigator as any).registerTool) {
      (navigator as any).registerTool(toolConfig.name, toolConfig);
    } else {
      registerWebMcpTool(toolConfig.name, toolConfig);
    }

    // Unregister tool contextually on component unmount
    return () => {
      if (typeof navigator !== 'undefined' && (navigator as any).unregisterTool) {
        (navigator as any).unregisterTool(toolConfig.name);
      } else {
        unregisterWebMcpTool(toolConfig.name);
      }
    };
  }, [toolConfig.name]);
}
