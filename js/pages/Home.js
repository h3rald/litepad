import h3 from "../h3.js";
import Page from "../controls/Page.js";
import { routeComponent, getType } from "../services/utils.js";
import { getItems, getItem, deleteItem } from "../services/api.js";
import { getObject, getIcon } from "../services/utils.js";
import octicon from "../services/octicon.js";
import ActionBar from "../controls/ActionBar.js";
import Tile from "../controls/Tile.js";
import DOMPurify from "../../vendor/purify.es.js";
import marked from "../../vendor/marked.js";
import TabNav from "../controls/TabNav.js";
import Config from "../models/Config.js";
import Loading from "../controls/Loading.js";

const loadItems = async (collection) => {
  const items = (await getItems(collection, h3.state.query)).results;
  h3.dispatch("items/set", items);
};

const init = async () => {
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
  if (!h3.state.collection) {
    // First redraw
    return Loading();
  }
  const add = () => h3.navigateTo(`/${h3.state.collection}/add`);
  const notSelected = h3("div.blankslate", [
    h3("div.icons", [
      octicon(getIcon(h3.state.collection), {
        class: "blankslate-icon",
        height: 32,
      }),
    ]),
    h3("h3", `No ${getObject(h3.state.collection)} selected`),
    h3(
      "p",
      `Please select a ${getObject(
        h3.state.collection
      )} from the left-hand side.`
    ),
  ]);
  const empty = h3("div.blankslate", [
    h3("div.icons", [
      octicon(getIcon(h3.state.collection), {
        class: "blankslate-icon",
        height: 32,
      }),
    ]),
    h3("h3", "No data"),
    h3("p", `There are no ${h3.state.collection}.`),
    h3(
      "button.btn.btn-primary",
      { type: "button", onclick: add },
      `Add a ${getObject(h3.state.collection)}`
    ),
  ]);
  const cancelAction = () => {
    h3.dispatch("alert/clear");
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
          action: async () => {
            const result = await deleteItem(
              h3.state.collection,
              h3.state.selection
            );
            if (result) {
              h3.dispatch("alert/clear");
              h3.navigateTo(`/${h3.state.collection}`);
              await loadItems(h3.state.collection);
            }
            h3.redraw();
          },
          cancelAction,
          message: `Do you really want to delete ${getType(
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
    h3.state.items.length === 0
      ? empty
      : h3("div.master-detail.d-flex", [
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
    content,
  });
};

Home.init = init;

export default Home;
