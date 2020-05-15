import h3 from "../h3.js";
import Page from "../controls/Page.js";
import { icon } from "../services/icons.js";
import { addNote } from "../services/api.js";
import { routeComponent } from "../services/utils.js";
import Field from "../controls/Field.js";
import Note from "../models/Note.js";

const title = "Somethin' new";

const initialState = {
  data: new Note(),
  type: "note",
};

const save = async (state) => {
  state.data.validate() && (await addNote(state.data.get()));
  h3.redraw();
};

const cancel = () => h3.navigateTo("/");

const render = (state) => {
  const content = h3("div.content", [
    h3("form", [
      h3("div.form-actions", [
        h3("button.btn.btn-primary", { onclick: () => save(state) }, [
          icon("check"),
          "Make it so!",
        ]),
        h3("button.btn.btn-invisible", { onclick: cancel }, [
          icon("circle-slash"),
          "Only kiddin'",
        ]),
      ]),
      Field(state.data.title),
      Field(state.data.text),
    ]),
  ]);
  return Page({ title, content });
};

export default routeComponent({ initialState, render });
