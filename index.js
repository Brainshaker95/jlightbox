import $, { generateHash, noop } from 'jlight';

const translate = (options, key) => {
  let language = 'en';

  const translations = {
    ...options.translations,
    en: {
      close: 'Close',
      next: 'Next Item',
      prev: 'Previous Item',
      toggleAutoplay: 'Toggle autoplay',
      toggleFullscreen: 'Toggle fullscreen',
      toggleGallery: 'Toggle gallery',
      ...(options.translations.en || {}),
    },
    de: {
      close: 'Schließen',
      next: 'Nächstes Element',
      prev: 'Vorheriges Element',
      toggleAutoplay: 'Automatische Wiedergabe umschalten',
      toggleFullscreen: 'Vollbild umschalten',
      toggleGallery: 'Galerie umschalten',
      ...(options.translations.de || {}),
    },
  };

  if (options.language) {
    language = options.language;
  } else if (navigator.language) {
    language = navigator.language.slice(0, 2);
  }

  return translations[language] ? translations[language][key] : translations.en[key];
};

const getHash = ($item) => generateHash($item.attr('href') + $item.data('jlightbox-id'));

const getPlaceholders = (string) => (string.match(/{{(.*?)}}/g) || []).map((match) => match.slice(2, -2));

const replacePlaceholders = (theString, options, params) => {
  let string = theString;

  getPlaceholders(string).forEach((theKey) => {
    const key = theKey.trim();
    const replaceRegEx = new RegExp(`{{ ${key} }}`, 'g');

    string = string.replace(
      replaceRegEx,
      params && params[key] ? params[key] : translate(options, key),
    );
  });

  return string;
};

const closeFullscreen = () => {
  document.cancelFullScreen = document.cancelFullScreen || document.webkitCancelFullScreen
    || document.mozCancelFullScreen || noop;

  document.cancelFullScreen();
};

const toggleFullscreen = () => {
  if (document.webkitIsFullScreen || document.mozFullScreen || false) {
    closeFullscreen();
  } else {
    const element = document.documentElement;

    element.requestFullScreen = element.requestFullScreen || element.webkitRequestFullScreen
    || element.mozRequestFullScreen || noop;

    element.requestFullScreen();
  }
};

const template = (options) => {
  const {
    classPrefix,
    templates,
    indexText,
    galleryPosition,
    appendArrowsToStage,
  } = options;

  let {
    prevButton,
    nextButton,
    autoplayButton,
    galleryButton,
    fullscreenButton,
    closeButton,
    loading,
    progress,
  } = templates;

  if (prevButton !== null) {
    if (!prevButton) {
      const prev = translate(options, 'prev');

      prevButton = `
        <button
          type="button"
          class="${classPrefix}__arrow ${classPrefix}__arrow--prev"
          title="${prev}"
          aria-label="${prev}"
          data-jlightbox-prev-button
        ></button>
      `;
    } else {
      prevButton = replacePlaceholders(prevButton, options);
    }
  }

  if (nextButton !== null) {
    if (!nextButton) {
      const next = translate(options, 'next');

      nextButton = `
        <button
          type="button"
          class="${classPrefix}__arrow ${classPrefix}__arrow--next"
          title="${next}"
          aria-label="${next}"
          data-jlightbox-next-button
        ></button>
      `;
    } else {
      nextButton = replacePlaceholders(nextButton, options);
    }
  }

  if (autoplayButton !== null) {
    if (!autoplayButton) {
      const autoplay = translate(options, 'toggleAutoplay');

      autoplayButton = `
        <button
          type="button"
          class="${classPrefix}__control-button ${classPrefix}__control-button--autoplay"
          title="${autoplay}"
          aria-label="${autoplay}"
          data-jlightbox-autoplay-button
        ></button>
      `;
    } else {
      autoplayButton = replacePlaceholders(autoplayButton, options);
    }
  }

  if (galleryButton !== null) {
    if (!galleryButton) {
      const galleryText = translate(options, 'toggleGallery');

      galleryButton = `
        <button
          type="button"
          class="${classPrefix}__control-button ${classPrefix}__control-button--gallery"
          title="${galleryText}"
          aria-label="${galleryText}"
          data-jlightbox-gallery-button
        >
          <i class="line line--top">
            <i class="line-middle"></i>
          </i>
          <i class="line line--center">
            <i class="line-middle"></i>
          </i>
          <i class="line line--bottom">
            <i class="line-middle"></i>
          </i>
        </button>
      `;
    } else {
      galleryButton = replacePlaceholders(galleryButton, options);
    }
  }

  if (fullscreenButton !== null) {
    if (!fullscreenButton) {
      const fullscreen = translate(options, 'toggleFullscreen');

      fullscreenButton = `
        <button
          type="button"
          class="${classPrefix}__control-button ${classPrefix}__control-button--fullscreen"
          title="${fullscreen}"
          aria-label="${fullscreen}"
          data-jlightbox-fullscreen-button
        >
          <i class="corner corner--top-left"></i>
          <i class="corner corner--top-right"></i>
          <i class="corner corner--bottom-left"></i>
          <i class="corner corner--bottom-right"></i>
        </button>
      `;
    } else {
      fullscreenButton = replacePlaceholders(fullscreenButton, options);
    }
  }

  if (closeButton !== null) {
    if (!closeButton) {
      const close = translate(options, 'close');

      closeButton = `
        <button
          type="button"
          class="${classPrefix}__control-button ${classPrefix}__control-button--close"
          title="${close}"
          aria-label="${close}"
          data-jlightbox-close-button
        ></button>
      `;
    } else {
      closeButton = replacePlaceholders(closeButton, options);
    }
  }

  if (loading !== null && !loading) {
    loading = `<div class="${classPrefix}__loading" data-jlightbox-loading></div>`;
  }

  if (progress !== null && !progress) {
    progress = `<div class="${classPrefix}__progress" data-jlightbox-progress>
      <div class="${classPrefix}__progress-inner" data-jlightbox-progress-inner></div>
    </div>`;
  }

  const renderControl = autoplayButton || galleryButton || fullscreenButton || closeButton;

  return `
    <div class="${classPrefix}" aria-hidden="true">
      ${!appendArrowsToStage ? (prevButton || '') : ''}
      <div class="${classPrefix}__stage" data-jlightbox-stage>
        ${appendArrowsToStage ? (prevButton || '') : ''}
        ${appendArrowsToStage ? (nextButton || '') : ''}
      </div>
      ${!appendArrowsToStage ? (nextButton || '') : ''}
      ${indexText !== null ? `<div class="${classPrefix}__index" data-jlightbox-index></div>` : ''}
      ${renderControl ? `<div class="${classPrefix}__control" data-jlightbox-control>` : ''}
        ${autoplayButton || ''}
        ${galleryButton || ''}
        ${fullscreenButton || ''}
        ${closeButton || ''}
      ${renderControl ? '</div>' : ''}
      ${loading || ''}
      ${progress || ''}
      ${templates.gallery !== null ? `<div class="${classPrefix}__gallery ${classPrefix}__gallery--${galleryPosition}" data-jlightbox-gallery></div>` : ''}
      <div class="${classPrefix}__background" data-jlightbox-background></div>
      <div class="${classPrefix}__cache" data-jlightbox-cache></div>
    </div>
  `;
};

