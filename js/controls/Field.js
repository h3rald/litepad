import h3 from "../h3.js";
import Editor from "./Editor.js";

export default (props) => {
  const {
    label,
    name,
    type,
    mode,
    value,
    placeholder,
    options,
    editable,
    activate,
    onchange,
    validation,
  } = props;
  const oninput = (e) => {
    const el = e.target;
    let obj;
    if (el.type === "checkbox") {
      obj = props.values[e.target.name];
      obj.oldValue = obj.value;
      obj.value = el.checked;
    } else {
      obj = props;
      obj.oldValue = obj.value;
      obj.value = el.value;
    }
    const wasInvalid = obj.invalid;
    obj.invalid = validation && validation(obj);
    const activate = props.activate;
    if (props.activate) {
      props.activate = false;
    }
    onchange && onchange(e);
    wasInvalid != obj.invalid && !activate && h3.redraw();
  };
  if (activate) {
    oninput({ target: props });
  }
  const controls = {};
  controls.textbox = () =>
    h3(`input.form-control`, {
      type: "text",
      placeholder,
      value: props.value,
      oninput,
    });
  controls.textarea = () =>
    h3(
      `textarea.form-control`,
      {
        placeholder,
        oninput,
      },
      props.value || ""
    );
  controls.editor = () => Editor({...props, oninput});
  controls.radio = () =>
    h3(
      `div`,
      options.map((o) => {
        return h3("label.radio", [
          h3(`input`, { type: "radio", name, value: o.value, oninput }),
          ` ${o.label || o.value}`,
        ]);
      })
    );
  controls.dropdown = () =>
    h3(
      "div.select",
      h3(
        "select.form-control",
        { name, oninput, value },
        options.map((o) =>
          h3("option", { value: o.value, selected: o.value === value }, o.label)
        )
      )
    );
  controls.checkbox = () =>
    h3("div", [
      h3(`input.form-control`, {
        type: "checkbox",
        checked: !!props.value,
        value: props.value,
        oninput,
      }),
      ` ${label || props.value}`,
    ]);
  const control =
    editable === false && type !== "editor"
      ? String(props.value)
      : controls[type || "textbox"]();
  return h3(`div.form-group${props.invalid ? ".errored" : ""}`, [
    h3("div.form-group-header", [
      editable !== false && h3("label", { for: name }, `${label}:`),
    ]),
    h3("div.form-group-header", [
      control,
      props.invalid && h3("p.note.error", props.invalid),
    ]),
  ]);
};
