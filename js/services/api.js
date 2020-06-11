import h3 from "../h3.js";
import litestore from "./litestore.js";
import localStorage from "./localStorage.js";

let obj;

if (
  window.location.origin !== "http://localhost:9300" ||
  window.location.search.match(/localStorage/i)
) {
  obj = localStorage;
} else {
  obj = litestore;
}

const { addItem, getItems, getItem, deleteItem, saveItem } = obj;

export { addItem, getItems, getItem, deleteItem, saveItem };
