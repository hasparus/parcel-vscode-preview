// Use `lit-html` extension for coloring, formatting and autocomplete of `html` templates
import html from "tagged-template-noop";

export function makeWebviewHtml(src: string) {
  return html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="ie=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <style>
        html,
        body {
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
          font-family: "Fira Code", "Hack", Consolas, monospace;
          background-color: #f5f6fa;
          color: #2f3640;
        }
        a {
          padding: 1px;
          color: blue;
        }
        a:hover,
        a:focus {
          color: white;
          background: black;
        }
      </style>
      <body>
        <iframe src="${src}"></iframe>
        <footer><a href="${src}">${src}</a></footer>
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

export function makeParcelRootHtml(codePath: string, title = "Parcel Preview") {
  return html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="ie=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>

        <style>
          html,
          body {
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
