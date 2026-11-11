window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-5CX3KE8FFP');
(function () {
  function loadGtag() {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=G-5CX3KE8FFP';
    document.head.appendChild(s);
  }
  function onIdle() {
    if ('requestIdleCallback' in window) requestIdleCallback(loadGtag, { timeout: 200 });
    else setTimeout(loadGtag, 200);
  }
  if (document.readyState === 'complete') onIdle();
  else window.addEventListener('load', onIdle);
})();