const getOriginalDimensions = ($originalItem) => {
  const { top, left } = $originalItem.offset();
  const originalWidth = $originalItem.width();
  const originalHeight = $originalItem.height();

  return {
    top: `${top + (originalHeight / 2)}px`,
    left: `${left + (originalWidth / 2)}px`,
    width: `${originalWidth}px`,
    height: `${originalHeight}px`,
  };
};

const getTargetDimensions = ($item, $stage, paddingX, paddingY) => {
  const stageWidth = $stage.width();
  const stageHeight = $stage.height();
  const contentWidth = $item.data('jlightbox-original-width');
  const contentHeight = $item.data('jlightbox-original-height');
  let targetWidth = contentWidth;
  let targetHeight = contentHeight;

  if (targetWidth > stageWidth - paddingX) {
    targetWidth = stageWidth - paddingX;
    targetHeight = contentHeight * (targetWidth / contentWidth);
  }

  if (targetHeight > stageHeight - paddingY) {
    targetHeight = stageHeight - paddingY;
    targetWidth = contentWidth * (targetHeight / contentHeight);
  }

  return {
    top: '50%',
    left: '50%',
    width: `${targetWidth}px`,
    height: `${targetHeight}px`,
  };
};

const handleResize = ($stage, options) => {
  const $realContent = $stage.find(`.${options.classPrefix}__item--real`);
  const $clonedContent = $stage.find(`.${options.classPrefix}__item--cloned`);
  const $gallery = $stage.closest(`.${options.classPrefix}`).find('[data-jlightbox-gallery]');
  const originalWidth = $realContent.data('jlightbox-original-width');
  const originalHeight = $realContent.data('jlightbox-original-height');
  const stageWidth = $stage.width();
  const stageHeight = $stage.height();
  const paddingX = 2 * options.stagePaddingX;
  const paddingY = 2 * options.stagePaddingY;
  const currentWidth = $realContent.width();
  const currentHeight = $realContent.height();
  const galleryIsHorizontal = options.galleryPosition === 'top'
  || options.galleryPosition === 'bottom';
  let width;
  let height;

  if (currentWidth > stageWidth - paddingX || currentWidth < originalWidth) {
    width = `calc(100% - ${paddingX}px)`;
    height = 'auto';
  }

  if (!width && currentWidth >= originalWidth) {
    width = `${originalWidth}px`;
  }

  if (currentHeight > stageHeight - paddingY || currentHeight < originalHeight) {
    height = `calc(100vh - ${paddingY + (galleryIsHorizontal ? $gallery.height() : 0)}px)`;
    width = 'auto';
  }

  if (!height && currentHeight >= originalHeight) {
    height = `${originalHeight}px`;
  }

  $realContent.css({
    width,
    height,
  });

  const realWidth = $realContent.width();

  if (realWidth > stageWidth - paddingX) {
    $realContent.css({
      width: `${stageWidth - paddingX}px`,
      height: 'auto',
    });
  }

  $clonedContent.css({
    width: `${realWidth}px`,
    height: `${$realContent.height()}px`,
  });
};

