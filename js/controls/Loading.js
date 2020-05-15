import h3 from "../h3.js";

export default (props) => {
    const {text} = props;
    return h3("h2", [
        h3("span", text),
        h3("span.AnimatedEllipsis")
    ])
}