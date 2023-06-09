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
    // 更新 webview 的内容
    panel.webview.html = getWebViewContent(logsOutput);
  } catch (error) {
      vscode.window.showErrorMessage(`${error}`);
    }
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
