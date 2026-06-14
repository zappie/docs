"use strict";

function scrollSpy() {
  var INIT_DELAY_MS = 300;
  var SCROLL_DEBOUNCE_MS = 100;
  var RESIZE_DEBOUNCE_MS = 500;
  var PADDING = 5;

  var htmlElement = document.querySelector("html");
  if (htmlElement) {
    var scrollPaddingTop = window.getComputedStyle(
      htmlElement,
    ).scrollPaddingTop;
    if (
      scrollPaddingTop &&
      typeof scrollPaddingTop === "string" &&
      scrollPaddingTop !== "auto" &&
      scrollPaddingTop.endsWith("px")
    ) {
      PADDING += parseInt(scrollPaddingTop.split("px")[0], 10);
    }
  }

  var ACTIVE_CLASS = "nav-scroll-active";
  var EXPAND_CLASS = "nav-scroll-expand";
  var EXPANDABLE_SELECTOR = ".nav-group-section";
  var currentIndex = null;
  var sections = [];

  function init() {
    findScrollPositions();
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
  }

  function findScrollPositions() {
    currentIndex = null;
    sections = [];

    var allScrollableItems = document.querySelectorAll(
      "[data-traverse-target]",
    );
    Array.prototype.forEach.call(allScrollableItems, function (element) {
      sections.push({ id: element.id, top: element.offsetTop });
    });
  }

  function keepNavItemVisible(element) {
    var nav = document.getElementById("nav");
    if (!nav || !nav.contains(element)) return;

    var navRect = nav.getBoundingClientRect();
    var elementRect = element.getBoundingClientRect();
    var navPadding = 16;

    if (elementRect.top < navRect.top + navPadding) {
      nav.scrollTop += elementRect.top - navRect.top - navPadding;
    } else if (elementRect.bottom > navRect.bottom - navPadding) {
      nav.scrollTop += elementRect.bottom - navRect.bottom + navPadding;
    }
  }

  var handleResize = debounce(function () {
    findScrollPositions();
    handleScroll();
  }, RESIZE_DEBOUNCE_MS);

  var handleScroll = debounce(function () {
    var scrollPosition =
      document.documentElement.scrollTop || document.body.scrollTop;
    var index = getVisibleSectionIndex(scrollPosition);

    if (index === currentIndex) return;

    currentIndex = index;
    var section = sections[index];
    var activeElement = document.querySelector("." + ACTIVE_CLASS);
    var nextElement = section
      ? document.querySelector('#nav a[href="#' + section.id + '"]')
      : null;

    var nextParent = getParentSection(nextElement);
    var activeParent = getParentSection(activeElement);
    var isDifferentParent = activeParent !== nextParent;

    if (activeParent && isDifferentParent) {
      toggleSectionExpansion(activeParent, false);
    }
    if (nextParent && isDifferentParent) {
      toggleSectionExpansion(nextParent, true);
    }

    if (nextElement) {
      nextElement.classList.add(ACTIVE_CLASS);
      keepNavItemVisible(nextElement);
    }

    if (activeElement) {
      activeElement.classList.remove(ACTIVE_CLASS);
    }
  }, SCROLL_DEBOUNCE_MS);

  function toggleSectionExpansion(element, shouldExpand) {
    var classListFunction = shouldExpand ? "add" : "remove";

    while (element) {
      element.classList[classListFunction](EXPAND_CLASS);
      element = getParentSection(element.parentNode);
    }
  }

  function getParentSection(element) {
    if (!element || !element.closest) return null;
    return element.closest(EXPANDABLE_SELECTOR);
  }

  function getVisibleSectionIndex(scrollPosition) {
    var positionToCheck = scrollPosition + PADDING;

    for (var index = 0; index < sections.length; index += 1) {
      var section = sections[index];
      var nextSection = sections[index + 1];
      if (
        positionToCheck >= section.top &&
        (!nextSection || positionToCheck < nextSection.top)
      ) {
        return index;
      }
    }

    return -1;
  }

  setTimeout(init, INIT_DELAY_MS);
}
