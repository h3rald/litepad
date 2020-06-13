import h3 from "../h3.js";
import litestore from "./litestore.js";
import localStorage from "./localStorage.js";

let obj;

if (window.location.search.match(/localStorage/i)) {
  obj = localStorage;
} else if (window.location.search.match(/gist/i)) {
  obj = localStorage; // TODO: implement
} else {
  obj = litestore;
}

const { addItem, getItems, getItem, deleteItem, saveItem } = obj;

export { addItem, getItems, getItem, deleteItem, saveItem };
