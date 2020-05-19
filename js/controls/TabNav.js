import h3 from "../h3.js";
import octicon from "../services/octicon.js";

export default ({ tabs, title, extras }) => {
  return h3("div.tabnav", [
    extras && h3("div.tabnav-extra.float-right", extras),
    h3(
      "nav.tabnav-tabs",
      { "aria-label": title },
      tabs.map((tab) => {
        return h3(
          `a.tabnav-tab${tab.selected ? ".selected" : ""}`,
          {
            data: { title: tab.title },
            onclick: tab.onclick,
            "aria-current": tab.selected ? "page" : false,
          },
          [tab.icon && octicon(tab.icon), tab.title]
        );
      })
    ),
  ]);
};
