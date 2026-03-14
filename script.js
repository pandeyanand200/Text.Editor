

/* ── Globals ── */
const editor = document.getElementById('editor');
let savedRange = null;

/* ── Today's date ── */
document.getElementById('today-date').textContent =
  new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});

/* ── execCommand wrapper ── */
function fmt(cmd, val) {
  editor.focus();
  document.execCommand(cmd, false, val || null);
  updateActiveStates();
}

/* ── Headings ── */
function applyHeading(val) {
  editor.focus();
  if (val === 'pre') { document.execCommand('formatBlock', false, 'pre'); }
  else               { document.execCommand('formatBlock', false, val); }
}
function applyHeadingAndFocus(val) {
  applyHeading(val);
  editor.focus();
}

/* ── Font size ── */
function applyFontSize(val) {
  editor.focus();
  document.execCommand('fontSize', false, val);
}

/* ── Blockquote ── */
function wrapBlockquote() {
  editor.focus();
  document.execCommand('formatBlock', false, 'blockquote');
}

/* ── HR ── */
function insertHR() {
  editor.focus();
  document.execCommand('insertHorizontalRule');
}

/* ── Table ── */
function insertTable() {
  editor.focus();
  let html = '<table><thead><tr>';
  for (let c = 0; c < 3; c++) html += `<th>Header ${c+1}</th>`;
  html += '</tr></thead><tbody>';
  for (let r = 0; r < 3; r++) {
    html += '<tr>';
    for (let c = 0; c < 3; c++) html += '<td>Cell</td>';
    html += '</tr>';
  }
  html += '</tbody></table><p><br></p>';
  document.execCommand('insertHTML', false, html);
}

/* ── Link ── */
let linkSavedRange = null;
function openLinkModal() {
  const sel = window.getSelection();
  if (sel.rangeCount) linkSavedRange = sel.getRangeAt(0).cloneRange();
  document.getElementById('link-modal-overlay').classList.add('open');
  setTimeout(() => document.getElementById('link-url').focus(), 50);
}
function closeLinkModal(e) {
  if (!e || e.target === document.getElementById('link-modal-overlay'))
    document.getElementById('link-modal-overlay').classList.remove('open');
}
function confirmLink() {
  const url = document.getElementById('link-url').value.trim();
  if (!url) return;
  if (linkSavedRange) {
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(linkSavedRange);
  }
  editor.focus();
  document.execCommand('createLink', false, url);
  // Make links open in new tab
  editor.querySelectorAll('a').forEach(a => a.target = '_blank');
  document.getElementById('link-url').value = '';
  closeLinkModal();
}
document.getElementById('link-url').addEventListener('keydown', e => {
  if (e.key === 'Enter') confirmLink();
  if (e.key === 'Escape') closeLinkModal();
});

/* ── Image ── */
let imgBarOpen = false;
function openImgBar(e) {
  const bar = document.getElementById('img-url-bar');
  const btn = document.getElementById('btn-img');
  const rect = btn.getBoundingClientRect();
  bar.style.top = (rect.bottom + 6) + 'px';
  bar.style.left = rect.left + 'px';
  if (!imgBarOpen) {
    const sel = window.getSelection();
    if (sel.rangeCount) savedRange = sel.getRangeAt(0).cloneRange();
    bar.classList.add('open');
    imgBarOpen = true;
    setTimeout(() => document.getElementById('img-url-input').focus(), 50);
  } else {
    bar.classList.remove('open');
    imgBarOpen = false;
  }
}
function insertImage() {
  const url = document.getElementById('img-url-input').value.trim();
  if (!url) return;
  if (savedRange) {
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(savedRange);
  }
  editor.focus();
  document.execCommand('insertHTML', false, `<img src="${url}" style="max-width:100%;border-radius:3px;margin:8px 0;">`);
  document.getElementById('img-url-input').value = '';
  document.getElementById('img-url-bar').classList.remove('open');
  imgBarOpen = false;
}
document.getElementById('img-url-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') insertImage();
  if (e.key === 'Escape') { document.getElementById('img-url-bar').classList.remove('open'); imgBarOpen = false; }
});

