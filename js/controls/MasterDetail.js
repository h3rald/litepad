import h3 from "../h3.js";
import Tile from "./Tile.js";
import DOMPurify from "../../vendor/purify.es.js";
import marked from "../../vendor/marked.js";
import UnSelected from "./UnSelected.js";
import Empty from "./Empty.js";
import Field from "./Field.js";
import Snippet from "../models/Snippet.js";
import Note from "../models/Item.js";
import { saveItem } from "../services/api.js";

const types = {
  snippets: Snippet,
  notes: Note,
};

const state = {};

// Marked extension
const renderer = {
  list(body, ordered, start, token) {
    let content = body;
    if (content.match(/type="checkbox">/)) {
      while (content.match(/disabled(="")?/)) {
        content = content.replace(/disabled(="")?/, "");
      }
      return `<ul class="checklist" data-raw="${token.raw}">${content}</ul>`;
    }
    return false;
  },
};
marked.use({ renderer });

// Task persistence
const updateTask = async (event) => {
  const item = h3.state.item;
  const checkbox = event.currentTarget;
  const li = checkbox.parentNode;
  const ul = li.parentNode;
  let list = ul;
  while (list) {
    if (list.parentNode.tagName === "LI") {
      list = list.parentNode.parentNode;
    } else {
      break;
    }
  }
  const taskList = list.dataset.raw;
  let line = -1;
  const walkList = (list) => {
    for (let item of list.childNodes) {
      if (item.tagName === "LI") {
        line++;
      }
      if (item === li) {
        return true;
      } else {
        for (let liChild of item.childNodes) {
          if (liChild.tagName === "UL") {
            if (walkList(liChild)) {
              return true;
            }
          }
        }
      }
    }
    return false;
  };
  walkList(list);
  const newTaskList = taskList
    .split("\n")
    .map((t, i) => {
      if (i === line) {
        return t.replace(/\[.\]\s+/, checkbox.checked ? "[x] " : "[ ] ");
      }
      return t;
    })
    .join("\n");
  const regexp = new RegExp(
    taskList.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&").replace(/\s+/gm, "\\s+"),
    "m"
  );
  list.dataset.raw = newTaskList;
  const text = item.data.text.replace(regexp, newTaskList);
  const newItem = await saveItem(...item.id.split("/"), { ...item.data, text });
  h3.dispatch("item/set", newItem);
};

export default ({ items, item, collection, add }) => {
  let data;
  if (item) {
    data = new types[collection]();
    data.set(item);
  }
  state.current = state.current || {};
  if (state.current.collection !== collection) {
    state.current = { collection };
  }
  return items.length === 0
    ? Empty({ collection: collection, add })
    : h3("div.master-detail.d-flex.flex-row.flex-1", [
        h3(
          "div.master.d-flex.flex-column",
          h3(
            "div.d-flex.flex-column.flex-1.scrollable-area",
            {
              data: { collection },
              onscroll: (e) => {
                state.current.scrollTop = e.currentTarget.scrollTop;
              },
              $onrender: (node) => {
                node.scrollTo(0, state.current.scrollTop);
              },
            },
            items.map((item) => {
              return Tile({ item });
            })
          )
        ),
        item
          ? h3("div.detail.px-4.d-flex.flex-column.flex-1", [
              h3("h2.item-title", item.data.title),
              h3("div.d-flex.flex-column.flex-1.scrollable-area", [
                collection === "notes" &&
                  h3("div.markdown", {
                    $html: marked(DOMPurify.sanitize(item.data.text)),
                    $onrender: (node) => {
                      const tasks = node.querySelectorAll(
                        ".checklist li input"
                      );
                      tasks.forEach((task) =>
                        task.addEventListener("change", updateTask)
                      );
                    },
                  }),
                collection === "snippets" &&
                  Field({ ...data.code, editable: false }),
              ]),
            ])
          : h3("div.detail.flex-auto", UnSelected({ collection })),
      ]);
};
