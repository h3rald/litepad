import Item from "./Item.js";
import h3 from "../h3.js";

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
        this.code.mode = h3.state.config.languages[e.currentTarget.value].mode;
        this.code.editor.setOption("mode", this.code.mode);
      },
      options: Object.entries(h3.state.config.languages).map((e) => ({
        label: e[1].name,
        value: e[0],
      })),
    };
  }

  set(snippet) {
    super.set(snippet);
    this.language.value = snippet.data.language;
    this.code.value = snippet.data.code;
    this.code.mode = h3.state.config.languages[snippet.data.language].mode;
  }

  get() {
    return {
      ...super.get(),
      language: this.language.value,
      code: this.code.value,
    };
  }
}
