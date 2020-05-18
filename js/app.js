import h3 from "./h3.js";
import modules from "./modules.js";
import Home from "./pages/Home.js";
import Edit from "./pages/Edit.js";

h3.init({
  preStart: async () => {
    h3.dispatch("config/load");
    h3.dispatch("config/ready", h3.state.config);
  },
  modules: modules,
  routes: {
    "/add": Edit,
    "/edit/:id": Edit,
    "/": Home,
  },
});
