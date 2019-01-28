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
          background: var(--background-color);
          margin: 0;
          padding: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        iframe {
          border: none;
          z-index: 1;
        }
        footer {
          padding: 0.5em;
          font-family: "Fira Code", "Hack", Consolas, monospace;
          background-color: var(--background-color);
          color: var(--color);
          border: 1px solid var(--vscode-activityBar-border);
        }
        a {
          padding: 1px;
          color: var(--link-color);
        }
        a:hover,
        a:focus {
          color: var(--link-active-color);
        }

        .full-size {
          width: 100%;
          flex: 1;
          position: relative;
        }

        .layer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        @keyframes rotate {
          100% {
            transform: rotate(360deg);
          }
        }

        .center {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .spinner {
          width: 50px;
          height: 50px;
          animation: rotate linear 4s infinite;
        }
        .spinner::after {
          display: block;
          content: "";
          overflow: hidden;
          box-sizing: border-box;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 4px solid transparent;
          border-top-color: var(--color);

          animation: rotate 1s infinite;
        }
      </style>
      <body>
        <main class="full-size">
          <iframe class="layer" src="${src}"></iframe>
          <div id="placeholder" class="center layer" />
        </main>
        <footer><a href="${src}">${src}</a></footer>
      </body>
      <script defer>
        const placeholder = document.getElementById("placeholder");
        const state /*: 'STARTING' | 'LOADING' | 'NOT_SURE' */ = "STARTING";

        function setState(newState) {
          switch (newState) {
            case "STARTING":
              placeholder.innerHTML = "";
              setTimeout(() => {
                setState("LOADING");
              }, 300);
              break;

            case "LOADING":
              placeholder.innerHTML = '<div class="spinner" />';
              setTimeout(() => {
                setState("NOT_SURE");
              }, 1500);
              break;

            case "NOT_SURE":
              placeholder.innerHTML =
                "Hmm... I'm not sure this file modifies the DOM 🤔";
              break;
          }
        }

        setState("STARTING");
      </script>
      <!-- <script>
        (function() {
            const vscode = acquireVsCodeApi();
            vscode.postMessage({  
                command: 'log',
                text: \`Preview launched. Opening ${src} in the iframe.\`
            });
        })();
      </script> -->
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
        <script>
          console.log("${codePath}");
          window.postMessage;
        </script>
        <script src="${codePath}"></script>
      </body>
    </html>
  `;
}