const getContentFromItem = ($item, $cache, index, { classPrefix, videoTypes }) => {
  let $realContent = $cache.find(`[data-jlightbox-cached-id="${index}"]`);
  let $clonedContent = $cache.find(`[data-jlightbox-cloned-cached-id="${index}"]`);
  let isCached = false;
  const href = $item.attr('href');
  const isVideo = videoTypes.some((videoType) => href.endsWith(videoType));

  if (!$realContent.length) {
    if (isVideo) {
      $realContent = $(`<video class="${classPrefix}__item ${classPrefix}__item--video ${classPrefix}__item--real" controls>
        <source src="${href}"></source>
      </video>`);
    } else {
      $realContent = $(`<img src="${href}" class="${classPrefix}__item ${classPrefix}__item--image ${classPrefix}__item--real">`);
    }
  } else {
    isCached = true;
  }

  if (!$clonedContent.length) {
    $clonedContent = $item
      .find(':first-child')
      .clone()
      .addClass(`${classPrefix}__item ${classPrefix}__item--cloned`);
  }

  return {
    $realContent,
    $clonedContent,
    isVideo,
    isCached,
  };
};

const doOpenAnimation = ($originalItem, $stage, options) => {
  const {
    classPrefix,
    openAnimationDuration,
    openAnimationType,
    stagePaddingX,
    stagePaddingY,
    zIndex,
  } = options;

  const {
    $realContent,
    $clonedContent,
    isVideo,
    isCached,
  } = getContentFromItem(
    $originalItem,
    $stage.closest(`.${classPrefix}`).find('[data-jlightbox-cache]'),
    $originalItem.data('jlightbox-id'),
    options,
  );

  const originalDimensions = getOriginalDimensions($originalItem);
  const $loadingIndicator = $stage.closest(`.${classPrefix}`).find('[data-jlightbox-loading]');
  const $itemWrapper = $(`<div class="${classPrefix}__item-wrapper">`);

  $itemWrapper
    .append($clonedContent)
    .append($realContent);

  $originalItem.css('z-index', zIndex + 1);
  $loadingIndicator.fadeIn(200);
  window.location.hash = getHash($originalItem);

  $stage
    .find(`.${classPrefix}__item-wrapper`)
    .remove();

  $stage.append($itemWrapper);
  $realContent.attr('draggable', false);
  $clonedContent.css({ ...originalDimensions });

  const onContentLoad = () => {
    if (!$stage.closest(`.${classPrefix}--is-open`).length
      && !$stage.closest(`.${classPrefix}--is-opening`).length) {
      return;
    }

    $realContent.data('jlightbox-original-width', $realContent.width());
    $realContent.data('jlightbox-original-height', $realContent.height());
    $originalItem.css('z-index', null);
    $loadingIndicator.fadeOut(200);

    const targetDimensions = getTargetDimensions(
      $realContent,
      $stage,
      2 * stagePaddingX,
      2 * stagePaddingY,
    );

    $realContent
      .css({
        opacity: 0,
        ...originalDimensions,
      })
      .delay(50)
      .then(() => {
        if (options.hideOriginalWhenOpened) {
          $originalItem.css('opacity', 0);
        }

        $realContent.stop().animate({
          opacity: 1,
          ...targetDimensions,
        }, openAnimationDuration, noop, openAnimationType);
      });

    setTimeout(() => {
      $clonedContent
        .stop()
        .animate({
          ...targetDimensions,
        },
        openAnimationDuration,
        () => {
          $clonedContent.hide();
        },
        openAnimationType);
    }, 50);
  };

  if (isCached) {
    onContentLoad();

    return;
  }

  if (isVideo) {
    $realContent.on('loadeddata', onContentLoad);
  } else {
    $realContent.on('load', onContentLoad);
  }
};

const doCloseAnimation = ($originalItem, $stage, options) => {
  const {
    classPrefix,
    closeAnimationDuration,
    closeAnimationType,
  } = options;

  const originalDimensions = getOriginalDimensions($originalItem);
  const $realContent = $stage.find(`.${classPrefix}__item--real`);
  const $clonedContent = $stage.find(`.${classPrefix}__item--cloned`);
  const $cache = $stage.closest(`.${classPrefix}`).find('[data-jlightbox-cache]');
  const index = $originalItem.data('jlightbox-id');

  $realContent.stop().animate({
    opacity: 0,
    ...originalDimensions,
  }, closeAnimationDuration, () => {
    if (options.hideOriginalWhenOpened) {
      $originalItem.css('opacity', 1);
    }

    if (!$cache.find(`[data-jlightbox-cached-id="${index}"]`).length) {
      $originalItem.trigger('focus');
      $realContent.attr('data-jlightbox-cached-id', index);
      $clonedContent.attr('data-jlightbox-cloned-cached-id', index);

      $cache
        .append($realContent)
        .append($clonedContent);

      $realContent.css({
        width: `${$realContent.data('jlightbox-original-width')}px`,
        height: `${$realContent.data('jlightbox-original-height')}px`,
      });
    }
  }, closeAnimationType);

  $clonedContent
    .show()
    .stop()
    .animate({
      ...originalDimensions,
    }, closeAnimationDuration, noop, closeAnimationType);
};

