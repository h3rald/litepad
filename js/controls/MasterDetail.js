import h3 from "../h3.js";
import Tile from "./Tile.js";
import DOMPurify from "../../vendor/purify.es.js";
import marked from "../../vendor/marked.js";
import UnSelected from "./UnSelected.js";
import Empty from "./Empty.js";
import Field from "./Field.js";
import Snippet from "../models/Snippet.js";
import Note from "../models/Item.js";
import { saveItem, getItems } from "../services/api.js";
import { handleUpdateTask } from "../services/gfmtasks.js";

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
                    $html: marked(DOMPurify.sanitize(item.data.text)),
                    $onrender: handleUpdateTask,
                  }),
                collection === "snippets" &&
                  Field({ ...data.code, editable: false }),
              ]),
            ])
          : h3("div.detail.flex-auto", UnSelected({ collection })),
      ]);
};
