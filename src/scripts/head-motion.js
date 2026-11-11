(function () {
  var el = document.documentElement;
  el.classList.add("motion-pending");
  var revealed = false;
  function reveal() {
    if (revealed) return;
    revealed = true;
    el.classList.remove("motion-pending");
  }
  requestAnimationFrame(function () { requestAnimationFrame(reveal); });
  setTimeout(reveal, 1000);
  window.addEventListener("pageshow", reveal);
})();
