import h3 from "../h3.js";
import Loading from "./Loading.js";
import Alert from "./Alert.js";

export default (props) => {
  const { content, title } = props;
  return h3("div.page", [
    h3("div.Header", [
      h3("div.Header-item", [
        h3("a.Header-link", { onclick: () => h3.navigateTo("/") }, "LitePad"),
      ]),
      h3("div.Header-item", [
        h3("input.form-control.input-dark", {
          type: "text",
          placeholder: "Search...",
        }),
      ]),
    ]),
    h3.state.flags.loading
      ? Loading
      : h3("div.Main.px-6.py-4", [
          h3.state.flags.alert && Alert(h3.state.flags.alert),
          title && h3("h1.page-title", title),
          h3("div.page-content", content),
        ]),
  ]);
};
