import h3 from "../h3.js";
import octicon from "../services/octicon.js";

export default () =>
  h3("div.overlay", [
    h3("div.overlay-popup.Box.Box-condensed", [
      h3("div.Box-header.d-flex", [h3("h3.Box-title.d-flex.flex-auto", "Keyboard Shortcuts"), h3("a", {onclick: () => {
        h3.dispatch("help/toggle");
        h3.redraw();
      }}, [
        octicon("x"),
      ])]),
      h3(
        "div.Box-body",
        Object.keys(h3.state.config.shortcuts[h3.state.flags.location]).map((key) => {
          return h3("div.Box-row.shortcut.d-flex.p-2", [
            h3("div.shortcut-key.d-flex", key),
            h3("div.shortcut-action.d-flex.flex-1", h3.state.config.shortcuts[h3.state.flags.location][key]),
          ]);
        })
      ),
    ]),
  ]);
