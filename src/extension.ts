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
type State = null | Readonly<{
  bundler: ParcelBundler;
  server?: http.Server;
  filePath: string;
  panel?: vscode.WebviewPanel;
}>;

let state: State = null;

function disposeServer() {
  if (state && state.server) {
    state.server.close();
    state = null;
  } else {
    console.error("Trying to disposeServer when state.server doesn't exist");
  }
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
      const relativePath = getRelativePath(userFilePath);
      writeToParcelHtmlRoot(relativePath);

      if (!relativePath) {
        return;
      }

      if (!state) {
        vscode.window.showInformationMessage(
          "Current Module Preview: Starting bundler."
        );
        const bundler = new ParcelBundler(PARCEL_HTML_ROOT_PATH, {
          minify: false,
        });

        state = { bundler, filePath: relativePath };

        const server = await bundler.serve(devServerPort, false);

        state = {
          bundler,
          server,
          filePath: relativePath,
        };
      }

      if (state.panel) {
        state.panel.dispose();
      }

      const panel = vscode.window.createWebviewPanel(
        "currentModulePreview",
        makeWebviewTitle(relativePath),
        vscode.ViewColumn.Two,
        { enableScripts: true }
      );
      state = { ...state, panel };
      panel.webview.html = makeWebviewHtml(devServerUrl);

      context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(onTextEditorChange)
      );
    })
  );
}

export function deactivate() {
  disposeServer();
}

function onTextEditorChange(editor?: vscode.TextEditor) {
  if (editor && state) {
    const userFilePath = getCurrentFilePath(editor);
    if (!userFilePath) {
      vscode.window.showErrorMessage(
        "Couldn't open preview. Is any file open?"
      );
      return;
    }

    const relativePath = getRelativePath(userFilePath);
    if (relativePath !== state.filePath) {
      state = {
        ...state,
        filePath: relativePath,
      };
      writeToParcelHtmlRoot(relativePath);
      state.panel!.title = makeWebviewTitle(relativePath);
    }
  }
}

function getRelativePath(userFilePath: string) {
  return slash(path.relative(rootDir, userFilePath));
}

function makeWebviewTitle(filePath: string) {
  return `${path.basename(filePath)} 👀`;
}

function writeToParcelHtmlRoot(relativePath: string) {
  fs.writeFileSync(PARCEL_HTML_ROOT_PATH, makeParcelRootHtml(relativePath), {
    encoding: "utf-8",
  });
}

function getCurrentFilePath(editor?: vscode.TextEditor) {
  editor = editor || vscode.window.activeTextEditor;

  if (!editor) {
    return undefined;
  }

  let filePath = editor.document.uri.path;

  if (/^win/.test(process.platform)) {
    return filePath.substr(1);
  }

  return filePath;
}
