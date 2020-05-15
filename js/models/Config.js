export default class Config {
  constructor() {
    this.api = "/docs";
    this.collections = {
      notes: {
        icon: "file",
        type: "Note",
      },
    };
  }
}
