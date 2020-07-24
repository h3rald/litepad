import { h3, h } from "../h3.js";

const basicCss = `
body {
    margin: 1rem;
}
h1 {
    margin-bottom: 1rem;
}
h2,h3,h4,h5,h6 {
    margin: 1rem 0 0.5rem 0;
}
ul,ol {
  margin-left: 2rem;
}
ul.checklist {
    list-style-type: none;
}  
pre[class^=language-] {
    background: #eee;
    border-radius: 2px;
    border: #eee;
    margin: 1rem 0;
    padding: 1rem;
}
`;

const downloadFile = (title, text, language) => {
  const lang = h3.state.config.languages[language];
  const data = new Blob([text], { type: lang.mode });
  const a = document.createElement("a");
  a.style.display = "none";
  const url = window.URL.createObjectURL(data);
  a.href = url;
  a.download = `${title}.${lang.extension}`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
};

const addCss = (doc, css) => {
  const style = document.createElement("style");
  style.type = "text/css";
  style.appendChild(document.createTextNode(css));
  doc.head.appendChild(style);
};

const fetchCss = async (doc, file) => {
  const css = await (await fetch(file)).text();
  addCss(doc, css);
};

const downloadHTML = async (title, content) => {
  const doc = document.implementation.createHTMLDocument(title);
  const h1 = doc.createElement("h1");
  h1.appendChild(document.createTextNode(title));
  const div = doc.createElement("div");
  div.innerHTML = content;
  await fetchCss(doc, "vendor/primer/primer.min.css");
  addCss(doc, basicCss);
  const viewport = document.createElement("meta");
  viewport.name = "viewport";
  viewport.content =
    "width=device-width, initial-scale=1.0, maximum-scale=1.0,user-scalable=0";
  const generator = document.createElement("meta");
  generator.name = "generator";
  generator.content = "LitePad";
  doc.head.appendChild(viewport);
  doc.head.appendChild(generator);
  doc.body.appendChild(h1);
  doc.body.appendChild(div);
  return downloadFile(title, doc.documentElement.outerHTML, "html");
};

export { downloadHTML, downloadFile };
