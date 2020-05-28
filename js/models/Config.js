export default class Config {
  constructor() {
    this.api = "/docs";
    (this.shortcuts = {
      main: {
        f: "Focus search box",
        down: "Select first/next item from the master list.",
        up: "Select last/previous item from the master list.",
        right: "Go to next page.",
        left: "Go to previous page.",
        r: "Reload data.",
        esc: "Clear search; cancel confirmation.",
        tab: "Go next tab.",
        "shift+tab": "Go to previous tab."
      },
      edit: {},
    }),
      (this.collections = {
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
      });
  }
}
