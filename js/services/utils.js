import h3 from "../h3.js";

const routeComponent = ({ initialState, render, init }) => {
  let state;
  const fn = () => {
    return render(state);
  };
  fn.init = async () => {
    if (initialState) {
      state = { ...initialState() };
    }
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
