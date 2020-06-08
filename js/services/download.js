import h3 from "../h3.js";

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

const downloadHTML = (title, content) => {
  const doc = document.implementation.createHTMLDocument(title);
  const div = doc.createElement("div");
  div.innerHTML = content;
  doc.body.appendChild(div);
  return downloadFile(title, doc.documentElement.outerHTML, "html");
};

export { downloadHTML, downloadFile };
