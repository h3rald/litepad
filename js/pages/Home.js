import h3 from "../h3.js";
import Page from "../controls/Page.js";
import { getItems, getItem, deleteItem } from "../services/api.js";
import { getIcon, getObject } from "../services/utils.js";
import ActionBar from "../controls/ActionBar.js";
import TabNav from "../controls/TabNav.js";
import MasterDetail from "../controls/MasterDetail.js";

const loadItems = async (collection) => {
  const result = (await getItems(collection, h3.state.query));
  h3.dispatch("items/set", result.results);
  h3.dispatch("total/set", result.total);
};

const enter = async () => {
  const collection = h3.route.parts.collection || "notes";
  const selection = h3.route.parts.id || "";
  let item;
  if (h3.state.collection !== collection || h3.state.items.length === 0) {
    await loadItems(collection);
    h3.dispatch("collection/set", collection);
  }
  if (selection) {
    item = await getItem(collection, selection);
  }
  h3.dispatch("item/set", item);
  h3.dispatch("selection/set", selection);
  h3.dispatch("loading/clear");
};

const Home = () => {
  const add = () => h3.navigateTo(`/${h3.state.collection}/add`);
  const cancelAction = () => h3.dispatch("alert/clear") || h3.redraw();
  const deleteAction = async () => {
    const result = await deleteItem(h3.state.collection, h3.state.selection);
    if (result) {
      h3.dispatch("alert/clear");
      h3.navigateTo(`/${h3.state.collection}`);
      await loadItems(h3.state.collection);
    }
    h3.redraw();
  };
  const actions = [
    {
      onclick: () => h3.navigateTo(`/${h3.state.collection}/add`),
      icon: "plus",
      label: "Add",
    },
    {
      onclick: () =>
        h3.navigateTo(`/${h3.state.collection}/${h3.state.selection}/edit`),
      icon: "pencil",
      label: "Edit",
      disabled: !h3.state.selection,
    },
    {
      onclick: () => {
        const confirm = {
          type: "warn",
          buttonType: "danger",
          label: "Yes, delete!",
          action: deleteAction,
          cancelAction,
          message: `Do you really want to delete ${getObject(
            h3.state.item.id
          )} '${h3.state.item.data.title}'?!`,
        };
        h3.dispatch("alert/set", confirm);
        h3.redraw();
      },
      icon: "trashcan",
      label: "Delete",
      disabled: !h3.state.selection,
    },
    {
      onclick: () => {
        const textArea = document.createElement("textarea");
        textArea.value = h3.state.item.data.text || h3.state.item.data.code;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("Copy");
        textArea.remove();
      },
      icon: "clippy",
      label: "Copy",
      disabled: !h3.state.selection,
    },
  ];
  const tabnav = {
    title: "Main Navigation",
    extras: ActionBar(actions),
    tabs: [
      {
        title: "Notes",
        onclick: async () => {
          if (!h3.route.path.match(/^\/notes/)) {
            h3.navigateTo("/notes");
          }
        },
        selected: h3.state.collection === "notes",
        icon: getIcon("notes"),
      },
      {
        title: "Snippets",
        onclick: async () => {
          if (!h3.route.path.match(/^\/snippet/)) {
            h3.navigateTo("/snippets");
          }
        },
        selected: h3.state.collection === "snippets",
        icon: getIcon("snippets"),
      },
    ],
  };
  const content = h3("div.content", [
    TabNav(tabnav),
    h3("p", [`Total ${h3.state.collection}: `, h3("strong", String(h3.state.total))]),
    MasterDetail({
      items: h3.state.items,
      item: h3.state.item,
      add,
      collection: h3.state.collection,
    }),
  ]);
  return Page({
    content,
  });
};

Home.enter = enter;

export default Home;