/* ── Active states ── */
function updateActiveStates() {
  ['bold','italic','underline','strikeThrough'].forEach(cmd => {
    const id = {bold:'btn-bold',italic:'btn-italic',underline:'btn-underline',strikeThrough:'btn-strikethrough'}[cmd];
    document.getElementById(id)?.classList.toggle('active', document.queryCommandState(cmd));
  });
}
editor.addEventListener('keyup', updateActiveStates);
editor.addEventListener('mouseup', updateActiveStates);

/* ── Stats ── */
function updateStats() {
  const text = editor.innerText || '';
  const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  const chars = text.length;
  const paras = editor.querySelectorAll('p,h1,h2,h3,blockquote').length;
  const read  = Math.max(1, Math.round(words / 200));
  document.getElementById('st-words').textContent = words;
  document.getElementById('st-chars').textContent = chars;
  document.getElementById('st-paras').textContent = paras;
  document.getElementById('st-read').textContent  = read + 'm';
}

/* ── Selection status ── */
function updateSelStatus() {
  const sel = window.getSelection();
  const txt = sel.toString();
  const el = document.getElementById('sb-sel');
  el.textContent = txt ? `${txt.length} chars selected` : '';
}

/* ── Auto-save indicator ── */
let saveTimer;
function markDirty() {
  document.getElementById('sb-saved').textContent = '○ Unsaved';
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    localStorage.setItem('folio-content', editor.innerHTML);
    localStorage.setItem('folio-title', document.getElementById('doc-title').value);
    document.getElementById('sb-saved').textContent = '● Saved';
  }, 1200);
}

/* ── Find & Replace ── */
let findMatches = [], findIndex = -1;
function highlightFind() {
  // Remove old highlights — re-inject plain html
  const val = document.getElementById('fr-find').value.trim();
  document.getElementById('fr-status').textContent = val ? '' : '';
  if (!val) return;
  findMatches = [];
  // Count occurrences in text
  const text = editor.innerText;
  let re;
  try { re = new RegExp(val.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'gi'); } catch { return; }
  let m;
  while ((m = re.exec(text)) !== null) findMatches.push(m.index);
  document.getElementById('fr-status').textContent = `${findMatches.length} match${findMatches.length !== 1 ? 'es' : ''}`;
}
function findNext() {
  const val = document.getElementById('fr-find').value.trim();
  if (!val || !findMatches.length) return;
  findIndex = (findIndex + 1) % findMatches.length;
  document.getElementById('fr-status').textContent = `${findIndex+1} / ${findMatches.length}`;
}
function replaceAll() {
  const find = document.getElementById('fr-find').value;
  const rep  = document.getElementById('fr-replace').value;
  if (!find) return;
  let count = 0;
  const walk = (node) => {
    if (node.nodeType === 3) {
      const re = new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g');
      if (re.test(node.textContent)) {
        count += (node.textContent.match(re)||[]).length;
        node.textContent = node.textContent.replace(re, rep);
      }
    } else {
      Array.from(node.childNodes).forEach(walk);
    }
  };
  walk(editor);
  document.getElementById('fr-status').textContent = `Replaced ${count} occurrence${count!==1?'s':''}`;
  markDirty(); updateStats();
}

/* ── Events ── */
editor.addEventListener('input', () => { updateStats(); markDirty(); });
editor.addEventListener('mouseup', updateSelStatus);
editor.addEventListener('keyup', updateSelStatus);

/* ── Keyboard shortcuts ── */
editor.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey) {
    if (e.key === 'b') { e.preventDefault(); fmt('bold'); }
    if (e.key === 'i') { e.preventDefault(); fmt('italic'); }
    if (e.key === 'u') { e.preventDefault(); fmt('underline'); }
    if (e.key === 'k') { e.preventDefault(); openLinkModal(); }
  }
  // Tab → indent
  if (e.key === 'Tab') { e.preventDefault(); fmt(e.shiftKey ? 'outdent' : 'indent'); }
});

/* ── Load saved content ── */
const saved = localStorage.getItem('folio-content');
const savedTitle = localStorage.getItem('folio-title');
if (saved) editor.innerHTML = saved;
if (savedTitle) document.getElementById('doc-title').value = savedTitle;
document.getElementById('doc-title').addEventListener('input', markDirty);
updateStats();

/* Close img bar on outside click */
document.addEventListener('click', e => {
  const bar = document.getElementById('img-url-bar');
  const btn = document.getElementById('btn-img');
  if (!bar.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
    bar.classList.remove('open');
    imgBarOpen = false;
  }
});