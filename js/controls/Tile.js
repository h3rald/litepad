import { h3, h } from "../h3.js";
import octicon from "../services/octicon.js";
import { getType, getTypeIcon } from "../services/utils.js";

export default (props) => {
  const { item } = props;
  const icon = getTypeIcon(item.id);
  const type = getType(item.id);
  const date = new Date(item.modified || item.created);
  const select = (id) => {
    h3.navigateTo(
      `/${h3.state.collection}/${h3.state.page}/${
        h3.state.selection === id ? "" : id
      }`,
      h3.route.params
    );
  };
  const id = item.id.replace(`${h3.state.collection}/`, "");
  return h(
    `div.tile.d-flex.flex-row${h3.state.selection === id ? ".selected" : ""}`,
    {
      data: { id },
      $onrender: (node) =>
        h3.state.selection === node.dataset.id &&
        setTimeout(() => node.scrollIntoViewIfNeeded(), 0),
      onclick: (e) => select(e.currentTarget.dataset.id),
    },
    [
      h(
        "div.tile-icon.d-flex.flex-column.flex-items-center.flex-justify-center.p-2",
        octicon(icon, { height: 32 })
      ),
      h("div.tile-body", [
        h("p.tile-title", item.data.title),
        h("div.tile-data", {
          $html: `${type} &middot; ${date.toDateString()} @ ${date.toLocaleTimeString()}`,
        }),
      ]),
    ]
  );
};
