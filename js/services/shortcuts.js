import hotkeys from "../../vendor/hotkeys.esm.js";
import h3 from "../h3.js";

const mainShortcut = (key, handler) => {
  hotkeys(key, "main", (e) => {
    e.preventDefault();
    handler(e);
    return false;
  });
};

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

const shortcutsFor = (scope) => {
  hotkeys.setScope(scope);
};

export { shortcutsFor };
