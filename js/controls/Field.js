import h3 from "../h3.js";

const EditorOptions = {
  tabSize: 2,
  autoCloseBrackets: true,
  matchBrackets: true,
  foldGutter: true,
  inputStyle: "contenteditable",
  theme: "github",
  gutters: [
    "CodeMirror-linenumbers",
    "CodeMirror-foldgutter",
    "CodeMirror-lint-markers",
  ],
  lineWrapping: true,
  lineNumbers: true,
};

const EditorShortcuts = {
  "Ctrl-F": function (cm) {
    CodeMirror.commands.find(cm);
  },
  "Alt-F": function (cm) {
    CodeMirror.commands.findPersistent(cm);
  },
  "Alt-G": function (cm) {
    CodeMirror.commands.jumpToLine(cm);
  },
  "Ctrl-G": function (cm) {
    CodeMirror.commands.findNext(cm);
  },
  "Shift-Ctrl-G": function (cm) {
    CodeMirror.commands.findPrev(cm);
  },
  "Shift-Ctrl-F": function (cm) {
    CodeMirror.commands.replace(cm);
  },
  "Shift-Ctrl-R": function (cm) {
    CodeMirror.commands.replaceAll(cm);
  },
  "Ctrl-Y": function (cm) {
    CodeMirror.commands.foldAll(cm);
  },
  "Ctrl-I": function (cm) {
    CodeMirror.commands.unfoldAll(cm);
  },
  "Shift-Alt-F": function (cm) {
    var code;
    if (cm.options.mode.name === "xml") {
      code = html_beautify(cm.getValue(), {
        indent_size: 2,
        preserve_newlines: false,
      });
    } else if (cm.options.mode.name === "css") {
      code = css_beautify(cm.getValue(), {
        indent_size: 2,
        preserve_newlines: false,
      });
    } else {
      code = js_beautify(cm.getValue(), {
        indent_size: 2,
        preserve_newlines: false,
        break_chained_methods: true,
      });
    }
    cm.setValue(code);
  },
};

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
  controls.editor = () =>
    h3(
      `textarea.form-control`,
      {
        placeholder,
        data: {
          mode,
        },
        $onrender: (element) => {
          const editor = CodeMirror.fromTextArea(element, {
            ...EditorOptions,
            readOnly: props.editable === false,
            mode: mode,
          });
          console.log(editor, editor.getMode());
          editor.display.wrapper.classList.add("form-control");
          if (props.editable !== false) {
            editor.display.wrapper.classList.add("editable");
            editor.setOption("lint", { esversion: 6 });
            editor.setOption("htmlMode", true);
            editor.setOption("extraKeys", EditorShortcuts);
          }
          setTimeout(() => void editor.refresh(), 0);
          editor.on("change", (cm, change) => {
            oninput({ target: { value: cm.doc.getValue() } });
          });
          props.editor = editor;
        },
      },
      props.value || ""
    );
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
