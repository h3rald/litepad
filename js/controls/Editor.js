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

// See: https://stackoverflow.com/questions/4817029/whats-the-best-way-to-detect-a-touch-screen-device-using-javascript
const isTouchDevice = () => {
  const prefixes = " -webkit- -moz- -o- -ms- ".split(" ");
  const mq = (query) => window.matchMedia(query).matches;
  if (
    "ontouchstart" in window ||
    (window.DocumentTouch && document instanceof DocumentTouch)
  ) {
    return true;
  }
  const query = ["(", prefixes.join("touch-enabled),("), "heartz", ")"].join(
    ""
  );
  return mq(query);
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
            document.activeElement.blur();
          });
          if (["text/javascript", "text/html", "text/css"].includes(mode)) {
            editor.constructor.Vim.defineOperator("indentAuto", (cm) => {
              let code;
              if (cm.options.mode === "text/html") {
                code = html_beautify(cm.getValue(), {
                  indent_size: 2,
                  preserve_newlines: false,
                });
              } else if (cm.options.mode === "text/css") {
                code = css_beautify(cm.getValue(), {
                  indent_size: 2,
                  preserve_newlines: false,
                });
              } else if (cm.options.mode === "text/javascript") {
                code = js_beautify(cm.getValue(), {
                  indent_size: 2,
                  preserve_newlines: false,
                  break_chained_methods: true,
                });
              }
              cm.setValue(code);
            });
          }
          if (mode === "gfm") {
            editor.setOption("extraKeys", {
              Enter: "newlineAndIndentContinueMarkdownList",
            });
          }
          if (!isTouchDevice() && window.innerWidth > 500) {
            editor.constructor.Vim.map(",,", "`", "insert");
            editor.on("focus", () => editor.setOption("keyMap", "vim"));
          }
          editor.on("blur", () => editor.setOption("keyMap", {}));
          editor.display.wrapper.classList.add("editable");
          if (["text/css", "text/html", "text/javascript"].includes(mode)) {
            editor.setOption("lint", { esversion: 6 });
          }
          editor.setOption("htmlMode", true);
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
