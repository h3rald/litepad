import h3 from "../h3.js";
import Loading from "./Loading.js";
import Alert from "./Alert.js";
import octicon from "../services/octicon.js";

export default ({ content }) => {
  return h3("div.page", [
    h3("div.Header", [
      h3("div.Header-item", [
        h3("a.Header-link.logo", { onclick: () => h3.navigateTo("/") }, [
          octicon("repo", {height: 24}),
          "LitePad",
        ]),
      ]),
      !h3.route.def.match(/(add|edit)$/) && h3("div.Header-item", [
        h3("input.form-control.input-dark.search", {
          type: "text",
          placeholder: `Search ${h3.state.collection}...`,
        }),
      ]),
    ]),
    h3.state.flags.loading
      ? Loading
      : h3("div.Main.px-6.py-4", [
          h3.state.flags.alert && Alert(h3.state.flags.alert),
          h3("div.page-content", content),
        ]),
  ]);
};
