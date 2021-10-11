const getUrls = require("get-urls");

const format = (req, res, data, status = 200) => {
  if (req.query.json !== undefined) return res.status(status).json(data);
  let variants = {};
  let formatOpts = [undefined, 3];
  variants["text"] = () => res.send(JSON.stringify(data, ...formatOpts));
  variants["json"] = () => res.send(data);

  let html = `<style>
    .line-numb::before {
      content: attr(value);
    }
    body {
      margin: 0px;
    }
    table {
      white-space: pre-wrap !important;
      font-size: initial;
      width: 100%;
      word-break: break-word;
      font-family: monospace;
      tab-size: 4;
      border-spacing: 0px;
      margin: 0px;
    }
    a {
      color: var(--code-value)
    }
    .line-gutter-backdrop {
      box-sizing: border-box;
      width: 31px;
      background-color: rgb(240, 240, 240);
      user-select: none;
      position: absolute;
      z-index: -1;
      left: 0px;
      top: 0px;
      height: 100%;
      padding: 0px 4px !important;
      border-right: 1px solid rgb(187, 187, 187) !important;
    }
    .line-numb {
      box-sizing: border-box;
      width: 31px;
      background-color: rgb(240, 240, 240);
      user-select: none;
      text-align: right;
      color: rgb(128, 128, 128);
      word-break: normal;
      white-space: nowrap;
      font-size: 9px;
      font-family: Helvetica;
      padding: 0px 4px !important;
      border-right: 1px solid rgb(187, 187, 187) !important;
    }
    .line-code {
      padding: 0px 5px !important;
    }

    /* Coloring */

    :root {
      --code-property: #00000;
      --code-string: #0b7500;
      --code-number: #1A01CC;
      --code-bool: #1A01CC;
    }

    .code-property { color: var(--code-property); }
    .code-string { color: var(--code-string); }
    .code-number { color: var(--code-number); }
    .code-bool { color: var(--code-bool); }
    
    .b { font-weight: bold; }
  </style><div class="line-gutter-backdrop"></div><table><tbody>`;
  let trNonSplit = JSON.stringify(data, ...formatOpts);
  // Coloring
  trNonSplit = trNonSplit.replace(
    /: \"([^\n]+)\"/g,
    `: <span class="code-string">"$1"</span>`
  );
  trNonSplit = trNonSplit.replace(
    /\"([^\n]+)\": /g,
    `<span class="code-property">"$1"</span>: `
  );
  trNonSplit = trNonSplit.replace(
    /([0-9]+): /g,
    `<span class="code-number b">$1</span>: `
  );
  trNonSplit = trNonSplit.replace(
    /: ([0-9]+)/g,
    `: <span class="code-number b">$1</span>`
  );
  trNonSplit = trNonSplit.replace(
    /: (true|false)/g,
    `: <span class="code-bool b">$1</span>`
  );
  let arrayInProgress = false;
  let arrayHTMLCode = [];
  trNonSplit.split("\n").forEach((l, i, a) => {
    if (l.trim().endsWith("[")) {
      l = l.replace(/\[$/, '<span class="b">[</span>');
      arrayInProgress = true;
    }
    if (l.trim().startsWith("]")) {
      l = l.replace(/\]/, '<span class="b">]</span>');
      arrayInProgress = false;
    }
    if (arrayInProgress) {
      l = l.replace(
        /^([ ]*)\"([^]+)\"/,
        '$1<span class="code-string">"$2"</span>'
      );
      l = l.replace(
        /^([ ]*)([0-9]+)/,
        '$1<span class="code-number">$2</span>'
      );
    };
    getUrls(l).forEach(u => {
      l = l.replace(new RegExp(u, "g"), `<a href="${u}" target="_blank">${u}</a>`)
    });
    let linkRegexM = /GET \/([^ "]+)/g;
    let linkRegex = /GET \/([^ "]+)/;
    l = l.replace(linkRegexM, (c) => {
      let cM = "/" + c.match(linkRegex)[1];
      let cMF = c.replace(/([\<\>])/g, (ch) => {
        let vals = {
          "<": "&lt;",
          ">": "&gt;"
        };
        return vals[ch];
      });
      return `<a href="${cM}" target="_blank">${cMF}</a>`
    });
    html += `<tr>
    <td class="line-numb" value="${i + 1}"></td>
    <td class="line-code">${l}</td>
    </tr>\n`;
  });
  html += "</tbody></table>";
  variants["html"] = () => res.send(html);
  res.status(status).format(variants);
};

module.exports = format;