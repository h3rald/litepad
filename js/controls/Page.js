import { h3, h } from "../h3.js";
import Loading from "./Loading.js";
import Alert from "./Alert.js";
import octicon from "../services/octicon.js";
import Help from "./Help.js";

export default ({ content }) => {
  return h("div.page.d-flex.flex-column", [
    h3.state.flags.help && Help,
    h("div.Header", [
      h("div.Header-item", [
        h("a.Header-link.logo", { onclick: () => h3.navigateTo("/") }, [
          octicon("repo", { height: 24 }),
          "LitePad",
        ]),
      ]),
      !h3.route.def.match(/(add|edit)$/) &&
        h("div.Header-item", [
          h("input#search.form-control.input-dark.search", {
            type: "text",
            placeholder: `Search ${h3.state.collection}...`,
            onkeypress: (e) => {
              if (e.code === "Enter") {
                h3.dispatch("reload/set", true);
                h3.navigateTo(`/${h3.state.collection}`, {
                  q: e.currentTarget.value,
                });
              }
            },
          }),
        ]),
        h("div.Header-item.flex-1"),
      h("div.Header-item", [
        h(
          "a.Header-link",
          {
            onclick: () => {
              h3.dispatch("help/toggle");
              h3.redraw();
            },
          },
          [octicon("question", { height: 18 })]
        ),
      ]),
    ]),
    h3.state.flags.loading
      ? Loading
      : h("div.Main.px-2.px-sm-2.px-md-2.px-lg-4.py-md-4.py-2.d-flex.flex-1.flex-column", [
          h3.state.flags.alert && Alert(h3.state.flags.alert),
          content,
          h3.state.config.storage === "localStorage" && h("p.storage-notice", "This site persists the contents of notes and snippets to your browser localStorage.")
        ]),
  ]);
};
