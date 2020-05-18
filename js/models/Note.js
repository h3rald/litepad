import Item from "./Item.js";

export default class Note extends Item {

  constructor(){
    super();
    this.text = {
      label: "Text",
      name: "text",
      type: "editor",
      mode: "gfm",
      value: "",
      validation: (data) =>
        data.value.length > 0 ? null : "Text is required.",
    };
  }

  set(note) {
    super(note);
    this.text = note.text.value;
  }

  get() {
    return {
      ...super(),
      text: this.text.value
    }
  }
}