import { h3, h } from "../h3.js";
import { getIcon, getObject } from "../services/utils.js";
import octicon from "../services/octicon.js";

export default ({ collection, add }) => {
  const icon = getIcon(collection);
  const object = getObject(collection);
  return h("div.blankslate.d-flex.flex-column.flex-1", [
    h("div.icons", [
      octicon(icon, {
        class: "blankslate-icon",
        height: 32,
      }),
    ]),
    h("h3", "No data"),
    h(
      "p",
      `There are no ${collection}${
        h3.route.params.q ? " matching the specified criteria" : ""
      }.`
    ),
    !h3.route.params.q &&
      h(
        "button.btn.btn-primary.d-flex.flex-self-center",
        { type: "button", onclick: add },
        `Add a ${object}`
      ),
  ]);
};
