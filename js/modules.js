import h3 from "./h3.js";
import Config from "./models/Config.js";

const debug = () => {
  if (window.location.search.match(/debug/)) {
    window.h3 = h3;
    h3.on("$log", (state, data) => console.log(data));
  }
};

const config = () => {
  h3.on("config/load", () => {
    const config = new Config();
    return { config };
  });
};

const items = () => {
  h3.on("$init", () => ({
    items: [],
    item: null,
    query: { select: "$.title as title" },
  }));
  h3.on("items/set", (state, items) => ({
    item: state.item,
    items,
    query: state.query,
  }));
  h3.on("item/set", (state, item) => ({
    item: item,
    items: state.items,
    query: state.query,
  }));
  h3.on("$navigation", (state, route) => {
    return route.path === "/"
      ? { ...state }
      : { items: [], item: null, query: state.query };
  });
};

const flags = () => {
  h3.on("$init", () => ({
    flags: {
      help: false,
      loading: true,
      error: null,
      confirm: null,
      selection: null,
    },
  }));
  h3.on("alert/set", (state, alert) => ({
    flags: { ...state.flags, alert },
  }));
  h3.on("alert/clear", (state) => ({
    flags: { ...state.flags, alert: null },
  }));
  h3.on("loading/set", (state) => ({
    flags: { ...state.flags, loading: true },
  }));
  h3.on("loading/clear", (state) => ({
    flags: { ...state.flags, loading: false },
  }));
  h3.on("selection/set", (state, selection) => ({
    flags: { ...state.flags, selection },
  }));
  h3.on("selection/clear", (state) => ({
    flags: { ...state.flags, selection: null },
  }));
};

export default [debug, config, flags, items];
