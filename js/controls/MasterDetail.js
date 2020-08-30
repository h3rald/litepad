import { h3, h } from "../h3.js";
import Tile from "./Tile.js";
import DOMPurify from "../../vendor/purify.es.js";
import marked from "../../vendor/marked.js";
import UnSelected from "./UnSelected.js";
import Empty from "./Empty.js";
import { handleUpdateTask } from "../services/gfmtasks.js";
import { handleInclusions } from "../services/mdincludes.js";
import { handleToc, toc } from "../services/mdtoc.js";

Prism.languages.json = Prism.languages.javascript;

const state = {};

export default ({ items, item, collection, add }) => {
  let data;
  if (item) {
    data = new h3.state.config.types[collection]();
    data.set(item);
  }
  state.current = state.current || {};
  if (state.current.collection !== collection) {
    state.current = { collection };
  }
  return items.length === 0
  ? Empty({ collection: collection, add })
  : h(`div.master-detail.d-flex.flex-row.flex-1`, [
    h(
      `div.master.d-flex.flex-column${
        h3.state.selection ? ".hide-sm" : ""
      }`,
      h(
        "div.d-flex.flex-column.flex-1.scrollable-area",
        {
          data: { collection },
          onscroll: (e) => {
            state.current.scrollTop = e.currentTarget.scrollTop;
          },
          $onrender: (node) => {
            node.scrollTo(0, state.current.scrollTop);
          },
        },
        items.map((item) => {
          return Tile({ item });
        })
      )
    ),
    item
    ? h(
      `div.detail.pl-sm-4.d-flex.flex-column.flex-1${
        h3.state.selection ? "" : ".hide-sm"
      }`,
      [
        h("h1.item-title", item.data.title),
        h("div.d-flex.flex-column.flex-1.scrollable-area", [
          collection === "notes" &&
          h("div#item-content.markdown", {
            $html: marked(item.data.text),
            $onrender: async (node) => {
              node.innerHTML = DOMPurify.sanitize(node.innerHTML);
              handleInclusions(node);
              window.Prism.highlightAllUnder(node);
              handleUpdateTask(node);
            },
          }),
          collection === "snippets" &&
          h(
            "pre",
            h(
              `code#item-content.language-${data.language.value}`,
              { $onrender: (node) => Prism.highlightElement(node) },
              data.code.value
            )
          ),
        ]),
      ]
    )
    : h("div.detail.flex-auto.hide-sm", UnSelected({ collection })),
  ]);
};
