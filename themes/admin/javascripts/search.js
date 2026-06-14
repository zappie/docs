(function () {
  "use strict";

  function initDocsChrome() {
    var sidebar = document.getElementById("sidebar");
    var nav = document.getElementById("nav");
    var sidebarTop = sidebar && sidebar.querySelector(".sidebar-top-container");
    var logo = document.getElementById("logo");
    var heading = document.querySelector(".doc-heading");
    if (!sidebar || !nav || !sidebarTop) return;

    if (logo && !logo.querySelector("a")) {
      var homeLink = document.createElement("a");
      homeLink.href = "../";
      homeLink.setAttribute("aria-label", "Back to Zappie API documentation");

      while (logo.firstChild) {
        homeLink.appendChild(logo.firstChild);
      }
      logo.appendChild(homeLink);
    }

    var product = document.createElement("div");
    product.className = "docs-product";

    var productName = document.createElement("span");
    productName.className = "docs-product-name";
    productName.textContent = heading
      ? heading.textContent.replace(/^Zappie\s+/, "")
      : "API Reference";

    var protocol = document.createElement("span");
    protocol.className = "docs-protocol";
    protocol.textContent = "GraphQL";

    product.appendChild(productName);
    product.appendChild(protocol);
    sidebar.insertBefore(product, nav);

    var wrapper = document.createElement("div");
    wrapper.id = "ops-search-box";
    wrapper.innerHTML =
      '<svg class="ops-search-icon" aria-hidden="true" viewBox="0 0 20 20" fill="currentColor">' +
      '<path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/>' +
      "</svg>" +
      '<input id="ops-search-input" type="search" placeholder="Search operations" ' +
      'autocomplete="off" spellcheck="false" aria-label="Search operations" />' +
      '<kbd class="ops-search-hint" title="Press / to focus search">/</kbd>';
    sidebar.insertBefore(wrapper, nav);

    var input = document.getElementById("ops-search-input");
    var hint = wrapper.querySelector(".ops-search-hint");

    function filter(query) {
      var sections = nav.querySelectorAll(".nav-group-section");

      sections.forEach(function (section) {
        var titleElement = section.querySelector(".nav-group-section-title");
        var titleText = titleElement
          ? titleElement.textContent.toLowerCase()
          : "";
        var items = section.querySelectorAll(
          ".nav-group-section-items > li",
        );
        var matched = 0;

        items.forEach(function (item) {
          var show =
            !query ||
            item.textContent.toLowerCase().indexOf(query) !== -1;
          item.style.display = show ? "" : "none";
          if (show) matched += 1;
        });

        var titleMatch = Boolean(
          query && titleText.indexOf(query) !== -1,
        );
        section.style.display =
          !query || matched > 0 || titleMatch ? "" : "none";

        if (titleMatch && matched === 0) {
          items.forEach(function (item) {
            item.style.display = "";
          });
        }
      });

      nav.querySelectorAll(".nav-group").forEach(function (group) {
        var sections = group.querySelectorAll(".nav-group-section");
        if (!sections.length) return;

        var anyVisible = Array.prototype.some.call(
          sections,
          function (section) {
            return section.style.display !== "none";
          },
        );
        group.style.display = !query || anyVisible ? "" : "none";
      });
    }

    input.addEventListener("input", function () {
      var query = this.value.toLowerCase().trim();
      filter(query);
      hint.style.display = query ? "none" : "";
    });

    input.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        this.value = "";
        filter("");
        hint.style.display = "";
        this.blur();
      }
    });

    document.addEventListener("keydown", function (event) {
      var activeTag = document.activeElement.tagName;
      if (
        event.key === "/" &&
        document.activeElement !== input &&
        activeTag !== "INPUT" &&
        activeTag !== "TEXTAREA"
      ) {
        event.preventDefault();
        input.focus();
      }
    });

    input.addEventListener("focus", function () {
      hint.style.display = "none";
    });

    input.addEventListener("blur", function () {
      if (!this.value) hint.style.display = "";
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDocsChrome);
  } else {
    initDocsChrome();
  }
})();
