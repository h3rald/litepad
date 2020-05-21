import Item from "./Item.js";

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
        this.code.mode = e.currentTarget.value;
        this.code.editor.setOption("mode", this.code.mode);
      },
      options: [
        {
          label: "JavaScript",
          value: "javascript",
        },
        {
          label: "HTML",
          value: "xml",
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
    this.code.mode = snippet.data.language;
  }

  get() {
    return {
      ...super.get(),
      language: this.language.value,
      code: this.code.value,
    };
  }
}
