import * as vscode from 'vscode';
import { execSync } from 'child_process';

let panels: Map<string, vscode.WebviewPanel> = new Map();

async function rhinoLogs(jobName: string | undefined) {
  if (!jobName) {
    vscode.window.showErrorMessage('Error: no job name provided');
    return;
  }
  let panel = panels.get(jobName);
  if (!panel) {
    // 创建新的 webview
    panel = vscode.window.createWebviewPanel(
      'rhinoLogs',
      `Logs for job ${jobName}`,
      vscode.ViewColumn.One,
      {}
    );

    panel.onDidDispose(() => {
      // 当 webview 被关闭时从 map 中移除
      panels.delete(jobName);
    });
    // 将新的 panel 加入到 map 中
    panels.set(jobName, panel);
  }

  try {
    // 获取最新的日志内容
    const logsOutput = execSync(`rhino logs ${jobName}`).toString();
    // 更新 webview 的内容
    panel.webview.html = getWebViewContent(logsOutput);
    // 切换到对应job的webview
    panel.reveal();
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
