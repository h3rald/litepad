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

const flags = () => {
  h3.on("$init", () => ({
    flags: { help: false, loading: true, error: null, confirm: null, selection: null },
  }));
  h3.on("error/set", (state, error) => ({
    flags: { ...state.flags, error },
  }));
  h3.on("error/clear", (state) => ({
    flags: { ...state.flags, error: null },
  }));
  h3.on("confirm/set", (state, confirm) => ({
    flags: { ...state.flags, confirm },
  }));
  h3.on("confirm/clear", (state) => ({
    flags: { ...state.flags, confirm: null },
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

export default [debug, config, flags];
