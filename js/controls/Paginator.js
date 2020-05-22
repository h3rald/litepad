import h3 from "../h3.js";

export default ({ current, total, callback, classList }) => {
  return h3(
    "nav.paginate-container",
    { "aria-label": "Pagination", classList },
    [
      h3("div.pagination", [
        current === 1 &&
          h3("span.previous-page", { "aria-disabled": true }, "Previous"),
        current !== 1 &&
          h3(
            "a.previous-page",
            { rel: "previous", onclick: () => callback(current - 1) },
            "Previous"
          ),
        ...[...Array(total).keys()].map((n) =>
          current === n + 1
            ? h3("em", { "aria-current": "page" }, String(n + 1))
            : h3(
                "a",
                {
                  "aria-label": `Page ${n + 1}`,
                  onclick: () => callback(n + 1),
                },
                String(n + 1)
              )
        ),
        current === total &&
          h3("span.next-page", { "aria-disabled": true }, "Next"),
        current !== total &&
          h3(
            "a.next-page",
            { rel: "next", onclick: () => callback(current + 1) },
            "Next"
          ),
      ]),
    ]
  );
};
