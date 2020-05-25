import h3 from "../h3.js";

const EditorOptions = {
  tabSize: 2,
  autoCloseBrackets: true,
  matchBrackets: true,
  foldGutter: true,
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

export default (props, oninput) => {
  const { editable, placeholder, mode } = props;
  return h3(
    `textarea.form-control`,
    {
      placeholder,
      data: {
        mode,
      },
      style: "opacity: 0;min-height:0;height:0;padding:0;border:0;",
      $onrender: (element) => {
        const editor = CodeMirror.fromTextArea(element, {
          ...EditorOptions,
          readOnly: editable === false,
          mode,
        });
        editor.display.wrapper.classList.add(
          "form-control",
          "d-flex",
          "flex-column",
          "flex-1"
        );
        if (props.editable !== false) {
          editor.constructor.Vim.defineEx("wq", null, (cm) => {
            document.getElementById("save").click();
          });
          editor.constructor.Vim.defineEx("q", null, (cm) => {
            document.getElementById("back").click();
          });
          editor.on("focus", () => editor.setOption("keyMap", "vim"));
          editor.on("blur", () => editor.setOption("keyMap", {}));
          editor.display.wrapper.classList.add("editable");
          editor.setOption("lint", { esversion: 6 });
          editor.setOption("htmlMode", true);
          editor.setOption("extraKeys", EditorShortcuts);
        }
        setTimeout(() => void editor.refresh(), 0);
        editor.on("change", (cm) => {
          oninput({ target: { value: cm.doc.getValue() } });
        });
        props.editor = editor;
      },
    },
    props.value || ""
  );
};
