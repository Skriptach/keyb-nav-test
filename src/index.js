'use strict';

(function() {
  var HEADERS = [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ];
  var LINKS = 'a';
  var LANDMARKS = [
    'header',
    '[role="banner"]',
    'nav',
    '[role="navigation"]',
    'main',
    '[role="main"]',
    'footer',
    '[role="contentinfo"]',
    'aside',
    '[role="complementary"]',
    'section',
    'article',
    '[role="search"]',
    'form',
    '[role="form"]'
  ];
  var ALL = HEADERS.concat(LINKS).concat(LANDMARKS);
  var EDITABLE = [
    'textarea',
    'input:not([type="submit"]):not([type="button"]):not([type="radio"]):not([type="color"])',
    '[contenteditable]'
  ];

  var lastFocused = document.querySelector(':focus');
  var direction = 1;

  function insertStyle() {
    var pageStyle = document.createElement('style');
    var selector = ALL.map(function(s) {
      return s+':focus';
    }).join();
    pageStyle.innerHTML = selector + '{outline: 2px solid #000;box-shadow: 0 0 2px 4px #fff;}';
    document.head.append(pageStyle);
  }

  function isVisible(element) {
    var rect = element.getBoundingClientRect();
    for (var prop in rect) {
      if (typeof rect[prop] === 'number' && rect[prop] !== 0) {
        return true;
      }
    }
    return false;
  }

  function getNext(currentType, relative) {
    var targetNodeName = relative ? relative.nodeName.toLowerCase() : null;
    var selector = [ currentType, targetNodeName ].filter(Boolean).join();
    var list = Array.from(document.querySelectorAll(selector)).filter(relevant).filter(isVisible);
    if (!list.length || (list.length === 1 && list[0] === relative)) {
      return;
    }
    var at = list.indexOf(relative) + direction;
    return at < 0 ? list[list.length - 1] : list[at % list.length];

    function relevant(el) {
      return el.matches(currentType) || el === relative;
    }
  }

  function keyHandler(event) {
    if (event.target.matches(EDITABLE) || event.altKey || event.ctrlKey || event.shiftKey) {
      return;
    }
    var relative = event.target.matches(':focus')
      ? event.target
      : lastFocused && lastFocused.closest('body') ? lastFocused : null;
    var next;
    switch (event.key) {
      case 'Down': // IE/Edge specific value
      case 'ArrowDown':
        direction = 1;
        break;
      case 'Up': // IE/Edge specific value
      case 'ArrowUp':
        direction = -1;
        break;
      case 'h':
        next = getNext(HEADERS.join(), relative);
        break;
      case 'l':
        next = getNext(LINKS, relative);
        break;
      case 'm':
        next = getNext(LANDMARKS.join(), relative);
        break;
      default:
        return;
    }
    if (next) {
      if (next.tabIndex < 0) {
        next.tabIndex = 0;
      }
      next.focus();
      lastFocused = next;
    }
  }

  function focusChanged(event) {
    lastFocused = event.target !== window && event.target !== document.body ? event.target : lastFocused;
  }

  window.addEventListener('keydown', keyHandler);
  window.addEventListener('focus', focusChanged, true);
  insertStyle();
})();
