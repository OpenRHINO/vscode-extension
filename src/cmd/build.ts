import * as vscode from 'vscode'
import { exec } from 'child_process'
import path = require('path')

async function rhinoBuild(outputChannel: vscode.OutputChannel) {
  // get workspaceFolder path
  const workspaceFolder = vscode.workspace.workspaceFolders 
  if (!workspaceFolder) {
    vscode.window.showErrorMessage(`Please open the template folder first`)
    return
  }
  const workspaceFolderPath = workspaceFolder[0].uri.fsPath

  // get imageName from user input
  // if user press `esc`, just return
  const imageName = await vscode.window.showInputBox({
    prompt: 'Enter image name, e.g.foo/hello:v1.0'
  })
  if (!imageName) {
    return
  }
  let buildCommand = `rhino build --image ${imageName}`

  // let user select makefile path
  // then use path.relative to calculate the relative path
  // of makefile
  const makefileUri = await vscode.window.showOpenDialog({
    canSelectFiles: true,
    canSelectFolders: false,
    canSelectMany: false,
    openLabel: 'Select Makefile for your project, default: `./src/Makefile`'
  })

  if (makefileUri) {
    const makefileRelPath = path.relative(workspaceFolderPath, makefileUri[0].fsPath)
    buildCommand += ` -f ${makefileRelPath}`
  }

  // get command line arguments from user input
  // stop collecting cmd args when user press esc
  let cmdArgs: string[] = []
  while (true) {
    let arg = await vscode.window.showInputBox({
      prompt: 'Enter command line args'
    })
    if (!arg) {
      break
    }

    cmdArgs.push(`${arg} `)
  }

  let cmdArgString = ""
  for (let arg of cmdArgs) {
    cmdArgString += arg
  }
  if (cmdArgs.length != 0) {
    buildCommand += ` -- ${cmdArgString}`
  }

  // launch a subprocess to execute rhino build command
  vscode.window.showInformationMessage(`Building: ${buildCommand}`)
  const rhinoBuildProcess = exec(buildCommand, {cwd: workspaceFolderPath})

  // attach stdout and stderr to channel Rhino:Build
  rhinoBuildProcess.stdout?.on('data', (data: string) => {
    outputChannel.appendLine(data)
  })
  rhinoBuildProcess.stderr?.on('data', (data:string) => {
    outputChannel.appendLine(data)
  })

  rhinoBuildProcess.on('exit', (code: number) => {
    outputChannel.appendLine(`rhino build process exited with code ${code}`)
    if (code == 0) {
      vscode.window.showInformationMessage(`${buildCommand} SUCCESS!`)
    } else {
      vscode.window.showErrorMessage(`${buildCommand} FAILED! See Rhino:Build output for details.`)
    }
  })
}

export default rhinoBuild
