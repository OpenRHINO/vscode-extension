import * as vscode from 'vscode'
import { execSync } from 'child_process'

async function rhinoRun() {
  // get all available docker images
  let images: string[] = []
  try {
    const output = execSync('docker images')
    images = extractImageNames(output.toString())
  } catch (error) {
    vscode.window.showErrorMessage(`${error}`)
  }

  if (images.length == 0) {
    vscode.window.showErrorMessage('No available Docker images to run!')
    return
  }

  // let user select which images to run
  const selectedImage = await vscode.window.showQuickPick(images, {
    placeHolder: 'Select a Docker image to run'
  })
  if (!selectedImage) {
    return
  }

  let rhinoRunCommand = `rhino run ${selectedImage}`

  // let user enter arguments for rhino run, like namespace, np, ttl, ...
  const namespace = await vscode.window.showInputBox({
    prompt: 'Enter the namespace of RHINO job'
  })
  if (namespace) {
    rhinoRunCommand += ` --namespace ${namespace}`
  }

  const np = await vscode.window.showInputBox({
    prompt: 'Enter the number of MPI processes (default 1)'
  })
  if (np) {
    rhinoRunCommand += ` --np ${np}`
  }
  
  const ttl = await vscode.window.showInputBox({
    prompt: 'Enter TTL(seconds, default 600)'
  })
  if (ttl) {
    rhinoRunCommand += ` --ttl ${ttl}`
  }

  const serverIP = await vscode.window.showInputBox({
    prompt: 'Enter the IP address of an NFS server'
  })
  if (serverIP) {
    rhinoRunCommand += ` --server ${serverIP}`
    const mountDir = await vscode.window.showInputBox({
      prompt: 'Enter NFS mount dir'
    })

    if (!mountDir) return;
    else rhinoRunCommand += ` --dir ${mountDir}`
  }

  // let user enter command line arguments for application
  let cmdArgs = [] 
  let cmdArgsString = ""
  while (true) {
    let arg = await vscode.window.showInputBox({
      prompt: 'Enter command line args'
    })
    if (!arg) {
      break
    }
    cmdArgs.push(`${arg} `)
  }

  for (let arg of cmdArgs) {
    cmdArgsString += arg
  }
  if (cmdArgs.length != 0) {
    rhinoRunCommand += ` -- ${cmdArgsString}`
  }

  // launch a subprocess to execute rhino run command
  try {
    execSync(rhinoRunCommand)
    vscode.window.showInformationMessage(`${rhinoRunCommand} SUCCESS!`)
  } catch (error) {
    vscode.window.showErrorMessage(`${error}`)
  }
}

function extractImageNames(outputStr: string): string[] {
  // split the input string into lines
  const lines = outputStr.trim().split(/\r?\n/)

  // filter out the header line and process each line to extract the required fields
  const images = lines.slice(1) // skip the first line(header)
                      .map(line => {
                        const columns = line.trim().split(/\s+/)
                        return `${columns[0]}:${columns[1]}`
                      })
  return images
}

export default rhinoRun
