import h3 from "../h3.js";
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
  return h3(
    `div.d-flex.flex-row.flex-justify-between.flex-items-center.flash.flash-${
      type || "info"
    }`,
    [
      h3("div.flash-message", message),
      h3("div.flash-actions.d-flex.flex-row.flex-items-center", [

        dismiss &&
          cancelAction &&
          h3(
            `button.flash-close`,
            { onclick: cancelAction },
            h3(octicon("x", { "aria-label": "Close" }))
          ),
        !dismiss &&
          cancelAction &&
          h3(
            `button.btn.btn-invisible.flash-action`,
            { onclick: cancelAction },
            "Cancel"
          ),
          action &&
          h3(
            `button.btn.btn-${buttonType || "info"}.flash-action`,
            { onclick: action },
            label
          ),
      ]),
    ]
  );
};
