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
        h3.redraw();
      },
      options: [
        {
          label: "JavaScript",
          value: "javascript",
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
    this.code.value = snippet.data.code;
  }

  get() {
    return {
      ...super.get(),
      code: this.code.value,
    };
  }
}
