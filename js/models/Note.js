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
    this.text = {
      label: "Text",
      name: "text",
      type: "markdown",
      value: "",
      validation: (data) =>
        data.value.length > 0 ? null : "Text is required.",
    };
  }

  set(data) {
    const { title, text } = data;
    this.title.value = title;
    this.text.value = text;
  }

  get() {
    return {
      title: this.title.value,
      text: this.text.value,
    };
  }

  validate() {
    let invalid = false;
    Object.keys(this).forEach((k) => {
      const f = this[k];
      if (f.validation && f.validation(f)) {
        f.activate = true;
        invalid = true;
      }
    });
    return !invalid;
  };
}
