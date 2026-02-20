(function () {
  'use strict';

  function initSearch() {
    var sidebar = document.getElementById('sidebar');
    var nav = document.getElementById('nav');
    if (!sidebar || !nav) return;

    // Inject search box between sidebar-top-container and #nav
    var wrapper = document.createElement('div');
    wrapper.id = 'ops-search-box';
    wrapper.innerHTML =
      '<svg class="ops-search-icon" aria-hidden="true" viewBox="0 0 20 20" fill="currentColor">' +
      '<path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/>' +
      '</svg>' +
      '<input id="ops-search-input" type="search" placeholder="Search operations…" ' +
      'autocomplete="off" spellcheck="false" aria-label="Search operations" />' +
      '<kbd class="ops-search-hint" title="Press / to focus search">╱</kbd>';
    sidebar.insertBefore(wrapper, nav);

    var input = document.getElementById('ops-search-input');
    var hint  = wrapper.querySelector('.ops-search-hint');

    function filter(q) {
      var sections = nav.querySelectorAll('.nav-group-section');

      sections.forEach(function (section) {
        var titleText = (section.querySelector('.nav-group-section-title') || {}).textContent || '';
        titleText = titleText.toLowerCase();
        var items = section.querySelectorAll('.nav-group-section-items > li');
        var matched = 0;

        items.forEach(function (li) {
          var show = !q || li.textContent.toLowerCase().indexOf(q) !== -1;
          li.style.display = show ? '' : 'none';
          if (show) matched++;
        });

        // Section is visible when title matches OR at least one item matches
        var titleMatch = q && titleText.indexOf(q) !== -1;
        var visible    = !q || matched > 0 || titleMatch;
        section.style.display = visible ? '' : 'none';

        // If the title matched but no items did, reveal all items under it
        if (titleMatch && matched === 0) {
          items.forEach(function (li) { li.style.display = ''; });
        }
      });

      // Hide entire top-level nav-group if it has sections and all are hidden
      nav.querySelectorAll('.nav-group').forEach(function (group) {
        var sections = group.querySelectorAll('.nav-group-section');
        if (!sections.length) return; // always show Introduction etc.
        var anyVisible = false;
        sections.forEach(function (s) {
          if (s.style.display !== 'none') anyVisible = true;
        });
        group.style.display = (!q || anyVisible) ? '' : 'none';
      });
    }

    input.addEventListener('input', function () {
      var q = this.value.toLowerCase().trim();
      filter(q);
      hint.style.display = q ? 'none' : '';
    });

    // Clear on Escape
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        this.value = '';
        filter('');
        hint.style.display = '';
        this.blur();
      }
    });

    // Focus on "/" keypress (when not already in a text field)
    document.addEventListener('keydown', function (e) {
      if (
        e.key === '/' &&
        document.activeElement !== input &&
        document.activeElement.tagName !== 'INPUT' &&
        document.activeElement.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        input.focus();
        hint.style.display = 'none';
      }
    });

    input.addEventListener('focus', function () {
      hint.style.display = 'none';
    });

    input.addEventListener('blur', function () {
      if (!this.value) hint.style.display = '';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearch);
  } else {
    initSearch();
  }
})();
