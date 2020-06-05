import h3 from "../h3.js";
import Tile from "./Tile.js";
import DOMPurify from "../../vendor/purify.es.js";
import marked from "../../vendor/marked.js";
import UnSelected from "./UnSelected.js";
import Empty from "./Empty.js";
import { handleUpdateTask } from "../services/gfmtasks.js";

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
    : h3("div.master-detail.d-flex.flex-row.flex-1", [
        h3(
          "div.master.d-flex.flex-column",
          h3(
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
          ? h3("div.detail.pl-4.d-flex.flex-column.flex-1", [
              h3("h1.item-title", item.data.title),
              h3("div.d-flex.flex-column.flex-1.scrollable-area", [
                collection === "notes" &&
                  h3("div.markdown", {
                    $html: marked(item.data.text),
                    $onrender: (node) => {
                      Prism.highlightAllUnder(node);
                      handleUpdateTask(node);
                      node.innerHTML = DOMPurify.sanitize(node.innerHTML);
                    },
                  }),
                collection === "snippets" &&
                  h3(
                    "pre",
                    h3(
                      `code.language-${data.language.value}`,
                      { $onrender: (node) => Prism.highlightElement(node) },
                    ), data.code.value
                  ),
              ]),
            ])
          : h3("div.detail.flex-auto", UnSelected({ collection })),
      ]);
};
