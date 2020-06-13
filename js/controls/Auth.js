import h3 from "../h3.js";
import { getIcon, getObject } from "../services/utils.js";
import octicon from "../services/octicon.js";
import { authorize } from "../services/auth.js";

export default () => {
  const onclick = () => {
    authorize();
  };
  return h3("div.blankslate.d-flex.flex-column.flex-1", [
    h3("p", "You are not authorized to access this service."),
    h3(
      "button.btn.btn-primary.d-flex.flex-self-center",
      { type: "button", onclick },
      [
        `Sign In With GitHub`,
        h3("span", { style: "margin-left: 5px;" }, octicon("mark-github")),
      ]
    ),
  ]);
};
