import { h3, h } from "../h3.js";

export default ({ current, total, callback, classList }) => {
  return h(
    "nav.paginate-container",
    { "aria-label": "Pagination", classList },
    [
      h("div.pagination", [
        current === 1 &&
          h("span.previous-page", { "aria-disabled": true }, "Previous"),
        current !== 1 &&
          h(
            "a.previous-page",
            { rel: "previous", onclick: () => callback(current - 1) },
            "Previous"
          ),
        ...[...Array(total).keys()].map((n) =>
          current === n + 1
            ? h("em", { "aria-current": "page" }, String(n + 1))
            : h(
                "a",
                {
                  "aria-label": `Page ${n + 1}`,
                  onclick: () => callback(n + 1),
                },
                String(n + 1)
              )
        ),
        current === total &&
          h("span.next-page", { "aria-disabled": true }, "Next"),
        current !== total &&
          h(
            "a.next-page",
            { rel: "next", onclick: () => callback(current + 1) },
            "Next"
          ),
      ]),
    ]
  );
};
