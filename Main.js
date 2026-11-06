(function () {
  'use strict';

  var root = document.querySelector('.rootx');
  if (!root) { return; }

  var state = { dark: true, active: 0, open: 0, nav: true };

  /* Every control in the markup carries data-act; features register here. */
  var acts = {};
  function on(name, fn) { acts[name] = fn; }
  root.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('[data-act]') : null;
    if (!el) { return; }
    var fn = acts[el.getAttribute('data-act')];
    if (fn) { fn(el); }
  });
})();
