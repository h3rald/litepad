import h3 from "../h3.js";
import Page from "../controls/Page.js";
import { icon } from "../services/icons.js";

const title = "Home";

export default (props) => {
  const add = () => h3.navigateTo("/add");
  const empty = h3("div.blankslate", [
    h3("div.icons", [
      icon("note", { class: "blankslate-icon", height: 32 }),
      icon("checklist", { class: "blankslate-icon", height: 32 }),
      icon("code", { class: "blankslate-icon", height: 32 }),
    ]),
    h3("h3", "Nothin'"),
    h3("p", "There ain't nothin' here. Too bad."),
    h3(
      "button.btn.btn-primary",
      { type: "button", onclick: add },
      "Add some stuff"
    ),
  ]);
  const content = empty;
  return Page({ title, content });
};
