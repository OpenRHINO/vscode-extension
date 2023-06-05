import * as vscode from 'vscode';
import { execSync } from 'child_process';

async function rhinoLogs() {
  let rhinoLogsCommand = 'rhino logs';

  const name = await vscode.window.showInputBox({
    prompt: 'Enter the name of the RHINO job'
  });
  if (!name) {
    return;
  }else{
    rhinoLogsCommand += ` ${name}`;
  }

  const namespace = await vscode.window.showInputBox({
    prompt: 'Enter the namespace of the RHINO job'
  });
  if (namespace) {
    rhinoLogsCommand += ` --namespace ${namespace}`;
  }

  const follow = await vscode.window.showQuickPick(
    ['true', 'false'],
    { placeHolder: 'Continuously track the latest updates to the log output' }
  );
  if (follow === undefined||follow === 'false') {
    rhinoLogsCommand += ` -f false`;
  }else{
    rhinoLogsCommand += ` -f true`;
  }

  const laucher = await vscode.window.showQuickPick(
    ['true', 'false'],
    { placeHolder: 'Get the log of the launcher pod'}
  );
  if(laucher === 'true'){
    rhinoLogsCommand += ` -l`;
  }

  const worker = await vscode.window.showInputBox({
    prompt: 'Get the log of the w_th worker pod (0 <= w < worker_num)',
    value: '-1',
    validateInput: (value) => {
      if (follow === 'true') {
        if(Number(value) > 0 || Number(value) % 1 === 0){
          vscode.window.showErrorMessage('cannot use -w option when -f is true');
        }
      }
      else if (Number(value) > 0 || Number(value) % 1 === 0) {
        rhinoLogsCommand += ` -w ${value}`;
      }else{
        vscode.window.showErrorMessage('Invalid input. Enter -1 or a non-negative integer.');
        return 'Invalid input. Enter -1 or a non-negative integer.';
      }
    }
  });

  //user add kubeconfig file,if not,use default kubeconfig file
  const kubeconfig = await vscode.window.showInputBox({
    prompt: 'Enter the path of kubeconfig file or press Enter to use default kubeconfig file'
  });
  if (kubeconfig) {
    rhinoLogsCommand += ` --kubeconfig ${kubeconfig}`;
  }

  try {
    execSync(rhinoLogsCommand, { stdio: 'inherit' });
  } catch (error) {
    vscode.window.showErrorMessage(`${error}`);
  }
}

export default rhinoLogs;
