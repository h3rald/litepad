import h3 from "../h3.js";
import octicon from "../services/octicon.js";

export default (actions) => {
  return h3(
    "div.action-bar.form-actions.p-2",
    actions.map((a, index) =>
      h3(
        `button.btn.btn-${a.primary ? "primary" : "invisible"}${
          a.classList && a.classList.length > 0 && "." + a.classList.join(".") || ""
        }.tooltipped.tooltipped-n`,
        {
          "aria-label": a.label,
          id: a.id,
          onclick: a.onclick,
          disabled: a.disabled,
        },
        [octicon(a.icon), h3("span.hide-sm", a.label)]
      )
    )
  );
};
