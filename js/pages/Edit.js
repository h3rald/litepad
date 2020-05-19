import h3 from "../h3.js";
import Page from "../controls/Page.js";
import { addItem, getItem, saveItem } from "../services/api.js";
import Field from "../controls/Field.js";
import Note from "../models/Note.js";
import Snippet from "../models/Snippet.js";
import ActionBar from "../controls/ActionBar.js";
import Loading from "../controls/Loading.js";

const types = {
  snippets: Snippet,
  notes: Note
}

const init = () => ({
  id: null,
  collection: null,
  collectionData: null,
  data: null,
  type: "note",
});

const enter = async (state) => {
  state.id = h3.route.parts.id || "";
  state.collection = h3.route.parts.collection;
  state.collectionData = h3.state.config.collections[state.collection];
  state.data = new types[state.collection]();
  if (state.id) {
    const item = await getItem(state.collection, state.id);
    state.data.set(item);
  } 
  h3.dispatch("loading/clear");
};
const save = async (state) => {
  if (state.data.validate()) {
    state.id
      ? await saveItem(state.collection, state.id, state.data.get())
      : await addItem(state.collection, state.data.get());
    h3.navigateTo(`/${state.collection}/${state.id}`);
  }
  h3.redraw();
};

const cancel = (state) => {
  h3.navigateTo(`/${state.collection}/${state.id}`);
};

const Edit = (state) => {
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
      state.data.text && Field(state.data.text),
      state.data.code && Field(state.data.code),
    ]),
  ]);
  return Page({ content });
};

Edit.init = init;
Edit.enter = enter;

export default Edit;
