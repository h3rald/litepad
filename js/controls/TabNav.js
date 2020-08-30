import { h3, h } from "../h3.js";
import octicon from "../services/octicon.js";

export default ({ tabs, title, extras }) => {
  return h("div.tabnav", [
    extras && h("div.tabnav-extra.float-right", extras),
    h(
      "nav.tabnav-tabs",
      { "aria-label": title },
      tabs.map((tab) => {
        return h(
          `a.tabnav-tab${tab.selected ? ".selected" : ""}`,
          {
            data: { title: tab.title },
            onclick: tab.onclick,
            "aria-current": tab.selected ? "page" : false,
          },
          [tab.icon && octicon(tab.icon), h("span.hide-sm", tab.title)]
        );
      })
    ),
  ]);
};
