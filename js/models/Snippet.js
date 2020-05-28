import Item from "./Item.js";

const modes = {
  javascript: "text/javascript",
  typescript: "application/typescript",
  jsx: "text/jsx",
  tsx: "text/typescript-jsx",
  json: "application/json",
  html: "text/html",
  css: "text/css"
}

export default class Snippet extends Item {
  constructor() {
    super();
    this.code = {
      label: "Code",
      name: "code",
      type: "editor",
      mode: "javascript",
      value: "",
      validation: (data) =>
        data.value.length > 0 ? null : "Code is required.",
    };
    this.language = {
      label: "Language",
      name: "language",
      type: "dropdown",
      value: "javascript",
      onchange: (e) => {
        this.code.mode = modes[e.currentTarget.value];
        this.code.editor.setOption("mode", this.code.mode);
      },
      options: [
        {
          label: "JavaScript",
          value: "javascript",
        },
        {
          label: "JSON",
          value: "json",
        },
        {
          label: "TypeScript",
          value: "typescript",
        },
        {
          label: "JSX",
          value: "jsx",
        },
        {
          label: "TSX",
          value: "tsx",
        },
        {
          label: "HTML",
          value: "html",
        },
        {
          label: "CSS",
          value: "css",
        },
      ],
    };
  }

  set(snippet) {
    super.set(snippet);
    this.language.value = snippet.data.language;
    this.code.value = snippet.data.code;
    this.code.mode = modes[snippet.data.language];
  }

  get() {
    return {
      ...super.get(),
      language: this.language.value,
      code: this.code.value,
    };
  }
}
