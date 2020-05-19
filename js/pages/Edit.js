import h3 from "../h3.js";
import Page from "../controls/Page.js";
import { addItem, getItem, saveItem } from "../services/api.js";
import { routeComponent } from "../services/utils.js";
import Field from "../controls/Field.js";
import Note from "../models/Note.js";
import ActionBar from "../controls/ActionBar.js";
import Loading from "../controls/Loading.js";

const initialState = () => ({
  title: null,
  id: null,
  collection: null,
  data: null,
  type: "note",
});

const init = async (state) => {
  state.id = h3.route.parts.id || "";
  state.collection = h3.route.parts.collection;
  state.data = new Note();
  if (state.id) {
    const item = await getItem(state.collection, state.id);
    state.title = "Edit Note";
    state.data.set(item);
    h3.dispatch("loading/clear");
  } else {
    state.title = "New Note";
    h3.dispatch("loading/clear");
  }
};
const save = async (state) => {
  if (state.data.validate()) {
    const params = h3.route.parts.id ? { s: h3.route.parts.id } : {};
    await (state.id
      ? saveItem(state.collection, state.id, state.data.get())
      : addItem(state.collection, state.data.get()));
    h3.navigateTo(`/${state.collection}/${state.id}`);
  }
  h3.redraw();
};

const cancel = (state) => {
  h3.navigateTo(`/${state.collection}/${state.id}`);
};

const render = (state) => {
  if (!state.data) {
    return Loading();
  }
  const actions = [
    {
      onclick: () => save(state),
      icon: "check",
      label: "Save",
    },
    {
      onclick: () => cancel(state),
      icon: "circle-slash",
      label: "Cancel",
    },
  ];
  const content = h3("div.content", [
    h3("div", [
      ActionBar(actions),
      h3("div.d-flex", [h3("div.flex-auto", Field(state.data.title))]),
      Field(state.data.text),
    ]),
  ]);
  return Page({ title: state.title, content });
};

export default routeComponent({ initialState, render, init });
