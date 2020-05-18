import Item from "./Item.js";

export default class Snippet extends Item {

  constructor(){
    super();
    this.language = {
      label: "Language",
      name: "language",
      type: "dropdown",
      onchange: () =>  h3.redraw(),
      value: "javascript",
      options: [
        { label: "JavaScript", value: "javascript" },
        { label: "HTML", value: "html" },
        { label: "CSS", value: "css" },
      ],
    };
    this.code = {
      label: "Code",
      name: "code",
      type: "editor",
      mode: "javascript",
      value: "",
      validation: (data) =>
        data.value.length > 0 ? null : "Code is required.",
    };
  }

  set(note) {
    super(note);
    this.language = note.language.value;
    this.code = note.code.value;
  }

  get() {
    return {
      ...super(),
      language: this.language.value
      code: this.code.value
    }
  }
}