import h3 from "../h3.js";
import octicon from "../services/octicon.js";

export default (actions) => {
  return h3(
    "div.action-bar.form-actions",
    actions.map((a, index) =>
      h3(
        `button.btn.btn-${index === 0 ? "primary" : "invisible"}`,
        {
          id: a.id,
          onclick: a.onclick,
          disabled: a.disabled,
        },
        [octicon(a.icon), a.label]
      )
    )
  );
};
