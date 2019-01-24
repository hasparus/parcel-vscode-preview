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
  console.log('"current-module-preview" is now active 🏃👋');

  context.subscriptions.push(
    vscode.commands.registerCommand("currentModulePreview.start", () => {
      const devServerPort = 9876;
      const devServerUrl = `http://localhost:${devServerPort}`;

      const userFilePath = getCurrentFilePath();
      if (!userFilePath) {
        vscode.window.showErrorMessage(
          "Couldn't open preview. Is any file open?"
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
        // Identifies the type of the webview. Used internally
        "currentModulePreview",
        // Title of the panel displayed to the user
        `${path.basename(relativePath)} 👀`,
        vscode.ViewColumn.Two, // Editor column to show the new webview panel in.
        {
          enableScripts: true,
        } // Webview options. More on these later.
      );

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
    server.close();
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

function makeWebviewHtml(src: string) {
  return `<!DOCTYPE html>
		<html lang="en">
			<head>
				<meta charset="UTF-8" />
				<meta http-equiv="X-UA-Compatible" content="ie=edge" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			</head>
			<style>
        html, body {
          height: 100%;
        }  
        body {
          margin: 0;
          padding: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
				}
				iframe {
					border: none;
          width: 100%;
          height: auto;
          flex: 1;
				}
        footer {
          padding: 0.5em;
          font-family: 'Fira Code', 'Hack', Consolas, monospace;
          background-color: #f5f6fa;
          color: #2f3640;
        }
        a {
          padding: 1px;
          color: blue;
        }
        a:hover, a:focus {
          color: white;
          background: black;
        }
			</style>
      <body>
        <iframe src="${src}"></iframe>
        <footer>
          <a href="${src}">${src}</a>
        </footer>  
      </body>
      <script>
      (function() {
          const vscode = acquireVsCodeApi();
          vscode.postMessage({
              command: 'log',
              text: \`Preview launched. Opening ${src} in the iframe.\`
          });
      })();
      </script>
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

        <style>
          html, body {
            height: 100%;
          }  
          body {
            margin: 0;
          }
        </style>
      </head>
    
      <body>
        <div id="root"></div>
        <script src="${codePath}"></script>
      </body>

    </html>
  `;
}
