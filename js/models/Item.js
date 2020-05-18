export default class Note {
  constructor(collection) {
    this.collection = collection || "notes";
    this.title = {
      label: "Title",
      name: "title",
      type: "textbox",
      value: "",
      validation: (data) =>
        data.value.length > 0 ? null : "Title is required.",
    };
    if (this.collection === "notes") {
      this.text = {
        label: "Text",
        name: "text",
        type: "markdown",
        value: "",
        validation: (data) =>
          data.value.length > 0 ? null : "Text is required.",
      };
    }
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
