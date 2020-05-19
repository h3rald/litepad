import h3 from "../h3.js";
import { getIcon, getObject } from "../services/utils.js";
import octicon from "../services/octicon.js";

export default ({ collection }) => {
  const icon = getIcon(collection);
  const object = getObject(collection);
  return h3("div.blankslate", [
    h3("div.icons", [
      octicon(icon, {
        class: "blankslate-icon",
        height: 32,
      }),
    ]),
    h3("h3", `No ${object} selected`),
    h3("p", `Please select a ${object} from the left-hand side.`),
  ]);
};