export default (opts = {}) => {
  const options = {
    selector: '[data-jlightbox]',
    classPrefix: 'jlightbox',
    autoplayDuration: 5000,
    openAnimationDuration: 500,
    closeAnimationDuration: 500,
    slideAnimationDuration: 500,
    openAnimationType: 'ease-out',
    closeAnimationType: 'ease-in',
    swipeThreshold: 50,
    hideOriginalWhenOpened: true,
    galleryPosition: 'bottom',
    galleryItemFadeInDuration: 100,
    showGalleryByDefault: true,
    appendArrowsToStage: true,
    stagePaddingX: 16,
    stagePaddingY: 16,
    onBeforeOpen: null,
    onAfterOpen: null,
    onBeforeClose: null,
    onAfterClose: null,
    onBeforeSlide: null,
    onAfterSlide: null,
    onPrev: null,
    onNext: null,
    language: '',
    translations: {},
    videoTypes: ['mp4', 'mpeg', 'webm'],
    indexText: '{{ current }} / {{ total }}',
    zIndex: 20,
    ...opts,
    additionalClasses: {
      general: '',
      prevButton: '',
      nextButton: '',
      autoplayButton: '',
      galleryButton: '',
      fullscreenButton: '',
      closeButton: '',
      stage: '',
      gallery: '',
      index: '',
      loading: '',
      progress: '',
      background: '',
      ...opts.additionalClasses,
    },
    templates: {
      general: '',
      prevButton: '',
      nextButton: '',
      autoplayButton: '',
      galleryButton: '',
      fullscreenButton: '',
      closeButton: '',
      loading: '',
      gallery: '',
      progress: '',
      ...opts.templates,
    },
    keyboardControls: {
      close: ['Escape', 'ArrowUp', 'ArrowDown', 'KeyW', 'KeyS'],
      prev: ['ArrowLeft', 'KeyA'],
      next: ['ArrowRight', 'KeyD'],
      fullscreen: ['KeyF'],
      autoplay: ['KeyP'],
      gallery: ['KeyG'],
      ...opts.keyboardControls,
    },
  };

  const {
    classPrefix,
    additionalClasses,
    openAnimationDuration,
    closeAnimationDuration,
    slideAnimationDuration,
    swipeThreshold,
    keyboardControls,
  } = options;

  let resizeTimeout;
  const $window = $(window);
  const $items = $(options.selector);
  const $jlightbox = $(options.templates.general
    ? replacePlaceholders(options.templates.general, options)
    : template(options));

  $('body').append($jlightbox);

  const $body = $('body');
  const $stage = $jlightbox.find('[data-jlightbox-stage]');
  const $prevButton = $jlightbox.find('[data-jlightbox-prev-button]');
  const $nextButton = $jlightbox.find('[data-jlightbox-next-button]');
  const $control = $jlightbox.find('[data-jlightbox-control]');
  const $autoplayButton = $jlightbox.find('[data-jlightbox-autoplay-button]');
  const $galleryButton = $jlightbox.find('[data-jlightbox-gallery-button]');
  const $fullscreenButton = $jlightbox.find('[data-jlightbox-fullscreen-button]');
  const $closeButton = $jlightbox.find('[data-jlightbox-close-button]');
  const $index = $jlightbox.find('[data-jlightbox-index]');
  const $loadingIndicator = $jlightbox.find('[data-jlightbox-loading]');
  const $gallery = $jlightbox.find('[data-jlightbox-gallery]');
  const $progress = $jlightbox.find('[data-jlightbox-progress]');
  const $progressInner = $jlightbox.find('[data-jlightbox-progress-inner]');
  const $background = $jlightbox.find('[data-jlightbox-background]');
  const $cache = $jlightbox.find('[data-jlightbox-cache]');
  const totalItemCount = $items.length;

  const getCurrentIndex = () => $jlightbox.data('jlightbox-current-index');

  const updateIndex = (index) => {
    if (options.indexText === null) {
      return;
    }

    $index.text(replacePlaceholders(options.indexText, options, {
      current: index + 1,
      total: totalItemCount,
    }));
  };

  const stopAutoplay = () => {
    $progress.hide();
    $jlightbox.data('jlightbox-autoplay', false);
    $autoplayButton.removeClass(`${classPrefix}__control-button--autoplay-is-active`);

    $progressInner
      .stop()
      .data('jlightbox-busy', false);
  };

  const handleAutoplay = (callback) => {
    if (!$jlightbox.data('jlightbox-autoplay')
      || $progressInner.data('jlightbox-busy')
      || getCurrentIndex() === totalItemCount - 1) {
      stopAutoplay();

      return;
    }

    $progress.show();

    $progressInner
      .data('jlightbox-busy', true)
      .width(0)
      .stop()
      .animate({ width: `${$progress.width()}px` }, options.autoplayDuration, () => {
        $progressInner.data('jlightbox-busy', false);

        if ($jlightbox.data('jlightbox-autoplay')) {
          callback();
        } else {
          stopAutoplay();
        }
      }, 'linear');
  };

  const scrollToActiveGalleryItem = ($galleryItems, $activeItem) => {
    const loadedCount = $galleryItems
      .filter(($galleryItem) => $galleryItem.data('jlightbox-loaded')).length;

    if (loadedCount !== $galleryItems.length) {
      return;
    }

    $gallery.scrollTo($activeItem, options.slideAnimationDuration);
  };

  const setActiveGalleryItem = (index) => {
    const $galleryItems = $gallery.find(`.${classPrefix}__item`);

    if (!$galleryItems.length) {
      return;
    }

    const $activeItem = $galleryItems.filter(`[data-jlightbox-gallery-id="${index}"]`);

    scrollToActiveGalleryItem($galleryItems, $activeItem);

    if ($activeItem.hasClass(`${classPrefix}__item--is-active`)) {
      return;
    }

    $galleryItems.removeClass(`${classPrefix}__item--is-active`);
    $activeItem.addClass(`${classPrefix}__item--is-active`);
  };

  const goTo = (indexToGoTo) => {
    if ($stage.data('jlightbox-busy')) {
      return;
    }

    const index = getCurrentIndex();
    const $itemToGoTo = $items.filter(`[data-jlightbox-id="${indexToGoTo}"]`);
    const hasItemToGoTo = $itemToGoTo.length;

    if (options.hideOriginalWhenOpened) {
      const $previousItem = $items.filter(`[data-jlightbox-id="${index}"]`);

      if ($previousItem.length) {
        $previousItem.css('opacity', 1);
      }

      if (hasItemToGoTo) {
        $itemToGoTo.css('opacity', 0);
      }
    }

    if (!hasItemToGoTo) {
      return;
    }

    const {
      $realContent,
      $clonedContent,
      isVideo,
      isCached,
    } = getContentFromItem($itemToGoTo, $cache, indexToGoTo, options);

    const insertionMethod = indexToGoTo < index ? 'prepend' : 'append';
    const $currentItemWrapper = $stage.find(`.${classPrefix}__item-wrapper`);
    const $itemWrapper = $(`<div class="${classPrefix}__item-wrapper">`);

    updateIndex(indexToGoTo);
    setActiveGalleryItem(indexToGoTo);
    $stage.data('jlightbox-busy', true);
    $realContent.attr('draggable', false);

    $jlightbox
      .trigger('before-slide')
      .data('jlightbox-current-index', indexToGoTo);

    $itemWrapper
      .append($clonedContent)
      .append($realContent);

    $stage[insertionMethod]($itemWrapper);
    $loadingIndicator.fadeIn(200);
    window.location.hash = getHash($itemToGoTo);

    const $itemToCache = $currentItemWrapper.find(`.${classPrefix}__item--real`);
    const $clonedItemToCache = $currentItemWrapper.find(`.${classPrefix}__item--cloned`);

    if (insertionMethod === 'append') {
      $currentItemWrapper
        .css({
          right: '0px',
          left: 'auto',
        })
        .delay(10)
        .then(() => {
          $currentItemWrapper.animate({
            right: '100vw',
          }, slideAnimationDuration, () => {
            $itemToCache.attr('data-jlightbox-cached-id', index);
            $clonedItemToCache.attr('data-jlightbox-cloned-cached-id', index);

            $cache
              .append($itemToCache)
              .append($clonedItemToCache);

            $currentItemWrapper.remove();
          });
        });

      $itemWrapper.css('left', '100vw');
    } else {
      $currentItemWrapper
        .css({
          left: '0px',
          right: 'auto',
        })
        .delay(10)
        .then(() => {
          $currentItemWrapper.animate({
            left: '100vw',
          }, slideAnimationDuration, () => {
            $itemToCache.attr('data-jlightbox-cached-id', index);
            $clonedItemToCache.attr('data-jlightbox-cloned-cached-id', index);

            $cache
              .append($itemToCache)
              .append($clonedItemToCache);

            $currentItemWrapper.remove();
          });
        });

      $itemWrapper.css('right', '100vw');
    }

    const onContentLoad = () => {
      $realContent.data('jlightbox-original-width', $realContent.width());
      $realContent.data('jlightbox-original-height', $realContent.height());
      $loadingIndicator.fadeOut(200);

      const targetDimensions = getTargetDimensions(
        $realContent,
        $stage,
        2 * options.stagePaddingX,
        2 * options.stagePaddingY,
      );

      handleAutoplay(() => goTo(indexToGoTo + 1));

      $realContent.css({
        opacity: 1,
        ...targetDimensions,
      });

      $clonedContent.css({ ...targetDimensions });

      if (insertionMethod === 'append') {
        $itemWrapper.animate({
          left: '0px',
        }, slideAnimationDuration, () => {
          $stage.data('jlightbox-busy', false);
          $jlightbox.trigger('after-slide');
        });
      } else {
        $itemWrapper.animate({
          right: '0px',
        }, slideAnimationDuration, () => {
          $stage.data('jlightbox-busy', false);
          $jlightbox.trigger('after-slide');
        });
      }
    };

    if (isCached) {
      onContentLoad();

      return;
    }

    if (isVideo) {
      $realContent.on('loadeddata', onContentLoad);
    } else {
      $realContent.on('load', onContentLoad);
    }
  };

  const goToPrev = () => {
    const index = getCurrentIndex();
    const prevIndex = index - 1;

    $jlightbox.trigger('prev');

    if (prevIndex >= 0) {
      goTo(prevIndex);
    }
  };

  const goToNext = () => {
    const index = getCurrentIndex();
    const nextIndex = index + 1;

    $jlightbox.trigger('next');

    if (nextIndex <= $items.length) {
      goTo(nextIndex);
    }
  };

  const goToFirst = () => goTo(0);

  const goToLast = () => goTo($items.length - 1);

  const toggleAutoplay = () => {
    if (!$jlightbox.data('jlightbox-autoplay')) {
      $jlightbox.data('jlightbox-autoplay', true);
      $autoplayButton.addClass(`${classPrefix}__control-button--autoplay-is-active`);
      handleAutoplay(goToNext);
    } else {
      stopAutoplay();
    }
  };

  const adjustStageSize = (galleryClosed) => {
    const { galleryPosition } = options;
    let stageWidth;
    let stageHeight;

    if (galleryClosed) {
      stageWidth = '100vw';
      stageHeight = '100vh';
    } else {
      const galleryWidth = $gallery.width();
      const galleryHeight = $gallery.height();

      stageWidth = `calc(100vw - ${galleryWidth}px)`;
      stageHeight = `calc(100vh - ${galleryHeight}px)`;
    }

    if (galleryPosition === 'left' || galleryPosition === 'right') {
      $stage.css('width', stageWidth);
    } else {
      $stage.css('height', stageHeight);
    }

    if (galleryPosition === 'top') {
      $stage.css('bottom', 0);
    } else if (galleryPosition === 'left') {
      $stage.css('right', 0);
    }

    $window.trigger('resize');
  };

  const onGalleryItemLoaded = ({ $currentTarget }) => {
    $currentTarget
      .fadeIn(options.galleryItemFadeInDuration)
      .data('jlightbox-loaded', true);

    setActiveGalleryItem(getCurrentIndex());
  };

  const addItemsToGallery = () => {
    $items.forEach(($item) => {
      const itemIndex = $item.data('jlightbox-id');

      if ($gallery.find(`[data-jlightbox-gallery-id="${itemIndex}"]`).length) {
        return;
      }

      const {
        $realContent,
        $clonedContent,
        isVideo,
        isCached,
      } = getContentFromItem(
        $item,
        $cache,
        itemIndex,
        options,
      );

      const $clonedItem = $realContent
        .clone()
        .attr('draggable', false)
        .attr('tabindex', 0);

      $clonedItem.attr('data-jlightbox-gallery-id', itemIndex);
      $gallery.append($clonedItem);

      if (!isCached) {
        setTimeout(() => {
          $cache
            .append($realContent.clone().attr('data-jlightbox-cached-id', itemIndex))
            .append($clonedContent.attr('data-jlightbox-cached-cached-id', itemIndex));
        }, 0);
      }

      if (isVideo) {
        $clonedItem.removeAttr('controls');
        $clonedItem.on('loadeddata', onGalleryItemLoaded);
      } else {
        $clonedItem.on('load', onGalleryItemLoaded);
      }

      const onGalleryItemClick = () => {
        if ($gallery.data('jlightbox-gallery-click-disabled')) {
          return;
        }

        if (getCurrentIndex() !== itemIndex) {
          goTo(itemIndex);
        }
      };

      $clonedItem
        .on('click', onGalleryItemClick)
        .on('keydown', ({ code }) => {
          if (code === 'Enter') {
            $gallery.data('jlightbox-gallery-click-disabled', false);
            onGalleryItemClick();
          }
        });
    });
  };

  const initializeGallery = () => {
    let startX;
    let scrollLeft;
    let isDragged;
    let currentMouseX;

    $gallery
      .on('mousedown', ({ pageX }) => {
        currentMouseX = pageX;
        startX = currentMouseX - $gallery.offset().left;
        scrollLeft = $gallery.scrollLeft();
        isDragged = true;
      })
      .on('mouseleave', () => {
        isDragged = false;
      })
      .on('mouseup', ({ pageX }) => {
        isDragged = false;

        $gallery.data(
          'jlightbox-gallery-click-disabled',
          Math.abs(pageX - currentMouseX) > 10,
        );
      })
      .on('mousemove', (event) => {
        if (!isDragged) {
          return;
        }

        event.preventDefault();
        $gallery.scrollLeft(scrollLeft - ((event.pageX - $gallery.offset().left) - startX));
      })
      .data('jlightbox-initialized', true);
  };

  const openGallery = () => {
    $gallery.fadeIn(openAnimationDuration, noop, 'flex');
    $galleryButton.addClass(`${classPrefix}__control-button--gallery-is-active`);
    $jlightbox.data('jlightbox-gallery', true);
    $jlightbox.data('jlightbox-gallery-hidden', false);

    setTimeout(() => {
      addItemsToGallery();
    }, options.openAnimationDuration + 200);

    setActiveGalleryItem(getCurrentIndex());
    adjustStageSize();

    if (!$gallery.data('jlightbox-initialized')) {
      initializeGallery();
    }
  };

  const toggleGallery = () => {
    if (!$jlightbox.data('jlightbox-gallery')) {
      openGallery();

      return;
    }

    $gallery.fadeOut(closeAnimationDuration, () => {
      adjustStageSize(true);
    });

    $galleryButton.removeClass(`${classPrefix}__control-button--gallery-is-active`);
    $jlightbox.data('jlightbox-gallery-hidden', true);
    $jlightbox.data('jlightbox-gallery', false);
  };

  const onSwipeEnd = (pageX, startX) => {
    if (!$stage.data('jlightbox-swipe-active')) {
      return;
    }

    const offset = pageX - startX;

    if (offset > swipeThreshold) {
      goToPrev();
    } else if (offset < -swipeThreshold) {
      goToNext();
    } else {
      $stage.data('jlightbox-swipe-active', false);

      return;
    }

    setTimeout(() => {
      $stage.data('jlightbox-swipe-active', false);
    }, 0);
  };

  const initSwipeControl = () => {
    let startX;

    $stage
      .on('mouseleave mouseup', ({ pageX }) => onSwipeEnd(pageX, startX))
      .on('mousedown', ({ pageX }) => {
        startX = pageX;

        $stage.data('jlightbox-swipe-active', true);
      });
  };

  const open = (index) => {
    $body.addClass(`${classPrefix}-open`);

    $jlightbox
      .trigger('before-open')
      .trigger('focus')
      .attr('aria-hidden', false)
      .data('jlightbox-current-index', index)
      .addClass(`${classPrefix}--is-opening`);

    updateIndex(index);

    if (options.showGalleryByDefault) {
      if (!$jlightbox.data('jlightbox-gallery-hidden')) {
        openGallery();
      }
    } else if ($jlightbox.data('jlightbox-gallery-hidden') === false) {
      openGallery();
    }

    doOpenAnimation(
      $items.filter(`[data-jlightbox-id="${index || '0'}"]`),
      $stage,
      options,
    );

    $index.fadeIn(openAnimationDuration);
    $prevButton.fadeIn(openAnimationDuration);
    $nextButton.fadeIn(openAnimationDuration);
    $control.fadeIn(openAnimationDuration, noop, 'flex');

    $background.fadeIn(openAnimationDuration, () => {
      $jlightbox
        .removeClass(`${classPrefix}--is-opening`)
        .addClass(`${classPrefix}--is-open`)
        .trigger('after-open');
    });
  };

  const close = (event) => {
    let canClose = true;

    if (event) {
      if (event.target === $closeButton.get(0)) {
        canClose = true;
      } else if (event.target !== $stage.get(0)) {
        canClose = false;
      }
    }

    if (!canClose
      || $jlightbox.hasClass(`${classPrefix}--is-opening`)
      || $jlightbox.hasClass(`${classPrefix}--is-closing`)
      || $stage.data('jlightbox-swipe-active')) {
      return;
    }

    const index = getCurrentIndex() || 0;
    const $video = $jlightbox.find('video');
    const scrollTop = $window.scrollTop();

    window.location.hash = '';

    $window.scrollTop(scrollTop);
    window.history.replaceState('', document.title, window.location.pathname + window.location.search);

    if ($video.length) {
      $video.get(0).pause();
    }

    closeFullscreen();
    stopAutoplay();

    $body.removeClass(`${classPrefix}-open`);

    $jlightbox
      .trigger('before-close')
      .trigger('blur')
      .attr('aria-hidden', true)
      .addClass(`${classPrefix}--is-closing`)
      .removeClass(`${classPrefix}--is-open`);

    if (index || index === 0) {
      doCloseAnimation(
        $items.filter(`[data-jlightbox-id="${index || '0'}"]`),
        $stage,
        options,
      );
    }

    $loadingIndicator.fadeOut(200);
    $index.fadeOut(closeAnimationDuration);
    $prevButton.fadeOut(closeAnimationDuration);
    $nextButton.fadeOut(closeAnimationDuration);

    const galleryOpen = $jlightbox.data('jlightbox-gallery');

    if (galleryOpen) {
      $gallery.fadeOut(closeAnimationDuration);
      $jlightbox.data('jlightbox-gallery', false);
    }

    $control.fadeOut(closeAnimationDuration, () => {
      if (galleryOpen) {
        $galleryButton.removeClass(`${classPrefix}__control-button--gallery-is-active`);
      }
    });

    $background.fadeOut(closeAnimationDuration, () => {
      $stage.find(`.${classPrefix}__item-wrapper`).remove();
      adjustStageSize(false);

      $jlightbox
        .removeClass(`${classPrefix}--is-closing`)
        .trigger('after-close');
    });
  };

  const onItemClick = (event) => {
    event.preventDefault();

    if ($jlightbox.hasClass(`${classPrefix}--is-open`)
      || $jlightbox.hasClass(`${classPrefix}--is-opening`)
      || $jlightbox.hasClass(`${classPrefix}--is-closing`)) {
      return;
    }

    open(event.$currentTarget.data('jlightbox-id'));
  };

  const onWindowHashchange = () => {
    if ($jlightbox.hasClass(`${classPrefix}--is-opening`)) {
      return;
    }

    $items.forEach(($item, index) => {
      if (window.location.hash === `#${getHash($item)}`) {
        if ($jlightbox.hasClass(`${classPrefix}--is-open`)) {
          setTimeout(() => goTo(index), 150);
        } else {
          setTimeout(() => open(index), 150);
        }
      } else if (window.location.hash === '' && !$jlightbox.hasClass(`${classPrefix}--is-closing`)) {
        setTimeout(close, 150);
      }
    });
  };

  const onWindowResize = () => {
    if (!$jlightbox.hasClass(`${classPrefix}--is-open`)) {
      return;
    }

    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }

    resizeTimeout = setTimeout(() => handleResize($stage, options), options.resizeTimeoutDelay);
  };

  const onWindowKeydown = ({ code }) => {
    if (!$jlightbox.hasClass(`${classPrefix}--is-open`)) {
      return;
    }

    if (keyboardControls.close.includes(code)) {
      if (options.templates.closeButton !== null) {
        close();
      }
    } else if (keyboardControls.prev.includes(code)) {
      if (options.templates.prevButton !== null) {
        goToPrev();
      }
    } else if (keyboardControls.next.includes(code)) {
      if (options.templates.nextButton !== null) {
        goToNext();
      }
    } else if (keyboardControls.autoplay.includes(code)) {
      if (options.templates.autoplayButton !== null) {
        toggleAutoplay();
      }
    } else if (keyboardControls.gallery.includes(code)) {
      if (options.templates.galleryButton !== null) {
        toggleGallery();
      }
    } else if (keyboardControls.fullscreen.includes(code)) {
      if (options.templates.fullscreenButton !== null) {
        toggleFullscreen();
      }
    }
  };

  const lightbox = {
    open,
    close,
    goTo,
    goToPrev,
    goToNext,
    goToFirst,
    goToLast,
    toggleAutoplay,
    toggleGallery,
    toggleFullscreen,
    getCurrentIndex,
    getElement: () => $jlightbox,
    getOptions: () => options,
    getTotalItemCount: () => totalItemCount,
    destroy: () => {
      $jlightbox.remove();

      $items
        .off('click', onItemClick)
        .removeAttr('data-jlightbox-id');

      $window
        .off('hashchange', onWindowHashchange)
        .off('resize', onWindowResize)
        .off('keydown', onWindowKeydown);
    },
  };

  $prevButton.when(additionalClasses.prevButton, 'addClass', additionalClasses.prevButton);
  $nextButton.when(additionalClasses.nextButton, 'addClass', additionalClasses.nextButton);
  $autoplayButton.when(additionalClasses.autoplayButton, 'addClass', additionalClasses.autoplayButton);
  $galleryButton.when(additionalClasses.galleryButton, 'addClass', additionalClasses.galleryButton);
  $fullscreenButton.when(additionalClasses.fullscreenButton, 'addClass', additionalClasses.fullscreenButton);
  $closeButton.when(additionalClasses.closeButton, 'addClass', additionalClasses.closeButton);
  $stage.when(additionalClasses.stage, 'addClass', additionalClasses.stage);
  $index.when(additionalClasses.index, 'addClass', additionalClasses.index);
  $loadingIndicator.when(additionalClasses.loading, 'addClass', additionalClasses.loading);
  $gallery.when(additionalClasses.gallery, 'addClass', additionalClasses.gallery);
  $progress.when(additionalClasses.progress, 'addClass', additionalClasses.progress);
  $background.when(additionalClasses.background, 'addClass', additionalClasses.background);

  let hashedItemOpened = false;

  $items.forEach(($item, index) => {
    $item.attr('data-jlightbox-id', index);

    if (window.location.hash === `#${getHash($item)}` && !hashedItemOpened) {
      hashedItemOpened = true;

      setTimeout(() => open(index), 150);
    }
  });

  $jlightbox
    .css('z-index', options.zIndex)
    .when(additionalClasses.general, 'addClass', additionalClasses.general)
    .when(options.onBeforeOpen !== null, 'on', 'before-open', () => options.onBeforeOpen(lightbox, getCurrentIndex()))
    .when(options.onAfterOpen !== null, 'on', 'after-open', () => options.onAfterOpen(lightbox, getCurrentIndex()))
    .when(options.onBeforeClose !== null, 'on', 'before-close', () => options.onBeforeClose(lightbox, getCurrentIndex()))
    .when(options.onAfterClose !== null, 'on', 'after-close', () => options.onAfterClose(lightbox, getCurrentIndex()))
    .when(options.onBeforeSlide !== null, 'on', 'before-slide', () => options.onBeforeSlide(lightbox, getCurrentIndex()))
    .when(options.onAfterSlide !== null, 'on', 'after-slide', () => options.onAfterSlide(lightbox, getCurrentIndex()))
    .when(options.onPrev !== null, 'on', 'prev', () => options.onPrev(lightbox, getCurrentIndex()))
    .when(options.onNext !== null, 'on', 'next', () => options.onNext(lightbox, getCurrentIndex()));

  $prevButton.on('click', goToPrev);
  $nextButton.on('click', goToNext);
  $autoplayButton.on('click', toggleAutoplay);
  $galleryButton.on('click', toggleGallery);
  $fullscreenButton.on('click', toggleFullscreen);
  $items.on('click', onItemClick);
  $closeButton.add($stage).on('click', close);

  initSwipeControl();

  $window
    .on('hashchange', onWindowHashchange)
    .on('resize', onWindowResize)
    .on('keydown', onWindowKeydown);

  return lightbox;
};
