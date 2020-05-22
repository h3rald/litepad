import h3 from "../h3.js";
import { getIcon, getObject } from "../services/utils.js";
import octicon from "../services/octicon.js";
import Tile from "./Tile.js";
import DOMPurify from "../../vendor/purify.es.js";
import marked from "../../vendor/marked.js";
import UnSelected from "./UnSelected.js";
import Empty from "./Empty.js";
import Field from "./Field.js";
import Snippet from "../models/Snippet.js";
import Note from "../models/Item.js";

const types = {
  snippets: Snippet,
  notes: Note,
};

export default ({ items, item, collection, add }) => {
  let data;
  if (item) {
    data = new types[collection]();
    data.set(item);
  }
  return items.length === 0
    ? Empty({ collection: collection, add })
    : h3("div.master-detail.d-flex.flex-row.flex-1", [
        h3(
          "div.master.d-flex.flex-column",
          h3(
            "div.d-flex.flex-column.flex-1",
            { style: "overflow: auto;" },
            items.map((item) => {
              return Tile({ item });
            })
          )
        ),
        item
          ? h3("div.detail.px-4.d-flex.flex-column.flex-1", [
              h3("h2", item.data.title),
              collection === "notes" &&
                h3("div.markdown", {
                  $html: marked(DOMPurify.sanitize(item.data.text)),
                }),
              collection === "snippets" &&
                Field({ ...data.code, editable: false }),
            ])
          : h3("div.detail.flex-auto", UnSelected({ collection })),
      ]);
};
