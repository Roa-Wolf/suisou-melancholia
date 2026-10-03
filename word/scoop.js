// scoop — WORDに沈んでいるお題から、一題だけを水面へ引き上げる。
// JavaScriptが動かない環境では、このブロック自体を表示しない。
(function () {
  var root = document.getElementById('scoop');
  if (!root) return;

  var prompts = [];
  document.querySelectorAll('.prompt-series').forEach(function (series) {
    var heading = series.querySelector('h2');
    var title = heading ? heading.lastChild.textContent.trim() : '';
    series.querySelectorAll('.prompt-list li').forEach(function (li, i) {
      prompts.push({ text: li.textContent.trim(), series: title, id: series.id, no: i + 1 });
    });
  });
  if (!prompts.length) return;

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var trigger = root.querySelector('.scoop-trigger');
  var surface = root.querySelector('.scoop-surface');
  var line = root.querySelector('.scoop-line');
  var from = root.querySelector('.scoop-from');
  var actions = root.querySelector('.scoop-actions');
  var again = root.querySelector('[data-act="again"]');
  var copy = root.querySelector('[data-act="copy"]');
  var jump = root.querySelector('.scoop-jump');
  var last = -1;
  var current = null;
  var busy = false;

  function pick() {
    var n;
    do { n = Math.floor(Math.random() * prompts.length); } while (prompts.length > 1 && n === last);
    last = n;
    return prompts[n];
  }

  function rise() {
    current = pick();
    line.textContent = current.text;
    from.textContent = current.series + ' — ' + String(current.no).padStart(2, '0');
    jump.href = '#' + current.id;
    surface.classList.remove('is-sinking');
    void surface.offsetWidth; // アニメーションを毎回やり直すため
    surface.classList.add('is-risen');
    root.classList.add('has-risen');
    actions.hidden = false;
    trigger.hidden = true;
    copy.textContent = '写す';
  }

  function sinkThenRise() {
    if (busy) return;
    if (reduced || !surface.classList.contains('is-risen')) { rise(); return; }
    busy = true;
    surface.classList.remove('is-risen');
    surface.classList.add('is-sinking');
    setTimeout(function () { busy = false; rise(); }, 700);
  }

  trigger.addEventListener('click', rise);
  again.addEventListener('click', sinkThenRise);

  copy.addEventListener('click', function () {
    if (!current) return;
    var done = function () {
      copy.textContent = '写しました';
      setTimeout(function () { copy.textContent = '写す'; }, 1600);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(current.text).then(done, function () {});
    } else {
      var t = document.createElement('textarea');
      t.value = current.text;
      t.setAttribute('readonly', '');
      t.style.position = 'absolute';
      t.style.left = '-9999px';
      document.body.appendChild(t);
      t.select();
      try { document.execCommand('copy'); done(); } catch (e) {}
      document.body.removeChild(t);
    }
  });

  root.hidden = false;
})();
