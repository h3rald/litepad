import h3 from "../h3.js";
import { withError, withLoading } from "./utils.js";

const collections = {
  snippets: "litepad.h3.snippets",
  notes: "litepad.h3.notes",
};

const fakeFetch = ({ ok, statusText, data }) => {
  return Promise.resolve({
    ok,
    statusText,
    json: () => Promise.resolve(data),
  });
};

const getData = (collection) => {
  return JSON.parse(
    window.localStorage.getItem(collections[collection]) || "[]"
  );
};

const setData = (collection, data) => {
  window.localStorage.setItem(collections[collection], JSON.stringify(data));
};

const getDate = () => {
  return new Date(Date.now()).toJSON().replace(/\.[^Z]+/, "");
};

const addItem = async (collection, contents) => {
  const now = Date.now();
  const date = getDate();
  const data = {
    id: `${collection}/${now}`,
    modified: date,
    created: date,
    data: contents,
  };
  const list = getData(collection);
  list.push(data);
  setData(collection, list);
  const ok = true;
  const statusText = "OK";
  return await withError(async () => await fakeFetch({ ok, statusText, data }));
};

const saveItem = async (collection, id, contents) => {
  const list = getData(collection);
  let data = list.find((i) => i.id === `${collection}/${id}`);
  data.updated = getDate();
  let ok, statusText;
  if (data) {
    ok = true;
    statusText = "OK";
  } else {
    ok = false;
    statusText = "Not Found";
    data = { message: "Item not found" };
  }
  if (ok) {
    data.data = contents;
    setData(collection, list);
  }
  return await withError(async () => await fakeFetch({ ok, statusText, data }));
};

const getItems = async (collection, data) => {
  const { limit, offset, search } = data;
  const results = getData(collection)
    .filter((item) =>
      search
        ? item.data.title.match(search) ||
          (item.data.code && item.data.code.match(search)) ||
          (item.data.text && item.data.text.match(search))
        : true
    )
    .sort((a, b) => a.modified > b.modified)
    .slice(offset, limit);
  return await withError(
    async () =>
      await fakeFetch({
        ok: true,
        statusText: "OK",
        data: { results, total: results.length },
      })
  );
};

const getItem = async (collection, id) => {
  const list = getData(collection);
  let data = list.find((i) => i.id === `${collection}/${id}`);
  let ok, statusText;
  if (data) {
    ok = true;
    statusText = "OK";
  } else {
    ok = false;
    statusText = "Not Found";
    data = { message: "Item not found" };
  }
  return await withError(async () => await fakeFetch({ ok, statusText, data }));
};

const deleteItem = async (collection, id) => {
  const list = getData(collection);
  let data = list.find((i) => i.id === `${collection}/${id}`);
  const newList = list.filter((item) => item.id !== `${collection}/${id}`);
  setData(collection, newList);
  let ok, statusText;
  if (data) {
    ok = true;
    statusText = "OK";
  } else {
    ok = false;
    statusText = "Not Found";
    data = { message: "Item not found" };
  }
  return await withError(async () => await fakeFetch({ ok, statusText, data }));
};

const localStorage = {
  addItem,
  withError,
  withLoading,
  getItems,
  getItem,
  deleteItem,
  saveItem,
};

export default localStorage;
