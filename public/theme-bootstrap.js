(function bootstrapTheme() {
  var storageKey = 'becoming-theme-v1';
  var preference = 'dark';

  try {
    var serialized = window.localStorage.getItem(storageKey);
    if (serialized) {
      var parsed = JSON.parse(serialized);
      var candidate =
        typeof parsed === 'string'
          ? parsed
          : parsed && parsed.state
            ? parsed.state.theme
            : parsed && parsed.theme;
      if (candidate === 'dark' || candidate === 'light' || candidate === 'system') {
        preference = candidate;
      }
    }
  } catch {
    // Keep the dark default when storage is unavailable or malformed.
  }

  var resolved =
    preference === 'system'
      ? window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : preference;
  var root = document.documentElement;
  root.classList.remove('dark', 'light');
  root.classList.add(resolved);
  root.dataset.theme = resolved;
  root.dataset.themePreference = preference;
  root.style.colorScheme = resolved;

  var themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) themeColor.content = resolved === 'dark' ? '#020205' : '#f8fafc';
})();
