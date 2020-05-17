import h3 from "../h3.js";
import octicon from "../services/octicon.js";

export default (props) => {
  const { type, buttonType, action, cancelAction, label, message } = props;
  return h3(`div.flash.flash-${type || "info"}`, [
    action &&
      h3(
        `button.btn.btn-${buttonType || "info"}.flash-action`,
        { onclick: action },
        label
      ),
    cancelAction &&
      h3(
        `button.btn.btn-invisible.flash-action`,
        { onclick: cancelAction },
        "Naaah..."
      ),
    message,
  ]);
};
