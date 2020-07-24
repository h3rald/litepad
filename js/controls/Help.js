import { h3, h } from "../h3.js";
import octicon from "../services/octicon.js";

export default () =>
  h("div.overlay", [
    h("div.overlay-popup.Box.Box-condensed", [
      h("div.Box-header.d-flex", [h("h3.Box-title.d-flex.flex-auto", "Keyboard Shortcuts"), h("a", {onclick: () => {
        h3.dispatch("help/toggle");
        h3.redraw();
      }}, [
        octicon("x"),
      ])]),
      h(
        "div.Box-body",
        Object.keys(h3.state.config.shortcuts[h3.state.flags.location]).map((key) => {
          return h("div.Box-row.shortcut.d-flex.p-2", [
            h("div.shortcut-key.d-flex", key),
            h("div.shortcut-action.d-flex.flex-1", h3.state.config.shortcuts[h3.state.flags.location][key]),
          ]);
        })
      ),
    ]),
  ]);
