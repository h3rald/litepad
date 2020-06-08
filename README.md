# LitePad

LitePad is a simple notepad application written with the [H3](https://h3.js.org) micro framework. 

At present, LitePad provides:

* a way to manage notes written in Markdown.
* a way to manage code snippets.
* the possibility to search notes and snippets
* syntax highlighting for snippets written in: JavaScript, TypeScript, JSX, TSX, JSON, CSS and HTML.
* the ability to edit notes and snippets using Vim keybindings (disabled on small or touch devices).
* the possibility to copy notes/snippets to clipboard.
* the possibility to dowload snippets to their respective formats and notes to HTML with minimal styling.
* keyboard shortcuts for virtually every action and behavior (just type **h**) or click the help button in the top-right corner.
* a responsive UI, works well on desktop and small mobile devices.

## Backend

For persistence and full-text search, LitePad requires [https://h3rald.com/litestore](LiteStore), an extremely lightweight RESTful NoSQL store. It's just a single file, you can download it, place it in LitePad's project directory, and run it from command line like this:

`litestore -c:litestore.json`

This will start LiteStore on port 9300 and also serve LitePad on http://localhost:9300/dir/index.html.

Alternatively, you can also run LitePad with no backend from any web server, but in this case:
* notes and snippets will be persisted in localStorag
* a simpler (not full-text) search will be performed on note/snippets by matching search keywords with snippet and note contents.

## Demo

[https://litepad.h3rald.com](litepad.h3rald.com)

**Note:** Notes and snippets are saved to your browser's localStorage!

## License

MIT

## Credits

LitePad uses the following third-party libraries:

* [H3](https://h3.js.org)  &mdash; the JavaScript framework used.
* [Primer CSS](https://primer.style/css/) &mdash; the CSS framrwork used including [Octicons](https://primer.style/octicons/).
* [Prism](https://prismjs.com/) &mdash; for syntax highlighting of snippets and code.
* [CodeMirror](https://codemirror.net/) &mdash; the editor used for both notes and snoppets.
* [Beautify](https://beautifier.io/) &mdash; for formatting HTML/JS/CSS snippets.
* [CSSLint](http://csslint.net/) &mdash; for linting CSS snippets.
* [Hotkeys](https://wangchujiang.com/hotkeys/) &mdash; for managing keyboard shortcuts.
* [Marked](https://marked.js.org/) &mdash; for rendering HTML from markdown in notes.
* [JSHint](https://jshint.com/) &mdash; for linting JavaScript snippets.
* [HTMLhint](https://htmlhint.com/) &mdash; for linting HTML snippets.
* [JSONlint](https://jsonlint.com/) &mdash; for linting JSON snippets.
* [DOMPurify](https://github.com/cure53/DOMPurify) &mdash; for sanitizing notes before rendering.