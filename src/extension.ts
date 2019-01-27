// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as path from "path";
import ParcelBundler = require("parcel-bundler-without-deasync");
import * as http from "http";
import * as fs from "fs";
import slash from "slash";

import { makeWebviewHtml, makeParcelRootHtml } from "./html";

// Config
const PARCEL_HTML_ROOT_PATH = slash(
  path.join(__dirname, "..", "test", "index.html")
);
const devServerPort = 9876;
const devServerUrl = `http://localhost:${devServerPort}`;
const rootDir = PARCEL_HTML_ROOT_PATH.replace("index.html", "");

// State
let server: http.Server | undefined;

function disposeServer() {
  server!.close();
  server = undefined;
}

function writeToParcelHtmlRoot(relativePath: string) {
  fs.writeFileSync(PARCEL_HTML_ROOT_PATH, makeParcelRootHtml(relativePath), {
    encoding: "utf-8",
  });
}

export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('"current-module-preview" is now active 🏃👋');

  context.subscriptions.push(
    vscode.commands.registerCommand("currentModulePreview.start", async () => {
      const userFilePath = getCurrentFilePath();
      if (!userFilePath) {
        vscode.window.showErrorMessage(
          "Couldn't open preview. Is any file open?"
        );

        return;
      }

      const relativePath = slash(path.relative(rootDir, userFilePath));
      writeToParcelHtmlRoot(relativePath);

      if (!server) {
        const bundler = new ParcelBundler(PARCEL_HTML_ROOT_PATH, {
          minify: false,
        });

        server = await bundler.serve(devServerPort, false);
      }

      const panel = vscode.window.createWebviewPanel(
        "currentModulePreview",
        `${path.basename(relativePath)} 👀`,
        vscode.ViewColumn.Two,
        { enableScripts: true }
      );

      const activeEditorListener = vscode.window.onDidChangeActiveTextEditor(
        x => {
          console.log("ACTIVE TEXT EDITOR", x);
        }
      );

      panel.onDidDispose(e => {
        disposeServer();
        activeEditorListener.dispose();
      });

      panel.webview.html = makeWebviewHtml(devServerUrl);
      // panel.webview.onDidReceiveMessage(
      //   (msg: { command: string; text: string }) => {
      //     switch (msg.command) {
      //       case "log":
      //         vscode.window.showInformationMessage(msg.text);
      //     }
      //   }
      // );
    })
  );
}

// this method is called when your extension is deactivated
export function deactivate() {
  if (server) {
    disposeServer();
  }
}

function getCurrentFilePath() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return undefined;
  }

  let filePath = editor.document.uri.path;

  if (/^win/.test(process.platform)) {
    return filePath.substr(1);
  }

  return filePath;
}
