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
    collection: null,
    selection: null,
    total: 0,
    query: { select: "$.title as title", sort: "-modified" },
  }));
  h3.on("total/set", (state, total) => ({
    ...state,
    total,
  }))
  h3.on("collection/set", (state, collection) => ({
    ...state,
    collection,
  }));
  h3.on("items/set", (state, items) => ({
    ...state,
    items,
  }));
  h3.on("item/set", (state, item) => ({
    ...state,
    item,
  }));
  h3.on("selection/set", (state, selection) => ({ ...state, selection }));
  h3.on("selection/clear", (state) => ({ ...state, selection: null }));
  h3.on("$navigation", (state, route) => {
    return ["/:collection/:id", "/:collection"].includes(route.def)
      ? { ...state }
      : {
          items: [],
          item: null,
          query: state.query,
          collection: "notes",
          selection: null,
        };
  });
};

const flags = () => {
  h3.on("$init", () => ({
    flags: {
      alert: null,
      loading: true,
    },
  }));
  h3.on("alert/set", (state, alert) => ({
    flags: { ...state.flags, alert },
  }));
  h3.on("alert/flash", (state, alert) => {
    setTimeout(() => h3.dispatch("alert/clear"), 5000);
    return {
      flags: { ...state.flags, alert },
    };
  });
  h3.on("alert/clear", (state) => ({
    flags: { ...state.flags, alert: null },
  }));

  h3.on("loading/set", (state) => ({
    flags: { ...state.flags, loading: true },
  }));
  h3.on("loading/clear", (state) => ({
    flags: { ...state.flags, loading: false },
  }));
  h3.on("$navigation", (state) => ({
    flags: {
      ...state.flags,
      alert: null,
    },
  }));
};

export default [debug, config, flags, items];
