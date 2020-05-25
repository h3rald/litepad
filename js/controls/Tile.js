import h3 from "../h3.js";
import octicon from "../services/octicon.js";
import { getType, getTypeIcon } from "../services/utils.js";

export default (props) => {
  const { item } = props;
  const icon = getTypeIcon(item.id);
  const type = getType(item.id);
  const date = new Date(item.updated || item.created);
  const select = (id) => {
    h3.navigateTo(
      `/${h3.state.collection}/${h3.state.page}/${h3.state.selection === id ? "" : id}`
    );
  };
  const id = item.id.replace(`${h3.state.collection}/`, "");
  return h3(
    `div.tile.d-flex.flex-row${h3.state.selection === id ? ".selected" : ""}`,
    {
      data: { id },
      $onrender: (node) => h3.state.selection === node.dataset.id && setTimeout(() => node.scrollIntoViewIfNeeded(), 0),
      onclick: (e) => select(e.currentTarget.dataset.id),
    },
    [
      h3(
        "div.tile-icon.d-flex.flex-column.flex-items-center.flex-justify-center.p-2",
        octicon(icon, { height: 32 })
      ),
      h3("div.tile-body", [
        h3("p.tile-title", item.data.title),
        h3("div.tile-data", {
          $html: `${type} &middot; ${date.toDateString()} @ ${date.toLocaleTimeString()}`,
        }),
      ]),
    ]
  );
};
