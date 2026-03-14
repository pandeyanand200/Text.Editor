# Folio — Rich Text Editor

A clean, editorial-style rich text editor built with pure HTML, CSS, and JavaScript. No frameworks, no dependencies — just open the file in any browser and start writing.

---

## Features

### Toolbar

| Group | Controls |
|-------|----------|
| **History** | Undo, Redo |
| **Block Style** | Paragraph, Heading 1–3, Code Block |
| **Font Size** | Small, Normal, Large, X-Large, 2X |
| **Text Formatting** | Bold, Italic, Underline, Strikethrough |
| **Alignment** | Left, Center, Right, Justify |
| **Lists** | Bullet list, Numbered list, Indent, Outdent |
| **Inserts** | Blockquote, Highlight, HR divider, Table (3×3), Image (URL), Link |
| **Color** | Text color picker, Background color picker |
| **Extras** | Clear formatting, Print |

### Sidebar

- **Document Stats** — live word count, character count, paragraph count, estimated read time
- **Quick Styles** — one-click buttons for H1, H2, H3, Blockquote, Divider, Table
- **Find & Replace** — search with match count, replace all occurrences

### Editor

- Full `contenteditable` rich-text area with custom typography
- Playfair Display headings, DM Mono code blocks, Lato body text
- Styled blockquotes, tables, inline code, images, links, and highlights
- Red caret and custom text selection color
- Decorative left margin rule

### Persistence

- Auto-saves content and document title to `localStorage`
- 1.2-second debounce — saves after you stop typing
- Content survives page refreshes and browser restarts

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl / ⌘ + B` | Bold |
| `Ctrl / ⌘ + I` | Italic |
| `Ctrl / ⌘ + U` | Underline |
| `Ctrl / ⌘ + K` | Insert Link |
| `Ctrl / ⌘ + Z` | Undo |
| `Ctrl / ⌘ + Y` | Redo |
| `Tab` | Indent |
| `Shift + Tab` | Outdent |

---

## Getting Started

1. Download `rich-text-editor.html`
2. Open it in any modern browser (Chrome, Firefox, Edge, Safari)
3. Start writing — no installation or setup required

> The editor works entirely offline. There is no server, no build step, and no external dependencies beyond Google Fonts (loaded over CDN for typography).

---

## File Structure

The entire editor is a **single self-contained HTML file**:

```
rich-text-editor.html
├── <head>          Google Fonts import (Playfair Display, DM Mono, Lato)
├── <style>         All CSS — layout, toolbar, sidebar, paper, typography
├── <body>
│   ├── #brand      Logo / wordmark
│   ├── #toolbar    All formatting buttons and selects
│   ├── #sidebar    Stats, quick styles, find & replace
│   ├── #canvas     Scrollable page area
│   │   ├── .page-meta   Document title input + date
│   │   ├── #paper       The white page sheet
│   │   │   └── #editor  contenteditable div
│   │   └── #statusbar   Save indicator + selection info
│   ├── #link-modal-overlay   Link insertion modal
│   └── #img-url-bar          Image URL popover
└── <script>        All JavaScript — commands, stats, autosave, find/replace
```

---

## How It Works

The editor uses the browser's built-in `document.execCommand()` API to apply formatting, which operates directly on the selected content inside the `contenteditable` div. No virtual DOM or rich-text library is needed.

**Key functions:**

- `fmt(cmd, val)` — wraps `execCommand` and refreshes active button states
- `applyHeading(val)` — uses `formatBlock` to wrap selections in heading tags
- `updateStats()` — reads `editor.innerText`, counts words/chars/paragraphs
- `markDirty()` — debounced function that saves to `localStorage`
- `replaceAll()` — walks the DOM text nodes recursively to find and replace text
- `openLinkModal()` — saves the current selection range, then restores it before inserting a link

---

## Browser Support

Works in all modern browsers that support `contenteditable` and `execCommand`:

| Browser | Support |
|---------|---------|
| Chrome 80+ | ✅ Full |
| Firefox 75+ | ✅ Full |
| Edge 80+ | ✅ Full |
| Safari 13+ | ✅ Full |

> Note: `document.execCommand` is marked deprecated in the spec but remains supported in all major browsers with no planned removal. It is the standard approach for `contenteditable` editors without a library.

---

## Customization

All design tokens are CSS variables at the top of the `<style>` block:

```css
:root {
  --ink: #1a1a18;           /* Primary text color */
  --paper: #f5f2eb;         /* Page background */
  --accent: #b84a2e;        /* Red accent (caret, blockquote rule, links) */
  --gold: #c9a84c;          /* Gold accent (highlight tint) */
  --sidebar-w: 220px;       /* Sidebar width */
  --toolbar-h: 52px;        /* Toolbar height */
}
```

Change these values to retheme the entire editor instantly.

---

## Print

Click the **print button** in the toolbar (or use `Ctrl/⌘ + P`). A print stylesheet hides the toolbar, sidebar, and chrome — only the document content is printed on a clean white page.

---

## Limitations

- **No cloud sync** — content is stored in the browser's `localStorage` only (5 MB limit)
- **No collaboration** — single-user, single-browser
- **No file export** — use Print → Save as PDF to export; or copy content to another editor
- **No image upload** — images are inserted by URL only
- `execCommand` does not support some advanced operations (e.g., nested lists, custom font families) without a full editor library

---

## License

This project is released as-is for personal and educational use. Feel free to modify and adapt it for your own projects.
