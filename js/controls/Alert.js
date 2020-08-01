import { h3, h } from "../h3.js";
import octicon from "../services/octicon.js";

export default ({
  type,
  buttonType,
  action,
  cancelAction,
  label,
  message,
  dismiss,
}) => {
  return h(
    `div.d-flex.flex-row.flex-justify-between.flex-items-center.flash.flash-${
      type || "info"
    }`,
    [
      h("div.flash-message", message),
      h("div.flash-actions.d-flex.flex-row.flex-items-center", [

        dismiss &&
          cancelAction &&
          h(
            `button.flash-close`,
            { onclick: cancelAction },
            h(octicon("x", { "aria-label": "Close" }))
          ),
        !dismiss &&
          cancelAction &&
          h(
            `button.btn.btn-invisible.flash-action`,
            { onclick: cancelAction },
            "Cancel"
          ),
          action &&
          h(
            `button.btn.btn-${buttonType || "info"}.flash-action`,
            { onclick: action, id: "alert-confirm" },
            label
          ),
      ]),
    ]
  );
};
