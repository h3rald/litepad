import { h3, h } from "../h3.js";
import { getIcon, getObject } from "../services/utils.js";
import octicon from "../services/octicon.js";

export default ({ collection }) => {
  const icon = getIcon(collection);
  const object = getObject(collection);
  return h("div.blankslate", [
    h("div.icons", [
      octicon(icon, {
        class: "blankslate-icon",
        height: 32,
      }),
    ]),
    h("h3", `No ${object} selected`),
    h("p", `Please select a ${object} from the left-hand side.`),
  ]);
};
