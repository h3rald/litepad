import h3 from "../h3.js";
import Page from "../controls/Page.js";
import octicon from "../services/octicon.js";
import { addNote } from "../services/api.js";
import { routeComponent } from "../services/utils.js";
import Field from "../controls/Field.js";
import Note from "../models/Note.js";
import ActionBar from "../controls/ActionBar.js";

const title = "Somethin' new";

const initialState = {
  data: new Note(),
  type: "note",
};

const init = () => {
  h3.dispatch("loading/clear");
};
const save = async (state) => {
  state.data.validate() && (await addNote(state.data.get()));
  h3.redraw();
};

const cancel = () => h3.navigateTo("/");

const render = (state) => {
  const actions = [
    {
      onclick: () => save(state),
      icon: "check",
      label: "Make it so!",
    },
    {
      onclick: cancel,
      icon: "circle-slash",
      label: "Only kiddin'",
    },
  ];
  const content = h3("div.content", [
    h3("div", [
      ActionBar(actions),
      Field(state.data.title),
      Field(state.data.text),
    ]),
  ]);
  return Page({ title, content });
};

export default routeComponent({ initialState, render, init });
