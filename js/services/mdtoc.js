import marked from "../../vendor/marked.js";
import h3 from "../h3.js";

let toc = [];

const renderer = {
    heading(text, level, raw) {
        const anchor =
            this.options.headerPrefix +
            raw.toLowerCase().replace(/[^\w\\u4e00-\\u9fa5]+/g, "-");
        toc.push({
            anchor: anchor,
            level: level,
            text: text,
        });
        return `<h${level} id="${anchor}">${text} <sup class="go2top hide">[<a href="#top">top</a>]</sup></h${level}>\n`;
    },
};

marked.use({ renderer });

const buildToc = (coll, k, level, ctx) => {
    if (k >= coll.length || coll[k].level <= level) {
        return k;
    }
    const node = coll[k];
    ctx.push("<li><a href='#" + node.anchor + "'>" + node.text + "</a>");
    k++;
    const childCtx = [];
    k = buildToc(coll, k, node.level, childCtx);
    if (childCtx.length > 0) {
        ctx.push("<ul>");
        childCtx.forEach(function (idm) {
            ctx.push(idm);
        });
        ctx.push("</ul>");
    }
    ctx.push("</li>");
    k = buildToc(coll, k, level, ctx);
    return k;
};

const handleToc = (node) => {
    const ctx = [];
    ctx.push(
        '<div id="toc" class="hide"><h2 id="table-of-contents">Table of Contents</h2>\n<ul>'
    );
    buildToc(toc, 0, 0, ctx);
    ctx.push("</ul></div>");
    node.innerHTML = ctx.join("") + node.innerHTML;
};

export { toc, handleToc };
