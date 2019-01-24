document.getElementById("root")!.innerHTML = `
  <style>
    html, body, #root {
      height: 500px;
    }
    #root {
      background: black;
      color: #44bd32;
      font-family: 'Fira Code', 'Consolas', monospace;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    h1 {
      font-weight: normal;
    }
  </style>
  <h1>Success ${"✔"}</h1>
`;
