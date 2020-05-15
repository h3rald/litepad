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
    e.title = e.title || "Error";
    h3.dispatch("error/set", {
      title: e.name || e.title || "Error",
      message: e.message || "Something nasty happened... Sorry!",
      active: true,
    });
  }
};

const addNote = async (data) => {
  const url = `${h3.state.config.api}/notes/`;
  const body = JSON.stringify(data);
  const method = "POST";
  return await withError(
    async () =>
      await withLoading(
        async () => await fetch(url, { ...opts(), method, body })
      )
  );
};

export { addNote, withError, withLoading };
