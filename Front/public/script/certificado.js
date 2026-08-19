function initCertificadoIcons() {
  if (typeof icons === 'undefined') return;

  injectIcon('chevron-icon', icons.chevronDown);
  injectIcon('di-icon-user', icons.user);
  injectIcon('di-icon-settings', icons.settings);
  injectIcon('di-icon-moon', icons.moon);
  injectIcon('di-icon-logout', icons.logOut);
  injectIcon('logo-icon', icons.graduation);
  injectIcon('icon-play-continue', icons.play);
  injectIcon('icon-book-visual', icons.book);

  
  injectIcon('stat-icon-1', icons.check);
  injectIcon('stat-icon-2', icons.book);
  injectIcon('stat-icon-3', icons.hammer);

  
  injectIcon('empty-icon-app', icons.clipboard);
  injectIcon('empty-icon-cert', icons.lock);

  
  injectIcon('req-icon-1', icons.check);
  injectIcon('req-icon-2', icons.check);
}

document.addEventListener('DOMContentLoaded', () => {
    initCertificadoIcons();
});
