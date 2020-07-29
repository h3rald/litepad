import { h3, h } from "./h3.js";
import modules from "./modules.js";
import Home from "./screens/Home.js";
import Edit from "./screens/Edit.js";

h3.init({
  preStart: async () => {
    h3.dispatch("config/load");
    h3.dispatch("config/ready", h3.state.config);
    if (
      window.location.origin !== "http://localhost:9300" ||
      window.location.search.match(/localStorage/i)
    ) {
      h3.state.config.storage = "localStorage";
    } else {
      h3.state.config.storage = "litestore";
    }
  },
  modules: modules,
  routes: {
    "/:collection/add": Edit,
    "/:collection/:id/edit": Edit,
    "/:collection/:page/:id": Home,
    "/:collection/:page": Home,
    "/:collection": Home,
    "/": Home,
  },
});
