import h3 from "../h3.js";

export default class Note {
  constructor() {
    this.title = {
      label: "Title",
      name: "title",
      type: "textbox",
      value: "",
      validation: (data) =>
        data.value.length > 0 ? null : "Title is required.",
    };
    this.type = {
      label: "Type",
      name: "type",
      type: "dropdown",
      onchange: () =>  h3.redraw(),
      value: "note",
      options: [
        { label: "Note", value: "note" },
        { label: "Code Snippet", value: "snippet" },
      ],
    };
    this.text = {
      label: "Text",
      name: "text",
      type: "markdown",
      value: "",
      validation: (data) =>
        data.value.length > 0 ? null : "Text is required.",
    };
  }

  set(item) {
    const { title, text } = item.data;
    this.title.value = title;
    if (text) {
      this.text.value = text;
    }
  }

  get() {
    const result = {};
    result.title = this.title.value;
    if (this.text) {
      result.text = this.text.value;
    }
    return result;
  }

  validate() {
    let invalid = false;
    Object.keys(this).forEach((k) => {
      const f = this[k];
      if (typeof f === "object" && f.validation && f.validation(f)) {
        f.activate = true;
        invalid = true;
      }
    });
    return !invalid;
  }
}
