// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { stat as fsStat } from "fs";
import { promisify } from "util";
import * as path from "path";
import ParcelBundler = require("parcel-bundler-without-deasync");
import * as http from "http";
import * as fs from "fs";
import slash from "slash";

const stat = promisify(fsStat);

const PARCEL_HTML_ROOT_PATH = slash(
  path.join(__dirname, "..", "test", "index.html")
);

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

let server: http.Server | null = null;

export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('"parcel-vscode-preview" is now active 🏃👋');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "parcelPreview.start",
    () => {
      const devServerPort = 9876;
      const devServerUrl = `http://localhost:${devServerPort}`;

      const userFilePath = getCurrentFilePath();
      if (!userFilePath) {
        vscode.window.showErrorMessage(
          "Try to open Preview with editor tab open"
        );

        return;
      }

      // Make relative path to insert in root index.html
      const rootDir = PARCEL_HTML_ROOT_PATH.replace("index.html", "");
      const relativePath = slash(path.relative(rootDir, userFilePath));
      console.log({
        rootDir,
        relativePath,
      });

      // Create parcel root index.html
      fs.writeFileSync(
        PARCEL_HTML_ROOT_PATH,
        makeParcelRootHtml(relativePath),
        {
          encoding: "utf-8",
        }
      );

      const bundler = new ParcelBundler(PARCEL_HTML_ROOT_PATH, {
        minify: false,
      });
      server = bundler.serve(devServerPort, false) as http.Server;

      const panel = vscode.window.createWebviewPanel(
        "parcelPreview", // Identifies the type of the webview. Used internally
        "Parcel Preview", // Title of the panel displayed to the user
        vscode.ViewColumn.Two, // Editor column to show the new webview panel in.
        {
          enableScripts: true,
        } // Webview options. More on these later.
      );

      panel.webview.html = makeWebviewHtml(devServerUrl);
      panel.webview.onDidReceiveMessage((msg: unknown) =>
        console.log("->", msg)
      );
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
  if (server) {
    server.close();
  }
}

function getCurrentFilePath() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return undefined;
  }

  let filePath = editor.document.uri.path;

  console.log({ filePath });
  console.log(process.platform);

  if (/^win/.test(process.platform)) {
    filePath = filePath.substr(1);
  }

  return filePath;
}

function makeWebviewHtml(src: string) {
  return `<!DOCTYPE html>
		<html lang="en">
			<head>
				<meta charset="UTF-8" />
				<meta http-equiv="X-UA-Compatible" content="ie=edge" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			</head>
			<style>
				body {
					margin: 0;
					overflow: hidden;
				}
				iframe {
					border: none;
					width: 100%;
				}
				html, body, iframe {
					height: 100%;
				}
			</style>
		
      <body>
        Hello
        <a href="${src}">${src}</a>
				<iframe src="${src}"><iframe>
			</body>
		</html>
	`;
}

function makeParcelRootHtml(codePath: string, title = "Parcel Preview") {
  return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="ie=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
      </head>
    
      <body>
        Root
        <div id="root"></div>
    
        <script src="${codePath}"></script>
      </body>
    </html>
  `;
}
