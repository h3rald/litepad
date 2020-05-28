import hotkeys from "../../vendor/hotkeys.esm.js";
import h3 from "../h3.js";

hotkeys.filter = function (event) {
  const element = event.target || event.srcElement;
  const tagName = element.tagName;
  if (event.code === "Escape") {
    return true;
  }
  if (
    tagName === "INPUT" ||
    tagName === "SELECT" ||
    tagName === "TEXTAREA" ||
    element.classList.contains("CodeMirror-code")
  ) {
    return false;
  }
  return true;
};

const shortcut = (key, scope, handler) => {
  hotkeys(key, scope, (e) => {
    e.preventDefault();
    handler(e);
    return false;
  });
};

const mainShortcut = (key, handler) => shortcut(key, "main", handler);

const editShortcut = (key, handler) => shortcut(key, "edit", handler);

const globalShortcut = (key, handler) => shortcut(key, "all", handler);

mainShortcut("f", () => {
  document.getElementById("search").focus();
});

mainShortcut("r", () => {
  h3.navigateTo(`/${h3.state.collection}`, { reload: true });
});

mainShortcut("tab", () => {
  const collections = Object.keys(h3.state.config.collections);
  const collection = h3.state.collection;
  const index = collections.indexOf(collection);
  const nextIndex = index >= collections.length - 1 ? 0 : index + 1;
  h3.navigateTo(`/${collections[nextIndex]}`);
});

mainShortcut("shift+tab", () => {
  const collections = Object.keys(h3.state.config.collections);
  const collection = h3.state.collection;
  const index = collections.indexOf(collection);
  const nextIndex = index == 0 ? collections.length - 1 : index - 1;
  h3.navigateTo(`/${collections[nextIndex]}`);
});

mainShortcut("right", () => {
  const page = h3.state.page;
  const total = h3.state.total;
  const limit = h3.state.query.limit;
  const collection = h3.state.collection;
  const pages = Math.ceil(total / limit);
  if (pages.length === 1) {
    return;
  }
  const next = page === pages ? 1 : page + 1;
  h3.navigateTo(`/${collection}/${next}`);
});

mainShortcut("left", () => {
  const page = h3.state.page;
  const total = h3.state.total;
  const limit = h3.state.query.limit;
  const collection = h3.state.collection;
  const pages = Math.ceil(total / limit);
  if (pages.length === 1) {
    return;
  }
  const previous = page === 1 ? pages : page - 1;
  h3.navigateTo(`/${collection}/${previous}`);
});

mainShortcut("down", () => {
  const items = h3.state.items;
  const page = h3.state.page;
  const collection = h3.state.collection;
  const selection = h3.state.selection;
  if (items.length === 0) {
    return;
  }
  if (items.length === 1 || !selection) {
    h3.navigateTo(
      `/${collection}/${page}${items[0].id.replace(collection, "")}`
    );
    return;
  }
  const index = items.findIndex((item) => item.id.match(selection));
  const next = index == items.length - 1 ? 0 : index + 1;
  h3.navigateTo(
    `/${collection}/${page}${items[next].id.replace(collection, "")}`
  );
});

mainShortcut("up", () => {
  const items = h3.state.items;
  const page = h3.state.page;
  const collection = h3.state.collection;
  const selection = h3.state.selection;
  if (items.length === 0) {
    return;
  }
  if (items.length === 1 || !selection) {
    h3.navigateTo(
      `/${collection}/${page}${items[0].id.replace(collection, "")}`
    );
    return;
  }
  const index = items.findIndex((item) => item.id.match(selection));
  const previous = index == 0 ? items.length - 1 : index - 1;
  h3.navigateTo(
    `/${collection}/${page}${items[previous].id.replace(collection, "")}`
  );
});

mainShortcut("d", () => {
  document.getElementById("delete").click();
});

mainShortcut("c", () => {
  document.getElementById("copy").click();
});

mainShortcut("e,space,enter", () => {
  document.getElementById("edit").click();
});

mainShortcut("a", () => {
  document.getElementById("add").click();
});

globalShortcut("esc", (e) => {
  if (h3.state.flags.alert && h3.state.flags.alert.cancelAction) {
    h3.state.flags.alert.cancelAction();
  }
});

globalShortcut("enter", () => {
  if (h3.state.flags.alert && h3.state.flags.alert.action) {
    h3.state.flags.alert.action();
  }
});

editShortcut("tab", () => {
  const controls = document.getElementsByClassName("focusable-input");
  let focusedIndex = -1;
  for (let i = 0; i < controls.length - 1; i++) {
    if (controls[i] === document.activeElement) {
      focusedIndex = i;
      break;
    }
  }
  const index =
    focusedIndex >= 0 && focusedIndex < controls.length - 1
      ? focusedIndex + 1
      : 0;
  controls[index].focus();
});

editShortcut("s,ctrl+s", () => {
  document.getElementById("save").click();
});

editShortcut("b,ctrl+b", () => {
  document.getElementById("back").click();
});

const shortcutsFor = (scope) => {
  hotkeys.setScope(scope);
};

export { shortcutsFor };
