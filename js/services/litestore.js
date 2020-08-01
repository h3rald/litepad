import { h3, h } from "../h3.js";
import { withError, withLoading } from "./utils.js";

const opts = () => ({
  headers: {
    "Content-Type": "application/json",
  },
});

const addItem = async (collection, data) => {
  const url = `${h3.state.config.api}/${collection}/`;
  const body = JSON.stringify(data);
  const method = "POST";
  return await withError(
    async () => await fetch(url, { ...opts(), method, body })
  );
};

const saveItem = async (collection, id, data) => {
  const url = `${h3.state.config.api}/${collection}/${id}`;
  const body = JSON.stringify(data);
  const method = "PUT";
  return await withError(
    async () => await fetch(url, { ...opts(), method, body })
  );
};

const getItems = async (collection, data) => {
  const { filter, sort, select, limit, offset } = data;
  const options = Object.entries(data)
    .map(([key, value]) => (value ? `${key}=${value}` : ""))
    .join("&");
  const url = `${h3.state.config.api}/${collection || "notes"}/${
    options ? "?" + options : ""
  }`;
  return await withError(async () => await fetch(url, { ...opts() }));
};

const getItem = async (collection, id) => {
  const url = `${h3.state.config.api}/${collection}/${id}?raw=true`;
  return await withError(async () => await fetch(url, { ...opts() }));
};

const deleteItem = async (collection, id) => {
  const url = `${h3.state.config.api}/${collection}/${id}`;
  const method = "DELETE";
  return await withError(async () => await fetch(url, { ...opts(), method }));
};

const litestore = { addItem, getItems, getItem, deleteItem, saveItem }

export default litestore;
