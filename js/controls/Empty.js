import h3 from "../h3.js";
import { getIcon, getObject } from "../services/utils.js";
import octicon from "../services/octicon.js";

export default ({ collection, add }) => {
  const icon = getIcon(collection);
  const object = getObject(collection);
  h3("div.blankslate", [
    h3("div.icons", [
      octicon(icon, {
        class: "blankslate-icon",
        height: 32,
      }),
    ]),
    h3("h3", "No data"),
    h3("p", `There are no ${collection}.`),
    h3(
      "button.btn.btn-primary",
      { type: "button", onclick: add },
      `Add a ${object}`
    ),
  ]);
};