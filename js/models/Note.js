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
    super.set(note);
    this.text.value = note.data.text;
  }

  get() {
    return {
      ...super.get(),
      text: this.text.value
    }
  }
}