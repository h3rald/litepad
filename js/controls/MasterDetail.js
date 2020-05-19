import h3 from "../h3.js";
import { getIcon, getObject } from "../services/utils.js";
import octicon from "../services/octicon.js";
import Tile from "./Tile.js";
import DOMPurify from "../../vendor/purify.es.js";
import marked from "../../vendor/marked.js";
import UnSelected from "./UnSelected.js";
import Empty from "./Empty.js";

export default ({ items, item, collection, add }) => {
  return items.length === 0
    ? Empty({ collection: collection, add })
    : h3("div.master-detail.d-flex", [
        h3(
          "div.master.item-list",
          items.map((item) => {
            return Tile({ item });
          })
        ),
        item
          ? h3("div.detail.px-4.flex-auto", [
              h3("h2", item.data.title),
              h3("div.markdown", {
                $html: marked(DOMPurify.sanitize(item.data.text)),
              }),
            ])
          : h3("div.detail.flex-auto", UnSelected({ collection })),
      ]);
};
