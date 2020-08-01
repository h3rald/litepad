import { h3, h } from "../h3.js";
import Page from "../controls/Page.js";
import { getItems, getItem, deleteItem } from "../services/api.js";
import { getIcon, getObject } from "../services/utils.js";
import ActionBar from "../controls/ActionBar.js";
import TabNav from "../controls/TabNav.js";
import MasterDetail from "../controls/MasterDetail.js";
import Paginator from "../controls/Paginator.js";
import octicon from "../services/octicon.js";
import { shortcutsFor } from "../services/shortcuts.js";
import { downloadHTML, downloadFile } from "../services/download.js";

const loadItems = async (collection) => {
  const result = await getItems(collection, h3.state.query);
  h3.dispatch("items/set", result.results);
  h3.dispatch("total/set", result.total);
};

const Home = h3.screen({
  setup: async (state) => {
    shortcutsFor("main");
    h3.dispatch("location/set", "main");
    const collection = h3.route.parts.collection || "notes";
    const selection = h3.route.parts.id || "";
    let item;
    const oldPage = h3.state.page;
    h3.dispatch("search/set", h3.route.params.q);
    h3.dispatch("page/set", parseInt(h3.route.parts.page || 1));
    if (
      h3.state.collection !== collection ||
      h3.state.page !== oldPage ||
      h3.state.flags.reload
    ) {
      h3.dispatch("reload/set", false);
      await loadItems(collection);
      h3.dispatch("collection/set", collection);
    }
    if (selection) {
      item = await getItem(collection, selection);
    }
    h3.dispatch("item/set", item);
    h3.dispatch("selection/set", selection);
    h3.dispatch("loading/clear");
  },
  display: () => {
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
        onclick: () =>
          h3.navigateTo(
            `/${h3.state.collection}/${h3.state.page}/`,
            h3.route.params
          ),
        icon: "reply",
        id: "back",
        label: "Back",
        primary: true,
        classList: h3.state.selection ? ["show-sm"] : ["hide"],
      },
      {
        onclick: () => h3.navigateTo(`/${h3.state.collection}/add`),
        icon: "plus",
        id: "add",
        label: "Add",
        primary: true,
        classList: h3.state.selection ? ["hide-sm"] : [],
      },
      {
        onclick: () =>
          h3.navigateTo(`/${h3.state.collection}/${h3.state.selection}/edit`),
        icon: "pencil",
        label: "Edit",
        id: "edit",
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
            )} '${h3.state.item.data.title}'?`,
          };
          h3.dispatch("alert/set", confirm);
          h3.redraw();
        },
        id: "delete",
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
        id: "copy",
        disabled: !h3.state.selection,
      },
      {
        onclick: () => {
          if (h3.state.collection === "notes") {
            downloadHTML(
              h3.state.item.data.title,
              document.getElementById("item-content").innerHTML
            );
          } else {
            downloadFile(
              h3.state.item.data.title,
              h3.state.item.data.code,
              h3.state.item.data.language
            );
          }
        },
        icon: "cloud-download",
        label: "Download",
        id: "download",
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
    const page = parseInt(h3.route.parts.page || 1);
    const totalPages = Math.ceil(h3.state.total / h3.state.query.limit);
    const content = () =>
      h("div.content.d-flex.flex-1.flex-column", [
        h("div.d-block.hide-sm", TabNav(tabnav)),
        h(
          `div.top-info-bar.d-flex.flex-row.flex-justify-between.flex-items-center${
            h3.state.selection ? ".hide-sm" : ""
          }`,
          [
            h("div.d-flex.flex-row.flex-items-center", [
              h("div.total.d-flex.flex-row.flex-items-center", [
                h("span", { $html: `Total ${h3.state.collection}:&nbsp;` }),
                h("strong", String(h3.state.total)),
              ]),
              h3.state.query.search &&
                h("div-search.d-flex.flex-row.flex-items-center", [
                  h("span", {
                    $html: "&nbsp;&middot;&nbsp;Searching for:&nbsp;",
                  }),
                  h("strong", h3.state.query.search),
                  h(
                    "button.btn.btn-invisible",
                    {
                      style: "margin-bottom: -1px;",
                      onclick: () => {
                        h3.dispatch("reload/set", true);
                        h3.navigateTo(h3.route.path);
                      },
                    },
                    [octicon("x"), "Clear"]
                  ),
                ]),
            ]),

            totalPages > 1 &&
              Paginator({
                current: page,
                total: totalPages,
                callback: (n) =>
                  h3.navigateTo(
                    `/${h3.state.collection}/${n}`,
                    h3.route.params
                  ),
              }),
          ]
        ),
        MasterDetail({
          items: h3.state.items,
          item: h3.state.item,
          add,
          collection: h3.state.collection,
        }),
        h("div.d-block.show-sm", TabNav(tabnav)),
      ]);
    return Page({
      content,
    });
  },
});

export default Home;
