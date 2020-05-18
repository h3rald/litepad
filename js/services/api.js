import h3 from "../h3.js";

const opts = () => ({
  headers: {
    "Content-Type": "application/json",
  },
});

const withLoading = async (cbk) => {
  h3.dispatch("loading/set", "Loading");
  h3.redraw();
  const result = await cbk();
  h3.dispatch("loading/clear");
  h3.redraw();
  return result;
};

const withError = async (cbk) => {
  try {
    const response = await cbk();
    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = {};
    }
    if (!response.ok) {
      throw {
        title: response.statusText,
        message: data.message || data.error,
      };
    }
    return data;
  } catch (e) {
    h3.dispatch("alert/set", {
      type: "error",
      message: e.message || "Something nasty happened... Sorry!",
      dismiss: true,
      cancelAction: () => {
        h3.dispatch("alert/clear");
        h3.redraw();
      }  
    });
  }
};

const addItem = async (collection, data) => {
  const url = `${h3.state.config.api}/${collection}/`;
  const body = JSON.stringify(data);
  const method = "POST";
  return await withError(
    async () =>
      await withLoading(
        async () => await fetch(url, { ...opts(), method, body })
      )
  );
};

const saveItem = async (id, data) => {
  const url = `${h3.state.config.api}/${id}`;
  const body = JSON.stringify(data);
  const method = "PUT";
  return await withError(
    async () =>
      await withLoading(
        async () => await fetch(url, { ...opts(), method, body })
      )
  );
};

const getItems = async (data) => {
  const { filter, sort, select, limit, offset } = data;
  const options = Object.entries(data)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  const url = `${h3.state.config.api}/${options ? "?" + options : ""}`;
  return await withError(async () => await fetch(url, { ...opts() }));
};

const getItem = async (id) => {
  const url = `${h3.state.config.api}/${id}?raw=true`;
  return await withError(async () => await fetch(url, { ...opts() }));
};

const deleteItem = async (id) => {
  const url = `${h3.state.config.api}/${id}`;
  const method = "DELETE";
  return await withError(async () => await fetch(url, { ...opts(), method }));
};

export { addItem, withError, withLoading, getItems, getItem, deleteItem, saveItem };
