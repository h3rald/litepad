import marked from "../../vendor/marked.js";
import { saveItem, getItems } from "./api.js";
import h3 from "../h3.js";

// Marked extension (requires small modification to marked.js to pass token as last parameter to list function)

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

const walkList = (list, li, line) => {
  for (let item of list.childNodes) {
    if (item.tagName === "LI") {
      line++;
    }
    if (item === li) {
      return [line, true];
    } else {
      for (let liChild of item.childNodes) {
        if (liChild.tagName === "UL") {
          if (walkList(liChild, li, line)[1]) {
            return [line, true];
          }
        }
      }
    }
  }
  return [line, false];
};

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
  line = walkList(list, li, line)[0];
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
  const newItems = await getItems(h3.state.collection, h3.state.query);
  h3.dispatch("items/set", newItems.results);
  h3.dispatch("total/set", newItems.total);
  h3.redraw();
};

const handleUpdateTask = (node) => {
  const tasks = node.querySelectorAll(
    ".checklist li input"
  );
  tasks.forEach((task) =>
    task.addEventListener("change", updateTask)
  );
};

export {
  updateTask, handleUpdateTask
}