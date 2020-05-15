import h3 from "../h3.js";

export default (props) => {
  const { content, title } = props;
  return h3("div.page", [
    h3("div.Header", [
      h3("div.Header-item", ["LitePad"]),
      h3("div.Header-item", [
        h3("input.form-control.input-dark", {
          type: "text",
          placeholder: "Search...",
        }),
      ]),
    ]),
    h3("div.Main.p-4", [
      title && h3("h1.page-title", title),
      content && h3("div.page-content", content),
    ]),
  ]);
};
