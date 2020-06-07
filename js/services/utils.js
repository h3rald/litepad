import h3 from "../h3.js";

const getType = (id) => {
  const collection = id.match(/([^\/]+)\/?/)[1];
  return h3.state.config.collections[collection].type;
};

const getObject = (id) => {
  const collection = id.match(/([^\/]+)\/?/)[1];
  return h3.state.config.collections[collection].type.toLowerCase();
};

const getTypeIcon = (id) => {
  const collection = id.match(/([^\/]+)\/?/)[1];
  return h3.state.config.collections[collection].typeIcon;
};

const getIcon = (id) => {
  const collection = id.match(/([^\/]+)\/?/)[1];
  return h3.state.config.collections[collection].icon;
};

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
      message: e.message || "Something went wrong...",
      dismiss: true,
      cancelAction: () => {
        h3.dispatch("alert/clear");
        h3.redraw();
      },
    });
    return false;
  }
};

export { getType, getIcon, getTypeIcon, getObject, withLoading, withError };
