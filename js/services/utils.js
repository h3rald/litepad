import h3 from "../h3.js";

const routeComponent = ({ initialState, render, init }) => {
  let state;
  let firstRun = true;
  const reset = () => {
    console.log(">>> Reset called!");
    if (initialState) {
      state = { ...initialState() };
    }
    firstRun = true;
  };
  const start = () => {
    reset();
    firstRun = false;
    //init && init(state);
  };
  const fn = () => {
    firstRun && start();
    return render(state);
  };
  fn.init = async () => {
    console.log(">>> Init called!");
    console.log(h3.state);
    start();
    //h3.on("$navigation", reset);
    return await init(state);
  };
  return fn;
};

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

export { routeComponent, getType, getIcon, getTypeIcon, getObject };
