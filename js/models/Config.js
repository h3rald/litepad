import Snippet from "./Snippet.js";
import Note from "./Item.js";

export default class Config {
  constructor() {
    this.api = "/docs";
    this.clientId = "aceeb0ae519a948dd0dc";
    this.storage = "litestore";
    this.shortcuts = {
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
    };
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
    this.types = {
      snippets: Snippet,
      notes: Note,
    };
    this.languages = {
      javascript: {
        name: "JavaScript",
        extension: "js",
        mode: "text/javascript",
      },
      typescript: {
        name: "TypeScript",
        extension: "ts",
        mode: "application/typescript",
      },
      jsx: {
        name: "JSX",
        extension: "jsx",
        mode: "text/jsx",
      },
      tsx: {
        name: "TSX",
        extension: "tsx",
        mode: "text/typescript-jsx",
      },
      json: {
        name: "JSON",
        extension: "json",
        mode: "application/json",
      },
      html: {
        name: "HTML",
        extension: "html",
        mode: "text/html",
      },
      css: {
        name: "CSS",
        extension: "css",
        mode: "text/css",
      },
    };
  }
}
