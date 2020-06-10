import marked from "../../vendor/marked.js";
import { getItem } from "./api.js";
import h3 from "../h3.js";
import DOMPurify from "../../vendor/purify.es.js";

const renderer = {
  text(t) {
    const r = /^\{\{((notes|snippets)\/[a-z0-9]+)\}\}$/;
    const match = t.match(/^\{\{((notes|snippets)\/[a-z0-9]+)\}\}$/);
    if (match) {
      const [collection, id] = match[1].split("/");
      return `<div class="md-include md-include-${collection.substr(
        0,
        collection.length - 1
      )}" data-item-id="${collection}/${id}">${id}</div>`;
    }
    return t;
  },
};

const handleInclusions = async (node) => {
  const includes = node.querySelectorAll(".md-include");
  includes.forEach(async (div) => {
    const [collection, id] = div.dataset.itemId.split("/");
    const data = (await getItem(collection, id)) || {
      data: {
        language: "javascript",
        text: `Note '${id}' not found.`,
        code: `Snippet '${id}' not found.`,
      },
    };
    let innerHTML;
    if (collection === "snippets") {
      const lang = h3.state.config.languages[data.data.language].extension;
      innerHTML = `<pre class="language-${lang}"><code class="language-${lang}">${data.data.code}</code></pre>`;
    } else if (collection === "notes") {
      innerHTML = marked(data.data.text);
    }
    innerHTML = DOMPurify.sanitize(innerHTML);
    div.innerHTML = innerHTML;
    window.Prism.highlightAllUnder(div);
  });
};

marked.use({ renderer });

export { handleInclusions };
