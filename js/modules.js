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

export default [debug, config];
