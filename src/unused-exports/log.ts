import * as vscode from 'vscode';

let ochannel: vscode.OutputChannel | undefined;

export const logInVSCodeOutput = (msg: string) => {
  if (!ochannel) {
    ochannel = vscode.window.createOutputChannel('Find unused exports');
  }

  ochannel.appendLine(msg);
};
