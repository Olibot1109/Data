window.DataAPI = (() => {
  const API    = 'https://data-dx5i.onrender.com/api.html';
  const SK_REQ = '__DATAAPI_REQ__';
  const SK_RES = '__DATAAPI_RES__';

  let _returnHandlers = [];
  let _ready = null;

  // Called on load — check for ?data= in URL and resolve pending request
  function _init() {
    const params = new URLSearchParams(location.search);
    const raw = params.get('data');
    let res = null;

    if (raw) {
      try {
        res = JSON.parse(raw);
        sessionStorage.setItem(SK_RES, JSON.stringify(res));
      } catch {
        res = { success: false, error: 'parse_error', raw };
      }
      // Clean URL without reloading
      const clean = new URL(location.href);
      clean.searchParams.delete('data');
      history.replaceState(null, '', clean.toString());

      _returnHandlers.forEach(fn => { try { fn(res); } catch {} });
    } else {
      const cached = sessionStorage.getItem(SK_RES);
      if (cached) try { res = JSON.parse(cached); } catch {}
    }

    _ready = Promise.resolve(res);
  }

  function _go(params) {
    sessionStorage.setItem(SK_REQ, JSON.stringify(params));
    location.href = API + '?' + new URLSearchParams(params).toString();
  }

  function write(key, value, meta = {}) {
    _go({ action: 'write', key, value: JSON.stringify(value), meta: JSON.stringify(meta), return: location.href });
  }

  function read(key) {
    _go({ action: 'read', key, return: location.href });
  }

  function del(key) {
    _go({ action: 'delete', key, return: location.href });
  }

  function exists(key) {
    _go({ action: 'exists', key, return: location.href });
  }

  function list() {
    _go({ action: 'list', return: location.href });
  }

  // Returns the parsed response from the current URL ?data= param (call once on load)
  function response() {
    const params = new URLSearchParams(location.search);
    const raw = params.get('data');
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return { success: false, error: 'parse_error', raw }; }
  }

  // Last response cached in sessionStorage
  function lastResponse() {
    try { return JSON.parse(sessionStorage.getItem(SK_RES)); } catch { return null; }
  }

  // Last request cached in sessionStorage
  function lastRequest() {
    try { return JSON.parse(sessionStorage.getItem(SK_REQ)); } catch { return null; }
  }

  // Promise resolving to response on load (or null if no ?data=)
  function ready() {
    return _ready || Promise.resolve(null);
  }

  // Register a callback to run when a DataAPI response is detected on page load
  function onReturn(fn) {
    _returnHandlers.push(fn);
  }

  // Poll for a key until it exists or timeout
  function subscribe(key, { interval = 2000, timeout = 30000, onUpdate } = {}) {
    const start = Date.now();
    let stopped = false;

    function poll() {
      if (stopped || Date.now() - start > timeout) return;
      // Redirect-based API can't poll inline — use fetch if your server exposes a JSON endpoint
      // This is a placeholder that emits from lastResponse if key matches
      const last = lastResponse();
      if (last?.key === key && onUpdate) onUpdate(last);
      setTimeout(poll, interval);
    }

    poll();
    return { stop() { stopped = true; } };
  }

  // Clear all cached state
  function clear() {
    sessionStorage.removeItem(SK_REQ);
    sessionStorage.removeItem(SK_RES);
  }

  // Auto-init on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _init);
  } else {
    _init();
  }

  return { write, read, delete: del, exists, list, response, lastResponse, lastRequest, ready, onReturn, subscribe, clear };
})();
