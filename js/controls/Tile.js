import h3 from "../h3.js";
import octicon from "../services/octicon.js";

export default (props) => {
  const { item } = props;
  const collection = item.id.match(/([^\/]+)\//)[1];
  const icon = h3.state.config.collections[collection].icon;
  const type = h3.state.config.collections[collection].type;
  const date = new Date(item.updated || item.created);
  const select = (id) => {
    h3.navigateTo("/", h3.state.flags.selection === id ? {} : { s: id });
  };
  const id = item.id.replace("/", ".");
  return h3(
    `div.tile${h3.state.flags.selection === id ? ".selected" : ""}`,
    { $key: id, onclick: () => select(id) },
    [
      h3("p.tile-title", [octicon(icon), h3("span", item.data.title)]),
      h3("div.tile-data", {
        $html: `${type} &middot; ${date.toDateString()} @ ${date.toLocaleTimeString()}`,
      }),
    ]
  );
};
