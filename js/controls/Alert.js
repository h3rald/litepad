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
  return h3(`div.flash.flash-${type || "info"}`, [
    dismiss &&
      cancelAction &&
      h3(
        `button.flash-close`,
        { onclick: cancelAction },
        h3(octicon("x", { "aria-label": "Close" }))
      ),
    action &&
      h3(
        `button.btn.btn-${buttonType || "info"}.flash-action`,
        { onclick: action },
        label
      ),
    !dismiss &&
      cancelAction &&
      h3(
        `button.btn.btn-invisible.flash-action`,
        { onclick: cancelAction },
        "Cancel"
      ),
    message,
  ]);
};
