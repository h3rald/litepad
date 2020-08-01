import { h3, h } from "../h3.js";
import Editor from "./Editor.js";

export default (props) => {
  props.placeholder = props.placeholder || "";
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
    h(`input.form-control.focusable-input`, {
      type: "text",
      placeholder,
      value: props.value,
      oninput,
    });
  controls.textarea = () =>
    h(
      `textarea.form-control`,
      {
        placeholder,
        oninput,
      },
      props.value || ""
    );
  controls.editor = () => Editor(props, oninput);
  controls.radio = () =>
    h(
      `div`,
      options.map((o) => {
        return h("label.radio", [
          h(`input`, { type: "radio", name, value: o.value, oninput }),
          ` ${o.label || o.value}`,
        ]);
      })
    );
  controls.dropdown = () =>
    h(
      "div.select",
      h(
        "select.form-control.focusable-input",
        { name, oninput, value },
        options.map((o) =>
          h("option", { value: o.value, selected: o.value === value }, o.label)
        )
      )
    );
  controls.checkbox = () =>
    h("div", [
      h(`input.form-control`, {
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
  let groupClassList = [];
  let groupBodyClassList = [];
  if (type === "editor") {
    groupClassList = ".d-flex.flex-column.flex-1";
    groupBodyClassList = ".d-flex.flex-column.flex-1";
  }
  return h(
    `div.form-group.d-flex.flex-1.flex-column${props.invalid ? ".errored" : ""}${groupClassList}`,
    [
      editable !== false &&
        h("div.form-group-header", [h("label", { for: name }, `${label}:`)]),
      h(`div.form-group-body${groupBodyClassList}`, [
        control,
        props.invalid && h(`p.note.error.${type}`, props.invalid),
      ]),
    ]
  );
};
