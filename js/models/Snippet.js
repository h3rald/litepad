import Item from "./Item.js";

export default class Snippet extends Item {

  constructor(){
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
  }

  set(snippet) {
    super.set(snippet);
    this.code.value = snippet.data.code;
  }

  get() {
    return {
      ...super.get(),
      code: this.code.value
    }
  }
}