import h3 from "../h3.js";
import Page from "../controls/Page.js";
import { icon } from "../services/icons.js";

const title = "Somethin' new";
export default (props) => {
  const save = () => {};
  const cancel = () => h3.navigateTo("/");
  const content = h3("div.content", [
    h3("form", [
      h3("div.form-actions", [
        h3("button.btn.btn-primary", { onclick: save }, "Make it so!"),
        h3("button.btn.btn-invisible", { onclick: cancel }, "Only kiddin'"),
      ]),
      h3("div.form-group", [
        h3("div.form-group-body", [
          h3("label", { for: "item-title" }, "Title: "),
          h3("input#item-title.form-control", { type: "text" }),
        ]),
      ]),
      h3("div.form-group", [
        h3("div.form-group-header", [
          h3("label", { for: "item-text" }, "Text: "),
        ]),
        h3("div.form-group-body", [h3("textarea#item-text.form-control")]),
      ]),
    ]),
  ]);
  return Page({ title, content });
};
