import * as vscode from 'vscode';
import { execSync } from 'child_process';

let panel: vscode.WebviewPanel | undefined = undefined;

async function rhinoLogs(jobName: string | undefined) {
  if (!jobName) {
    vscode.window.showErrorMessage('Error: no job name provided');
    return;
  }

  if (!panel) {
    // 创建新的 webview
    panel = vscode.window.createWebviewPanel(
      'rhinoLogs',
      `Logs for job ${jobName}`,
      vscode.ViewColumn.One,
      {}
    );

    panel.onDidDispose(() => {
      // 当 webview 被关闭时重置 panel 变量
      panel = undefined;
    });
  }

  try {
    // 获取最新的日志内容
    const logsOutput = execSync(`rhino logs ${jobName}`).toString();
    // 添加时间戳
    const logsWithTimestamp = addTimestampToLogs(logsOutput);
    // 更新 webview 的内容
    panel.webview.html = getWebViewContent(logsWithTimestamp);
  } catch (error) {
    vscode.window.showErrorMessage(`Error executing command: ${error}`);
  }
}

// 从 rhino logs 命令的输出中提取日志内容返回并显示在 webview 中
function getLogsAndShowInWebview(jobName: string, panel: vscode.WebviewPanel): { logs: string, error: Error | null } {
  if (!jobName) {
    return { logs: "", error: new Error('Error: no job name provided') };
  }
  if (!panel) {
    return { logs: "", error: new Error('Error: no panel provided') };
  }
  try {
    const logsOutput = execSync(`rhino logs ${jobName}`).toString();
    const logsWithTimestamp = addTimestampToLogs(logsOutput);
    panel.webview.html = getWebViewContent(logsWithTimestamp);
    return { logs: logsOutput, error: null };
  } catch (error) {
    return { logs: "", error: new Error(`Error executing command: ${error}`) };
  }
}

function addTimestampToLogs(logs: string): string {
  const timestamp = new Date().toLocaleString();
  return `${timestamp}\n${logs}`;
}

function getWebViewContent(logs: string): string {
  return `
    <html>
      <body>
        <pre>${logs}</pre>
      </body>
    </html>
  `;
}

export default rhinoLogs;
