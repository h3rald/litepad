import { h3, h } from "../h3.js";
import Page from "../controls/Page.js";
import { addItem, getItem, saveItem } from "../services/api.js";
import Field from "../controls/Field.js";
import Note from "../models/Note.js";
import Snippet from "../models/Snippet.js";
import ActionBar from "../controls/ActionBar.js";
import Loading from "../controls/Loading.js";
import { shortcutsFor } from "../services/shortcuts.js";

const types = {
  snippets: Snippet,
  notes: Note,
};

const save = async (state) => {
  if (state.data.validate()) {
    const result = state.id
      ? await saveItem(state.collection, state.id, state.data.get())
      : await addItem(state.collection, state.data.get());
    h3.dispatch("reload/set", true);
    h3.navigateTo(
      `/${state.collection}/${state.id ? h3.state.page : 1}/${result.id.replace(
        `${state.collection}/`,
        ""
      )}`
    );
  }
  h3.redraw();
};

const cancel = (state) => {
  window.history.back();
};

const cancelAction = () => h3.dispatch("alert/clear") || h3.redraw();

const Edit = h3.screen({
  setup: async (state) => {
    shortcutsFor("edit");
    h3.dispatch("location/set", "edit");
    state.id = h3.route.parts.id || "";
    state.collection = h3.route.parts.collection;
    state.collectionData = h3.state.config.collections[state.collection];
    state.data = new types[state.collection]();
    if (state.id) {
      const item = await getItem(state.collection, state.id);
      state.data.set(item);
    }
    h3.dispatch("loading/clear");
  },
  display: (state) => {
    if (!state.data) {
      return Loading();
    }
    const actions = [
      {
        onclick: () => save(state),
        icon: "check",
        id: "save",
        label: "Save",
        primary: true,
      },
      {
        onclick: () => {
          const confirm = {
            type: "warn",
            buttonType: "danger",
            label: "Yes, go back!",
            action: () => cancel(state),
            cancelAction,
            message: `Do you really want to go back to the list view without saving?`,
          };
          h3.dispatch("alert/set", confirm);
          h3.redraw();
        },
        id: "back",
        icon: "reply",
        label: "Back",
      },
    ];
    const content = h("div.content.d-flex.flex-column.flex-1", [
      h("div.hide-sm", ActionBar(actions)),
      h("div.d-flex.edit-form", [
        h("div.d-flex.flex-row.flex-1", [
          state.data.language &&
            h(
              "div",
              { style: "width: 150px; margin-right: 15px;" },
              Field(state.data.language)
            ),
          Field(state.data.title),
        ]),
      ]),
      state.data.text && Field(state.data.text),
      state.data.code && Field(state.data.code),
      h("div.show-sm", ActionBar(actions)),
    ]);
    return Page({ content });
  },
});

export default Edit;
