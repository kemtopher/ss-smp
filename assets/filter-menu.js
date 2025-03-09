function ptStyleTag() {
  var ptStyle = document.createElement('style');
  ptStyle.id = 'pt-style-tag'
  ptStyle.textContent = '.pt-filter-menu-container { opacity:0;}';
  document.head.appendChild(ptStyle);
}
ptStyleTag();

function PowerToolsFilterMenu() {
  // Helper functions
  function isVisible(el) {
    var style = window.getComputedStyle(el);
    return !(style.display === 'none')
  }

  function slideUp(target, duration, callback) {
    if (duration == 'undefined') duration = 500;
    target.style.transitionProperty = 'height, margin, padding';
    target.style.transitionDuration = duration + 'ms';
    target.style.boxSizing = 'border-box';
    target.style.height = target.offsetHeight + 'px';
    target.offsetHeight;
    target.style.overflow = 'hidden';
    target.style.height = 0;
    target.style.paddingTop = 0;
    target.style.paddingBottom = 0;
    target.style.marginTop = 0;
    target.style.marginBottom = 0;
    target.style.zIndex = 99;
    window.setTimeout(function() {
      target.style.display = 'none';
      target.style.removeProperty('height');
      target.style.removeProperty('padding-top');
      target.style.removeProperty('padding-bottom');
      target.style.removeProperty('margin-top');
      target.style.removeProperty('margin-bottom');
      target.style.removeProperty('overflow');
      target.style.removeProperty('transition-duration');
      target.style.removeProperty('transition-property');
      target.style.removeProperty('z-index');
      if (callback) { callback(); }
    }, duration);
  }

  function slideDown(target, duration, callback) {
    if (duration == 'undefined') duration = 500;
    target.style.removeProperty('display');
    var display = window.getComputedStyle(target).display;
    if (display === 'none') display = 'block';
    target.style.display = display;
    var height = target.offsetHeight;
    target.style.overflow = 'hidden';
    target.style.height = 0;
    target.style.paddingTop = 0;
    target.style.paddingBottom = 0;
    target.style.marginTop = 0;
    target.style.marginBottom = 0;
    target.offsetHeight;
    target.style.boxSizing = 'border-box';
    target.style.transitionProperty = "height, margin, padding";
    target.style.transitionDuration = duration + 'ms';
    target.style.height = height + 'px';
    target.style.removeProperty('padding-top');
    target.style.removeProperty('padding-bottom');
    target.style.removeProperty('margin-top');
    target.style.removeProperty('margin-bottom');
    target.style.zIndex = 100;
    window.setTimeout(function() {
      target.style.removeProperty('height');
      target.style.removeProperty('overflow');
      target.style.removeProperty('transition-duration');
      target.style.removeProperty('transition-property');
      target.style.removeProperty('z-index');
      if (callback) { callback(); }
    }, duration);
  }

  function slideToggle(target, duration, callback) {
    if (window.getComputedStyle(target).display === 'none') {
      return slideDown(target, duration, callback);
    } else {
      return slideUp(target, duration, callback);
    }
  }

  function applyEnabled() {
    return !!window.powerToolsSettings.applyEnabled
  }

  function drawerEnabled() {
    return !!window.powerToolsSettings.drawerEnabled
  }

  function drawerEnableMobileOnly() {
    return !!window.powerToolsSettings.drawerEnableMobileOnly
  }

  function ajaxEnabled() {
    return !!window.powerToolsSettings.ptAjaxEnabled
  }

  function sortByEnabled() {
    return !!window.powerToolsSettings.ptSortByEnabled
  }

  // .matches() & .closest() polyfills
  if (!Element.prototype.matches) {
    Element.prototype.matches =
      Element.prototype.msMatchesSelector ||
      Element.prototype.webkitMatchesSelector;
  }

  if (!Element.prototype.closest) {
    Element.prototype.closest = function(s) {
      var el = this;

      do {
        if (Element.prototype.matches.call(el, s)) return el;
        el = el.parentElement || el.parentNode;
      } while (el !== null && el.nodeType === 1);
      return null;
    };
  }

  // On load/reload
  function ptOnLoad() {
    // Handle multiple filter menus on page
    var filterMenuContainers = document.querySelectorAll(
      '.pt-filter-menu-container'
    );
    var filterMenus = document.querySelectorAll('.filter-menu');

    // onLoadMq is used for drawer on mobile only setting
    var onLoadMq = window.matchMedia(
      `(max-width: ${window.powerToolsSettings.ptMobileMaxWidth})`
    );

    // Apply settings classes
    if (window.powerToolsSettings.classes) {
      filterMenuContainers.forEach((container) => {
        window.powerToolsSettings.classes.forEach((className) => {
          container.classList.add(className);
        });

        if (drawerEnabled()) {
          filterMenuContainers.forEach((container) => {
            container.classList.remove('show-mobile-menu-btn');
          });

          if (drawerEnableMobileOnly()) {
            function toggleMobileDrawerClass(mq) {
              filterMenuContainers.forEach((container) => {
                mq.matches
                  ? container.classList.add('pt-drawer-active-mobile')
                  : container.classList.remove('pt-drawer-active-mobile');
              });
            }
            onLoadMq.addEventListener('change', toggleMobileDrawerClass);
            toggleMobileDrawerClass(onLoadMq);
          }
        }
      });
    }

    if (window.powerToolsSettings.groupClasses) {
      document
        .querySelectorAll(
          '.pt-filter-menu-container .filter-group:not(.refine-header):not(.filter-group-pt-apply-group)'
        )
        .forEach((element) => {
          window.powerToolsSettings.groupClasses.forEach((groupClass) => {
            element.classList.add(groupClass);
            if (sortByEnabled()) {
              document
                .querySelectorAll('.filter-group-sort-orders')
                .forEach((group) => {
                  group.classList.add(groupClass);
                });
            }
          });
        });
    }

    if (window.powerToolsSettings.selectedClasses) {
      document
        .querySelectorAll(
          '.pt-filter-menu-container .filter-group.has_group_selected'
        )
        .forEach((element) => {
          window.powerToolsSettings.selectedClasses.forEach((selectedClass) => {
            element.classList.add(selectedClass);
          });
        });
    }

    function isSafari() {
      var userAgent = navigator.userAgent;
      // Check for Safari
      // Safari can be identified by the presence of 'Safari' in the user agent string
      // and the absence of 'Chrome', 'Chromium', 'Edg', 'OPR', 'CriOS', and 'FxiOS',
      // which are identifiers for Chrome, Edge, Opera, and their iOS versions.
      var isSafari =
        /safari/i.test(userAgent) &&
        !/chrome|chromium|crios|edg|opr|fxios/i.test(userAgent);
      return isSafari;
    }

    if (isSafari()) {
      // we use this class for fixing Safari issues
      document
        .querySelectorAll('.filter-menu')
        .forEach((fm) => fm.classList.add('is-safari'));
    }

    // Handle Sort By section
    if (sortByEnabled()) {
      var sortByGroup = document.querySelector('.filter-group.filter-group-sort-orders')
      if (!!document.querySelector('.pt-sort-position-top')) {
        filterMenuContainers.forEach(filterMenu => {
          var firstFilterGroup = filterMenu.querySelector('.filter-group:not(.refine-header)');
          firstFilterGroup.insertAdjacentElement('beforebegin', sortByGroup.cloneNode(true))
        })
      } else {
        if (applyEnabled()) {
          var applyBtns = document.querySelectorAll('.filter-menu .filter-group-pt-apply-group');
          applyBtns.forEach((btn) => {
            btn.insertAdjacentElement('beforebegin',sortByGroup.cloneNode(true));
          });
        } else {
          filterMenus.forEach((fm) => {
            fm.appendChild(sortByGroup.cloneNode(true));
          });
        }
      }
      // remove inline styles to allow the cloned sort-by groups to show
      document
        .querySelectorAll('.filter-menu .filter-group-sort-orders')
        .forEach((group) => {
          group.removeAttribute('style');
        });

      // if ajax or apply button enabled, update href in the sort orders so it matches the target url, not the current url
      var sortByOptions = document.querySelectorAll(
        '.filter-menu [data-sort-option]'
      );
      var currentSortOrder =
        new URL(window.location.href).searchParams.get('sort_by') ||
        powerToolsSettings.ptDefaultSort;
      var applyHref;
      var applyGroup = document.querySelector('.pt-apply-group');
      if (!!applyGroup) {
        applyHref = applyGroup.getAttribute('href');
      }
      var filterLinks = document.querySelectorAll(
        '.filter-group:not(.filter-group-sort-orders) li:not(.inactive) a.pt-filter-link, .filter-menu .filter-clear'
      );

      if (applyEnabled() && applyHref != '#') {
        var applyUrl = new URL(applyHref, window.location.origin);
        var newCurrentSortOrder = applyUrl.searchParams.get('sort_by');
        if (newCurrentSortOrder != null) {
          currentSortOrder = newCurrentSortOrder;
        }

        for (var i = 0; i < sortByOptions.length; i++) {
          var sortOptionValue =
            sortByOptions[i].getAttribute('data-sort-option');
          applyUrl.searchParams.set('sort_by', sortOptionValue);
          sortByOptions[i].querySelector('a').href = applyUrl.href;
        }
      }

      // Display selected sort order
      for (var i = 0; i < sortByOptions.length; i++) {
        if (
          sortByOptions[i].getAttribute('data-sort-option') == currentSortOrder
        ) {
          sortByOptions[i].classList.add('selected');
          break;
        }
      }

      // Apply selected sort order to the filter links
      Array.prototype.forEach.call(filterLinks, function (a) {
        var url = new URL(a.href);
        url.searchParams.set('sort_by', currentSortOrder);
        a.href = url.href;
      });
    }

    // Accordions
    var accordionGroups = document.querySelectorAll(
      '.pt-filter-menu-container .filter-group:not(.refine-header):not(.filter-group-pt-apply-group)'
    );
    if (accordionGroups.length > 0) {
      for (var i = 0; i < accordionGroups.length; i++) {
        // Enter or space keydown listener for keyboard users
        accordionGroups[i]
          .querySelector('h4')
          .addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              this.click();
            }
          });

        // Accessibility
        if (accordionGroups[i].classList.contains('pt-group-expanded')) {
          accordionGroups[i]
            .querySelector('h4')
            .setAttribute('aria-expanded', 'true');
        } else {
          accordionGroups[i]
            .querySelector('h4')
            .setAttribute('aria-expanded', 'false');
        }
      }

      // Expand first non-selected accordion group
      if (document.querySelectorAll('.accordion-mode-first').length > 0) {
        for (var i = 0; i < accordionGroups.length; i++) {
          if (
            isVisible(accordionGroups[i]) &&
            !accordionGroups[i].classList.contains('pt-display-dropdown') &&
            !accordionGroups[i].classList.contains('has_group_selected') &&
            !accordionGroups[i].classList.contains('pt-display-nested')
          ) {
            accordionGroups[i].classList.add('pt-group-expanded');
            accordionGroups[i]
              .querySelector('h4')
              .setAttribute('aria-expanded', 'true');
            break;
          }
        }
      }
    }

    // Search
    var searchGroups = document.querySelectorAll(
      '.pt-display-search:not(.has_group_selected)'
    );
    for (var i = 0; i < searchGroups.length; i++) {
      var searchInput = searchGroups[i].querySelector('input.fm-search-box');
      searchInput.style.display = 'block';
      searchInput.addEventListener('keyup', function () {
        var value = this.value.toLowerCase();
        var listItems = this.closest('.filter-group').querySelectorAll('li');

        for (var i = 0; i < listItems.length; i++) {
          if (listItems[i].innerText.trim().toLowerCase().search(value) > -1) {
            listItems[i].style.display = 'inherit';
          } else {
            listItems[i].style.display = 'none';
          }
        }
      });
    }

    // Drop downs
    var dropdowns = document.querySelectorAll('.pt-display-dropdown');
    if (dropdowns.length > 0) {
      dropdowns.forEach((dropdown) => {
        // Remove accordion classes
        if (dropdown.classList.contains('pt-accordion-group')) {
          dropdown.classList.remove('pt-accordion-group');
        }

        // Remove menu trigger if it already exists
        if (dropdown.querySelector('.menu-trigger') != null) {
          dropdown.querySelector('.menu-trigger').remove();
        }

        // Set up menu-triggers
        var groupTitle = dropdown.querySelector('h4').innerHTML.trim();
        var menuTriggerText = '';

        if (dropdown.classList.contains('has_group_selected')) {
          var selectedFilters = dropdown.querySelectorAll(
            '.scroll-content li.selected .collection-name a'
          );
          var selectedText = Array.from(selectedFilters)
            .map((element) => element.innerHTML.trim())
            .join(', ');
          selectedText = selectedText.replace(/<[^>]*>/g, ''); // Remove HTML tags from selectedText
          menuTriggerText =
            selectedText.length < 30
              ? selectedText
              : `${selectedFilters.length} Selected`;
        } else {
          menuTriggerText = `Select ${groupTitle.replace(/<[^>]*>/g, '')}`; // Remove HTML tags from groupTitle
        }

        // Set menu-trigger text content
        dropdown
          .querySelector('.scroll-content')
          .insertAdjacentHTML(
            'beforebegin',
            `<div class="menu-trigger" tabindex="0" aria-label="${groupTitle} dropdown selection collapsed">${menuTriggerText}</div>`
          );

        // Event handlers for opening dropdowns is included in "Delegate Event Listeners", handlers here are for closing dropdowns and keyboard events
        // Mouseleave listener
        // dropdown.querySelector('.scroll-content').addEventListener('mouseleave', function (e) {
        //   this.classList.remove('dropdown-open')
        //   slideUp(this, 200)
        //   this.previousSibling.setAttribute('aria-label', this.parentNode.querySelector('h4').innerText.trim() + ' dropdown selection collapsed')
        // })

        // Enter or space keydown listener for keyboard users to open dropdowns
        dropdown
          .querySelector('.menu-trigger')
          .addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              this.click();
            }
          });

        // Focus out listener for keyboard users
        dropdown
          .querySelector('.scroll-content li:last-child')
          .addEventListener('focusout', function (e) {
            var scrollContent = this.closest('.scroll-content');
            var menuTrigger =
              scrollContent.parentNode.querySelector('.menu-trigger');
            scrollContent.classList.remove('dropdown-open');
            slideUp(scrollContent, 200);
            menuTrigger.setAttribute(
              'aria-label',
              scrollContent.parentNode.querySelector('h4').innerText.trim() +
                ' dropdown selection collapsed'
            );
          });
      });

      // Close dropdowns on click outside
      document.addEventListener('click', function (e) {
        dropdowns.forEach((dropdown) => {
          var scrollContent = dropdown.querySelector('.scroll-content');
          if (
            scrollContent &&
            scrollContent.classList.contains('dropdown-open') &&
            !scrollContent.contains(e.target) &&
            !dropdown.querySelector('.menu-trigger').contains(e.target)
          ) {
            scrollContent.classList.remove('dropdown-open');
            slideUp(scrollContent, 200);
            dropdown
              .querySelector('.menu-trigger')
              .setAttribute(
                'aria-label',
                dropdown.querySelector('h4').innerText.trim() +
                  ' dropdown selection collapsed'
              );
          }
        });
      });

      // Escape key close open dropdowns
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          dropdowns.forEach((dropdown) => {
            var scrollContent = dropdown.querySelector('.scroll-content');
            if (
              scrollContent &&
              scrollContent.classList.contains('dropdown-open')
            ) {
              scrollContent.classList.remove('dropdown-open');
              slideUp(scrollContent, 200);
              dropdown
                .querySelector('.menu-trigger')
                .setAttribute(
                  'aria-label',
                  dropdown.querySelector('h4').innerText.trim() +
                    ' dropdown selection collapsed'
                );
            }
          });
        }
      });
    }

    // Sticky mode CSS
    if (powerToolsSettings.ptStickyMode == 'pt-sticky') {
      var stickySelectors = document.querySelectorAll(
        powerToolsSettings.ptStickySelector
      );
      if (stickySelectors.length > 0) {
        stickySelectors.forEach((selector) => {
          selector.classList.add(powerToolsSettings.ptStickyMode);
        });
      }
    }

    // View more buttons
    for (var i = 0; i < filterMenuContainers.length; i++) {
      if (filterMenuContainers[i].classList.contains('view-more-enabled')) {
        var viewMoreGroup = filterMenuContainers[i].querySelectorAll(
          '.filter-group:not(.filter-group-sort-orders) ul:not(.has_selected)'
        );
        var max = powerToolsSettings.ptViewMoreMaxCount;

        for (var i = 0; i < viewMoreGroup.length; i++) {
          var listItems = Array.from(
            viewMoreGroup[i].querySelectorAll('li:not(.selected)')
          );

          if (listItems.length > max) {
            var itemsToHide = listItems.slice(max);

            for (var j = 0; j < itemsToHide.length; j++) {
              itemsToHide[j].style.display = 'none';
            }
            viewMoreGroup[i].insertAdjacentHTML(
              'afterend',
              '<li class="view-more-link"><a href="javascript:;">' +
                powerToolsSettings.ptViewMoreText +
                '</a></li>'
            );
          }
        }

        document.addEventListener('click', function (e) {
          if (e.target.parentNode.classList.contains('view-more-link')) {
            var children =
              e.target.parentNode.parentNode.querySelectorAll('li');
            for (var i = 0; i < children.length; i++) {
              if (!isVisible(children[i])) {
                slideDown(children[i], 150);
              }
            }
            e.target.parentNode.remove();
          }
        });
      }
    }

    // Set title attributes for tooltips
    var aTags = document.querySelectorAll('.filter-menu li a');
    for (var i = 0; i < aTags.length; i++) {
      var text = aTags[i].textContent.trim();
      if (aTags[i].closest('li').classList.contains('selected')) {
        aTags[i].setAttribute('title', 'Clear Filter: ' + text);
      } else {
        aTags[i].setAttribute('title', 'Add Filter: ' + text);
      }
    }

    // Handle nested filters - if sort by is enabled we need to return a different array index from splitUrl
    if (document.querySelectorAll('.pt-display-nested').length > 0) {
      var splitPath = function (url) {
        var splitUrl = url.split('?')[0].split('#')[0].split('/');
        return splitUrl;
      };
      var getCollection = function (url) {
        var splitUrl = splitPath(url);
        return sortByEnabled() ? splitUrl[4] : splitUrl[2];
      };
      var getTags = function (url) {
        var splitUrl = splitPath(url);
        return sortByEnabled()
          ? (splitUrl[5] || '').split('+')
          : (splitUrl[3] || '').split('+');
      };
      var getCommonCollection = function (url_top, url_nested) {
        var collection_top = getCollection(url_top);
        var collection_nested = getCollection(url_nested);
        if (collection_top !== collection_nested) {
          return 'all';
        }
        return collection_top;
      };
      var getCommonTags = function (url_top, url_nested) {
        var tags_top = getTags(url_top);
        var tags_nested = getTags(url_nested);
        return tags_top.filter(function (n) {
          return tags_nested.indexOf(n) > -1;
        });
      };
      var getCommonUrl = function (url_top, url_nested) {
        var val =
          powerToolsSettings.ptRoutesCollectionURL +
          '/' +
          getCommonCollection(url_top, url_nested) +
          '/' +
          getCommonTags(url_top, url_nested).join('+');
        var lastChar = val.slice(-1);
        if (lastChar == '/') {
          val = val.slice(0, -1);
        }
        return val;
      };
      var clearNestedParent = function () {
        var nestedGroups = document.querySelectorAll('.pt-display-nested');
        for (var i = 0; i < nestedGroups.length; i++) {
          var nestedParent = nestedGroups[i].previousElementSibling;
          var clearNested = nestedGroups[i].querySelector('a.filter-clear');
          if (!clearNested) return;
          clearNested = clearNested.getAttribute('href');
          var clearLink = nestedParent.querySelector('a.filter-clear');
          if (!clearLink) return;
          clearLink.href = getCommonUrl(
            clearLink.getAttribute('href'),
            clearNested
          );
        }
      };
      clearNestedParent();
    }

    // Ajax setup
    if (ajaxEnabled() && window.location.pathname.includes('/collections/')) {
      var selector = powerToolsSettings.ptAjaxSelector;
      if (applyEnabled()) {
        var elements = `${selector} .pt-apply-group, ${selector} .pagination a`;
      } else {
        var elements = `${selector} .filter-group li a, ${selector} .filter-group .filter-clear, ${selector} .pagination a`;
      }

      var pjax = new Pjax({
        elements: elements,
        selectors: ['title:not(svg title)', selector, '.pt-sort-by-block'],
        scrollTo:
          document.querySelectorAll('.pt-ajax-scroll-to-top').length > 0
            ? 0
            : false,
        timeout: 10000,
      });
    }

    // Drawer setup
    if (drawerEnabled()) {
      function ptFilterDrawerEnable() {
        var body = document.querySelector('body');
        var drawer = document.querySelector('.pt-filter-drawer');
        var filterMenuContainer = document.querySelector(
          '.pt-filter-menu-container'
        );
        var drawerBtn = document.querySelector('.pt-filter-drawer-btn');
        if (drawerBtn) drawerBtn.style.display = 'block';

        if (!!document.querySelector('.pt-drawer-container')) {
          document.querySelector('.pt-drawer-container').appendChild(drawer);
        } else {
          var newDrawerContainer = document.createElement('div');
          newDrawerContainer.classList = filterMenuContainer.classList;
          newDrawerContainer.classList.add('pt-drawer-container');
          newDrawerContainer.appendChild(drawer);
          body.appendChild(newDrawerContainer);
        }

        if (!!!document.querySelector('.pt-overlay')) {
          var overlay = document.createElement('div');
          overlay.classList.add('pt-overlay');
          body.appendChild(overlay);
        }
      }

      function ptFilterDrawerDisable() {
        var body = document.querySelector('body');
        var filterMenuContainer = document.querySelector(
          '.pt-filter-menu-container:not(.pt-drawer-container)'
        );
        var drawer = document.querySelector('.pt-filter-drawer');
        var overlay = document.querySelector('.pt-overlay');
        var drawerBtn = document.querySelector('.pt-filter-drawer-btn');
        if (drawerBtn) drawerBtn.style.display = 'none';
        filterMenuContainer.appendChild(drawer);
        if (!!document.querySelector('.pt-drawer-container'))
          body.removeChild(document.querySelector('.pt-drawer-container'));
        if (!!document.querySelector('.pt-overlay')) body.removeChild(overlay);
      }

      if (drawerEnableMobileOnly()) {
        filterMenuContainers.forEach((container) => {
          container.classList.add('pt-filter-drawer-mobile-only');
        });
        function drawerModeToggle(mq) {
          mq.matches ? ptFilterDrawerEnable() : ptFilterDrawerDisable();
        }
        onLoadMq.addEventListener('change', drawerModeToggle);
        drawerModeToggle(onLoadMq);
      } else {
        ptFilterDrawerEnable();
      }
    }

    // make the filter menu visible after any layout changes have run
    if (document.getElementById('pt-style-tag')) {
      document.getElementById('pt-style-tag').remove();
    }

    // custom event for ptOnLoad
    document.dispatchEvent(new CustomEvent('ptOnLoad'));
  }
  // end ptOnLoad

  // Make ptOnLoad globally available, for working with ajax themes
  window.ptOnLoad = ptOnLoad;

  // Delegate event listeners
  document.addEventListener('click', function(e) {
    e.stopPropagation();
    var filterMenus = document.querySelectorAll('.filter-menu');

    // Default mobile button
    if (e.target.id === 'pt-nav-toggle') {
      var navToggle = e.target;
      if (e.handled !== true) {
        if (navToggle.classList.contains('active')) {
          e.target.closest('.filter-menu').classList.remove('pt-expand');
          var dropdowns = document.querySelectorAll('.pt-display-dropdown .scroll-content');
          for (var i = 0; i < dropdowns.length; i++) {
            dropdowns[i].removeAttribute('style');
          }
          navToggle.setAttribute('aria-expanded', 'false');
          navToggle.setAttribute('aria-label', 'Show Filters');
        } else {
          e.target.closest('.filter-menu').classList.add('pt-expand');
          navToggle.setAttribute('aria-expanded', 'true');
          navToggle.setAttribute('aria-label', 'Hide Filters');
        }
        navToggle.classList.toggle('active');
        e.preventDefault();
        e.handled = true;
      }
    }

    // Accordions
    if (!e.target.classList.contains('filter-clear') && e.target.parentElement.classList.contains('pt-accordion-group')) {
      e.target.closest('.pt-accordion-group').classList.toggle('pt-group-expanded');

      if (e.target.closest('.pt-accordion-group').classList.contains('pt-group-expanded')) {
        e.target.setAttribute('aria-expanded', 'true');
      } else {
        e.target.setAttribute('aria-expanded', 'false');
      }
      e.preventDefault();
    }

    // Dropdowns
    if (e.target.classList.contains('menu-trigger')) {
      var menuTrigger = e.target;
      var menuTriggerHeight = getComputedStyle(menuTrigger, null).height.replace('px', '');
      var menuTriggerWidth = getComputedStyle(menuTrigger, null).width.replace('px', '');
      var scrollContent = e.target.nextSibling;
      scrollContent.style.top = (parseInt(menuTrigger.offsetTop) + parseInt(menuTriggerHeight) - 1) + 'px';
      scrollContent.style.left = menuTrigger.offsetLeft + 'px';
      scrollContent.style.width = parseInt(menuTriggerWidth) + 'px';

      function dropdownA11y(scrollContent) {
        if (scrollContent.classList.contains('dropdown-open')) {
          menuTrigger.setAttribute('aria-label', menuTrigger.closest('.filter-group').querySelector('h4').innerText.trim() + ' dropdown selection expanded');
        } else {
          menuTrigger.setAttribute('aria-label', menuTrigger.closest('.filter-group').querySelector('h4').innerText.trim() + ' dropdown selection collapsed');
        }
      }

      // Open the dropdown that was clicked
      slideToggle(scrollContent, 200, function() {
        scrollContent.classList.toggle('dropdown-open');
        dropdownA11y(scrollContent);
      });
    }

    // Vertical Drawer
    if (e.target.id === 'pt-filter-drawer-btn') {
      var drawer = document.querySelectorAll('.pt-filter-drawer')
      for (var i = 0; i < drawer.length; i++) {
        drawer[i].classList.add('pt-filter-drawer-open')
      }
      document.querySelector('body').classList.add('pt-no-scroll')
    }

    // Close drawer
    if (e.target.classList.contains('pt-overlay') || e.target.classList.contains('pt-filter-drawer-close-btn')) {
      var drawers = document.querySelectorAll('.pt-filter-drawer')
      for (var i = 0; i < drawers.length; i++) {
        drawers[i].classList.remove('pt-filter-drawer-open')
      }
      document.querySelector('body').classList.remove('pt-no-scroll')
    }

    // Apply button
    if (applyEnabled()) {
      if (e.target.classList.contains('pt-filter-link') || e.target.classList.contains('check-icon') || e.target.classList.contains('filter-clear')) {
        e.preventDefault()
        var currentUrl;

        if (e.target.classList.contains('check-icon')) {
          currentUrl = e.target.parentNode.getAttribute('href')
        } else {
          currentUrl = e.target.getAttribute('href')
        }

        // Fade filters out and disable them while new filters load
        filterMenus.forEach(fm => {
          fm.classList.add('pt-ajax-loading');
        })

        // Load new filters
        var targetUrl = currentUrl;
        var request = new XMLHttpRequest();
        request.responseType = 'document';

        request.open('GET', targetUrl, true);
        request.onload = function() {
          if (this.status >= 200 && this.status < 400) {
            // Success!
            var res = this.response;
            var newFilterMenu = res.querySelectorAll('.filter-menu')[0];

            // Update the filters
            filterMenus.forEach(oldFilterMenu => {
              var parent = oldFilterMenu.parentNode;
              parent.removeChild(oldFilterMenu);
              parent.appendChild(newFilterMenu.cloneNode(true));
            });

            // Set href and enable the apply button
            var applyGroups = document.querySelectorAll('.pt-apply-group');
            applyGroups.forEach(applyGroup => {
              applyGroup.setAttribute('href', currentUrl);
              applyGroup.querySelector('.pt-apply').classList.remove('pt-apply-disabled');
            });

            // Apply dropdown class on index page
            if (document.querySelector('.pt-filter-menu-container').classList.contains('pt-index-force-dropdown')) {
              document.querySelectorAll('.pt-filter-menu-container .filter-group:not(.refine-header):not(.filter-group-pt-apply-group)').forEach((element) => {
                element.classList.add('pt-display-dropdown');
                if (sortByEnabled()) {
                  document.querySelectorAll('.filter-group-sort-orders').forEach(group => {
                    group.classList.add('pt-display-dropdown');
                  })
                }
              });
            }

            ptOnLoad();

            // If mobile accordion is enabled, open it after matching filters loaded
            var maxWidth = window.powerToolsSettings.ptMobileMaxWidth;
            var mediaQuery = `(max-width: ${maxWidth})`;
            if (!!document.querySelector('.show-mobile-menu-btn') && window.matchMedia(mediaQuery).matches) {
              document.querySelectorAll('#pt-nav-toggle').forEach(btn => {
                btn.click();
              })
            }
          } else {
            console.log('We reached our target server, but it returned an error');
          }
        };

        request.onerror = function() {
          console.log('There was a connection error of some sort');
        };

        request.send();
      }
    }
    // End Apply button
  });
  // End delegate event listeners

  // Ajax event listeners
  if (ajaxEnabled() && window.location.pathname.includes('/collections/')) {
    var body = document.querySelector('body');
    document.addEventListener('pjax:send', function() {
      body.classList.add("pt-ajax-loading");
    });
    document.addEventListener('pjax:complete', function() {
      body.classList.remove("pt-ajax-loading");
      ptOnLoad();
      // Close drawer on load
      if (drawerEnabled()) {
        document.querySelectorAll('.pt-filter-drawer').forEach(drawer => {
          drawer.classList.remove('pt-filter-drawer-open');
        });
        document.querySelector('body').classList.remove('pt-no-scroll');
      }

      powerToolsSettings.ptAjaxScript();
    });
  }

  ptOnLoad();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelectorAll('.pt-filter-menu-container').length > 0) {
      PowerToolsFilterMenu();
    }
  });
} else {
  if (document.querySelectorAll('.pt-filter-menu-container').length > 0) {
    PowerToolsFilterMenu();
  }
}
