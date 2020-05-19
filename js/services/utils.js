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

export { getType, getIcon, getTypeIcon, getObject };
