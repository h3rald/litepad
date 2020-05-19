export default class Config {
  constructor() {
    this.api = "/docs";
    this.collections = {
      notes: {
        icon: "file",
        type: "Note",
      },
      snippets: {
        icon: "file-code",
        type: "Snippet",
      },
    };
  }
}
