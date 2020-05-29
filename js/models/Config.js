export default class Config {
  constructor() {
    this.api = "/docs";
    (this.shortcuts = {
      main: {
        f: "Focus search box",
        d: "Delete selected item (confirm).",
        e: "Edit selected item.",
        space: "Edit selected item.",
        enter: "Edit selected item; confirm alert.",
        down: "Select first/next item from the master list.",
        up: "Select last/previous item from the master list.",
        right: "Go to next page.",
        h: "Open help.",
        left: "Go to previous page.",
        esc: "Clear search; cancel alert; close help.",
        r: "Reload data.",
        tab: "Cycle tabs.",
      },
      edit: {
        tab: "Focus first input field.",
        h: "Open help.",
        esc: "Cancel alert; close help;",
        enter: "Confirm alert.",
        b: "Go without saving back (confirm).",
        s: "Save current item.",
      },
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
