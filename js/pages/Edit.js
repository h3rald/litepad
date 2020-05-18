import h3 from "../h3.js";
import Page from "../controls/Page.js";
import octicon from "../services/octicon.js";
import { addItem, getItem, saveItem } from "../services/api.js";
import { routeComponent } from "../services/utils.js";
import Field from "../controls/Field.js";
import Note from "../models/Note.js";
import ActionBar from "../controls/ActionBar.js";

const initialState = () => ({
  title: null,
  id: null,
  data: new Note(),
  type: "note",
});

const init = async (state) => {
  state.id = h3.route.parts.id && h3.route.parts.id.replace(".", "/");
  if (state.id) {
    const item = await getItem(state.id);
    state.title = "Edit Item";
    state.data.set(item);
  } else {
    state.title = "New Item";
  }
  h3.dispatch("loading/clear");
  h3.redraw();
};
const save = async (state) => {
  if (state.data.validate()) {
    const params = h3.route.parts.id ? { s: h3.route.parts.id } : {};
    await (state.id
      ? saveItem(state.id, state.data.get())
      : addItem("notes", state.data.get()));
    h3.navigateTo("/", params);
  }
  h3.redraw();
};

const cancel = (state) => {
  const params = h3.route.parts.id ? { s: h3.route.parts.id } : {};
  h3.navigateTo("/", params);
};

const render = (state) => {
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
      Field(state.data.title),
      Field(state.data.text),
    ]),
  ]);
  return Page({ title: state.title, content });
};

export default routeComponent({ initialState, render, init });
