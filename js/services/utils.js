import h3 from "../h3.js";

const routeComponent = ({ initialState, render, init }) => {
  let state = {};
  let firstRun = true;
  let route;
  const reset = () => {
    if (initialState) {
      state = { ...initialState };
    }
    firstRun = true;
  };
  const start = () => {
    reset();
    firstRun = false;
    h3.on("$navigation", reset);
    init && init(state);
  };
  return () => {
    route = h3.route;
    firstRun && start();
    return render(state);
  };
};

export { routeComponent };
