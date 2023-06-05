import * as vscode from 'vscode';
import { execSync } from 'child_process';

async function rhinoLogs(outputChannel: vscode.OutputChannel) {
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
    prompt: 'Enter the namespace of the RHINO job or press Enter to use default namespace'
  });
  if (namespace) {
    rhinoLogsCommand += ` --namespace ${namespace}`;
  }

  const follow = await vscode.window.showQuickPick(
    ['true', 'false'],
    { placeHolder: 'Continuously track the latest updates to the log output' }
  );
  if (follow === 'ture') {
    rhinoLogsCommand += ` -f`;
  }
 

  const laucher = await vscode.window.showQuickPick(
    ['true', 'false'],
    { placeHolder: 'Get the log of the launcher pod'}
  );
  if(laucher === 'true'){
    rhinoLogsCommand += ` -l`;
  }else{
    const worker = await vscode.window.showInputBox({
      prompt: 'Enter the worker pod name or press Enter to get the log of all worker pods',
      value: '-1',
    });
    if(worker === '-1'){
      rhinoLogsCommand += ` -w`;
    }else if(Number(worker) >= 0&&Number(worker)%1 === 0){
      rhinoLogsCommand += ` -w ${worker}`;
    }else{
      vscode.window.showErrorMessage('The worker pod name must be a non-negative integer!');
      return;
    }
  }


  //user add kubeconfig file,if not,use default kubeconfig file
  const kubeconfig = await vscode.window.showInputBox({
    prompt: 'Enter the path of kubeconfig file or press Enter to use default kubeconfig file'
  });
  if (kubeconfig) {
    rhinoLogsCommand += ` --kubeconfig ${kubeconfig}`;
  }
  //output logs to terminal
  try{
    const output = execSync(rhinoLogsCommand);
    outputChannel.appendLine(output.toString());
    outputChannel.show();
  } catch(error){
    vscode.window.showErrorMessage(`${error}`);
  }

}

export default rhinoLogs;
