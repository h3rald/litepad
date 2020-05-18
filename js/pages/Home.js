import h3 from "../h3.js";
import Page from "../controls/Page.js";
import { routeComponent, getType } from "../services/utils.js";
import { getItems, getItem, deleteItem } from "../services/api.js";
import octicon from "../services/octicon.js";
import ActionBar from "../controls/ActionBar.js";
import Tile from "../controls/Tile.js";
import DOMPurify from "../../vendor/purify.es.js";
import marked from "../../vendor/marked.js";

const title = "Home";

const loadItems = async () => {
  const items = (await getItems(h3.state.query)).results;
  h3.dispatch("items/set", items);
};

const init = async (state) => {
  const selection = h3.route.params.s;
  selection
    ? h3.dispatch("selection/set", selection)
    : h3.dispatch("selection/clear");
  h3.state.items.length === 0 && h3.dispatch("loading/set");
  let items = h3.state.items;
  let redraw = false;
  if (items.length === 0) {
    await loadItems();
  }
  if (selection) {
    const item = await getItem(selection.replace(".", "/"));
    h3.dispatch("item/set", item);
  } else {
    h3.dispatch("item/set", null);
  }
  h3.dispatch("loading/clear");
  h3.redraw();
};

const render = (state) => {
  const add = () => h3.navigateTo("/add");
  const notSelected = h3("div.blankslate", [
    h3("div.icons", [
      octicon("file", { class: "blankslate-icon", height: 32 }),
      octicon("file-code", { class: "blankslate-icon", height: 32 }),
      octicon("checklist", { class: "blankslate-icon", height: 32 }),
    ]),
    h3("h3", "Nothin'"),
    h3("p", "There ain't nothin' selected."),
    h3("p", "Just select an item on the left, will ya?"),
  ]);
  const empty = h3("div.blankslate", [
    h3("div.icons", [
      octicon("file", { class: "blankslate-icon", height: 32 }),
      octicon("file-code", { class: "blankslate-icon", height: 32 }),
      octicon("checklist", { class: "blankslate-icon", height: 32 }),
    ]),
    h3("h3", "Nothin'"),
    h3("p", "There ain't nothin' here. Too bad."),
    h3(
      "button.btn.btn-primary",
      { type: "button", onclick: add },
      "Add some stuff"
    ),
  ]);
  const cancelAction = () => {
    h3.dispatch("alert/clear");
    h3.redraw();
  };
  const actions = [
    { onclick: () => h3.navigateTo("/add"), icon: "plus", label: "Add" },
    {
      onclick: () => h3.navigateTo(`/edit/${h3.state.flags.selection}`),
      icon: "pencil",
      label: "Edit",
      disabled: !h3.state.flags.selection,
    },
    {
      onclick: () => {
        const error = {
          type: "error",
          message: `Can't do it. Something bad happened, tough luck!`,
          cancelAction,
          dismiss: true,
        };
        const confirm = {
          type: "warn",
          buttonType: "danger",
          label: "Aye, scrap it!",
          action: async () => {
            await deleteItem(h3.state.flags.selection.replace(".", "/"));
            h3.dispatch("alert/clear");
            h3.navigateTo("/");
            await loadItems();
            h3.redraw();
          },
          cancelAction,
          message: `Oi! Do ya really wanna scrap ${getType(
            h3.state.item.id
          )} '${h3.state.item.data.title}'?!`,
        };
        h3.dispatch("alert/set", confirm);
        h3.redraw();
      },
      icon: "trashcan",
      label: "Delete",
      disabled: !h3.state.flags.selection,
    },
  ];
  const content = h3("div.content", [
    h3("p", [ActionBar(actions), `Total items: ${h3.state.items.length}`]),
    h3("div.master-detail.d-flex", [
      h3(
        "div.master.item-list",
        h3.state.items.map((item) => {
          return Tile({ item });
        })
      ),
      h3.state.item
        ? h3("div.detail.px-4.flex-auto", [
            h3("h2", h3.state.item.data.title),
            h3("div.markdown", {
              $html: marked(DOMPurify.sanitize(h3.state.item.data.text)),
            }),
          ])
        : h3("div.detail.flex-auto", notSelected),
    ]),
  ]);
  return Page({
    title,
    content: h3.state.items.length === 0 ? empty : content,
  });
};

export default routeComponent({ render, init });
