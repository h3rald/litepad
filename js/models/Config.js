export default class Config {
  constructor() {
    this.api = "/docs";
    this.collections = {
      notes: {
        typeIcon: "file",
        type: "Note",
        icon: "markdown",
      },
      snippets: {
        typeIcon: "file-code",
        type: "Snippet",
        icon: "code",
      },
    };
  }
}
