/* eslint-disable no-bitwise */
import $, { noop } from 'jlight';

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
      ...(options.translations.en || {}),
    },
    de: {
      close: 'Schließen',
      next: 'Nächstes Element',
      prev: 'Vorheriges Element',
      toggleAutoplay: 'Automatische Wiedergabe umschalten',
      toggleFullscreen: 'Vollbild umschalten',
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

const getHash = (string) => Math.abs(string.split('').reduce((hash, b) => {
  const a = ((hash << 5) - hash) + b.charCodeAt(0);

  return a & a;
}, 0));

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
  } = options;

  let {
    prevButton,
    nextButton,
    autoplayButton,
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
          data-jlightbox-prev
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
          data-jlightbox-next
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
          data-jlightbox-autoplay
        ></button>
      `;
    } else {
      autoplayButton = replacePlaceholders(autoplayButton, options);
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
          data-jlightbox-fullscreen
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
          data-jlightbox-close
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

  const renderControl = autoplayButton || fullscreenButton || closeButton;

  return `
    <div class="${classPrefix}" aria-hidden="true">
      ${prevButton || ''}
      <div class="${classPrefix}__stage" data-jlightbox-stage></div>
      ${nextButton || ''}
      ${indexText !== null ? `<div class="${classPrefix}__index" data-jlightbox-index></div>` : ''}
      ${renderControl ? `<div class="${classPrefix}__control" data-jlightbox-control>` : ''}
        ${autoplayButton || ''}
        ${fullscreenButton || ''}
        ${closeButton || ''}
      ${renderControl ? '</div>' : ''}
      ${loading || ''}
      ${progress || ''}
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

const getTargetDimensions = ($item, paddingX, paddingY) => {
  const $window = $(window);
  const innerWidth = $window.innerWidth();
  const innerHeight = $window.innerHeight();
  const contentWidth = $item.data('original-width');
  const contentHeight = $item.data('original-height');
  let targetWidth = contentWidth;
  let targetHeight = contentHeight;

  if (targetWidth > innerWidth - paddingX) {
    targetWidth = innerWidth - paddingX;
    targetHeight = contentHeight * (targetWidth / contentWidth);
  }

  if (targetHeight > innerHeight - paddingY) {
    targetHeight = innerHeight - paddingY;
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
  const $window = $(window);
  const $realContent = $stage.find(`.${options.classPrefix}__item--real`);
  const $clonedContent = $stage.find(`.${options.classPrefix}__item--cloned`);
  const originalWidth = $realContent.data('original-width');
  const originalHeight = $realContent.data('original-height');
  const innerWidth = $window.innerWidth();
  const innerHeight = $window.innerHeight();
  const paddingX = 2 * options.stagePaddingX;
  const paddingY = 2 * options.stagePaddingY;
  const currentWidth = $realContent.width();
  const currentHeight = $realContent.height();
  let width;
  let height;

  if (currentWidth > innerWidth - paddingX || currentWidth < originalWidth) {
    width = `calc(100% - ${paddingX}px)`;
    height = 'auto';
  }

  if (!width && currentWidth >= originalWidth) {
    width = `${originalWidth}px`;
  }

  if (currentHeight > innerHeight - paddingY || currentHeight < originalHeight) {
    height = `calc(100% - ${paddingY}px)`;
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

  if (realWidth > innerWidth - paddingX) {
    $realContent.css({
      width: `${innerWidth - paddingX}px`,
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
  $loadingIndicator.stop().fadeIn(200);
  window.location.hash = getHash($originalItem.attr('href'));

  $stage
    .empty()
    .append($itemWrapper);

  $clonedContent.css({
    opacity: 1,
    ...originalDimensions,
  });

  const onContentLoad = () => {
    if (!$stage.closest(`.${classPrefix}--is-open`).length
      && !$stage.closest(`.${classPrefix}--is-opening`).length) {
      return;
    }

    $realContent.data('original-width', $realContent.width());
    $realContent.data('original-height', $realContent.height());
    $originalItem.css('z-index', null);
    $loadingIndicator.stop().fadeOut(200);

    const targetDimensions = getTargetDimensions(
      $realContent,
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
        $realContent.stop().animate({
          opacity: 1,
          ...targetDimensions,
        }, openAnimationDuration, noop, openAnimationType);
      });

    $clonedContent
      .delay(50)
      .then(() => {
        $clonedContent.stop().animate({
          opacity: 0,
          ...targetDimensions,
        }, openAnimationDuration, noop, openAnimationType);
      });
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
    if (!$cache.find(`[data-jlightbox-cached-id="${index}"]`).length) {
      $originalItem.trigger('focus');
      $realContent.attr('data-jlightbox-cached-id', index);
      $clonedContent.attr('data-jlightbox-cloned-cached-id', index);

      $cache
        .append($realContent)
        .append($clonedContent);

      $realContent.css({
        width: `${$realContent.data('original-width')}px`,
        height: `${$realContent.data('original-height')}px`,
      });
    }
  }, closeAnimationType);

  $clonedContent.stop().animate({
    opacity: 1,
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
    stagePaddingX: 16,
    stagePaddingY: 16,
    onBeforeShow: noop,
    onAfterShow: noop,
    onBeforeOpen: noop,
    onAfterOpen: noop,
    onBeforeClose: noop,
    onAfterClose: noop,
    onPrev: noop,
    onNext: noop,
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
      fullscreenButton: '',
      closeButton: '',
      stage: '',
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
      fullscreenButton: '',
      closeButton: '',
      loading: '',
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
    keyboardControls,
  } = options;

  let resizeTimeout;
  const $window = $(window);
  const $items = $(options.selector);
  const $jlightbox = $(options.templates.general
    ? replacePlaceholders(options.templates.general, options)
    : template(options));

  $('body').append($jlightbox);

  const $stage = $jlightbox.find('[data-jlightbox-stage]');
  const $prevButton = $jlightbox.find('[data-jlightbox-prev]');
  const $nextButton = $jlightbox.find('[data-jlightbox-next]');
  const $control = $jlightbox.find('[data-jlightbox-control]');
  const $autoplayButton = $jlightbox.find('[data-jlightbox-autoplay]');
  const $fullscreenButton = $jlightbox.find('[data-jlightbox-fullscreen]');
  const $closeButton = $jlightbox.find('[data-jlightbox-close]');
  const $index = $jlightbox.find('[data-jlightbox-index]');
  const $loadingIndicator = $jlightbox.find('[data-jlightbox-loading]');
  const $progress = $jlightbox.find('[data-jlightbox-progress]');
  const $progressInner = $jlightbox.find('[data-jlightbox-progress-inner]');
  const $background = $jlightbox.find('[data-jlightbox-background]');
  const $cache = $jlightbox.find('[data-jlightbox-cache]');
  const totalItemCount = $items.length;

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
    $progressInner.stop();
    $progressInner.data('busy', false);
    $jlightbox.data('autoplay', false);
    $autoplayButton.removeClass(`${classPrefix}__control-button--autoplay-is-active`);
  };

  const handleAutoplay = (callback) => {
    if (!$jlightbox.data('autoplay')
      || $progressInner.data('busy')
      || $jlightbox.data('current-index') === totalItemCount - 1) {
      stopAutoplay();

      return;
    }

    $progress.show();

    $progressInner
      .data('busy', true)
      .width(0)
      .stop()
      .animate({ width: `${$progress.width()}px` }, options.autoplayDuration, () => {
        $progressInner.data('busy', false);

        if ($jlightbox.data('autoplay')) {
          callback();
        } else {
          stopAutoplay();
        }
      }, 'linear');
  };

  const open = (index) => {
    $jlightbox
      .trigger('before-open')
      .trigger('focus')
      .attr('aria-hidden', false)
      .addClass(`${classPrefix}--is-opening`);

    doOpenAnimation(
      $items.filter(`[data-jlightbox-id="${index || '0'}"]`),
      $stage,
      options,
    );

    updateIndex(index);

    $prevButton.fadeIn(openAnimationDuration);
    $nextButton.fadeIn(openAnimationDuration);
    $control.fadeIn(openAnimationDuration, noop, 'flex');
    $index.fadeIn(openAnimationDuration);

    $background.fadeIn(openAnimationDuration, () => {
      $jlightbox
        .data('current-index', index)
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
      || $jlightbox.hasClass(`${classPrefix}--is-closing`)) {
      return;
    }

    const index = $jlightbox.data('current-index') || 0;
    const $video = $jlightbox.find('video');

    window.location.hash = '';

    if ($video.length) {
      $video.get(0).pause();
    }

    closeFullscreen();
    stopAutoplay();

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

    $prevButton.fadeOut(closeAnimationDuration);
    $nextButton.fadeOut(closeAnimationDuration);
    $control.fadeOut(openAnimationDuration);
    $index.fadeOut(openAnimationDuration);

    $background.fadeOut(closeAnimationDuration, () => {
      $jlightbox
        .removeClass(`${classPrefix}--is-closing`)
        .trigger('after-close');
    });
  };

  const goTo = (indexToGoTo) => {
    if ($stage.data('busy')) {
      return;
    }

    const index = $jlightbox.data('current-index');
    const $itemToGoTo = $items.filter(`[data-jlightbox-id="${indexToGoTo}"]`);

    if (!$itemToGoTo.length) {
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
    $jlightbox.data('current-index', indexToGoTo);
    $stage.data('busy', true);

    $itemWrapper
      .append($clonedContent)
      .append($realContent);

    $stage[insertionMethod]($itemWrapper);
    $loadingIndicator.stop().fadeIn(200);
    window.location.hash = getHash($itemToGoTo.attr('href'));

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

      $itemWrapper.css({
        left: '100vw',
      });
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

      $itemWrapper.css({
        right: '100vw',
      });
    }

    const onContentLoad = () => {
      $realContent.data('original-width', $realContent.width());
      $realContent.data('original-height', $realContent.height());
      $loadingIndicator.stop().fadeOut(200);

      const targetDimensions = getTargetDimensions(
        $realContent,
        2 * options.stagePaddingX,
        2 * options.stagePaddingY,
      );

      handleAutoplay(() => goTo(indexToGoTo + 1));

      $realContent.css({
        opacity: 1,
        ...targetDimensions,
      });

      $clonedContent.css({
        opacity: 0,
        ...targetDimensions,
      });

      if (insertionMethod === 'append') {
        $itemWrapper.animate({
          left: '0px',
        }, slideAnimationDuration, () => {
          $stage.data('busy', false);
        });
      } else {
        $itemWrapper.animate({
          right: '0px',
        }, slideAnimationDuration, () => {
          $stage.data('busy', false);
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
    const index = $jlightbox.data('current-index');
    const prevIndex = index - 1;

    if (prevIndex >= 0) {
      goTo(prevIndex);

      $jlightbox.trigger('prev');
    }
  };

  const goToNext = () => {
    const index = $jlightbox.data('current-index');
    const nextIndex = index + 1;

    if (nextIndex <= $items.length) {
      goTo(nextIndex);

      $jlightbox.trigger('next');
    }
  };

  const goToFirst = () => goTo(0);

  const goToLast = () => goTo($items.length - 1);

  const toggleAutoplay = () => {
    if (!$jlightbox.data('autoplay')) {
      $jlightbox.data('autoplay', true);
      $autoplayButton.addClass(`${classPrefix}__control-button--autoplay-is-active`);
      handleAutoplay(goToNext);
    } else {
      stopAutoplay();
    }
  };

  // TODO: Add drag control
  // $stage.on('dragstart', `.${classPrefix}__item--real`, (event) => {
  // });

  $prevButton.when(additionalClasses.prevButton, 'addClass', additionalClasses.prevButton);
  $nextButton.when(additionalClasses.nextButton, 'addClass', additionalClasses.nextButton);
  $autoplayButton.when(additionalClasses.autoplayButton, 'addClass', additionalClasses.autoplayButton);
  $fullscreenButton.when(additionalClasses.fullscreenButton, 'addClass', additionalClasses.fullscreenButton);
  $closeButton.when(additionalClasses.closeButton, 'addClass', additionalClasses.closeButton);
  $stage.when(additionalClasses.stage, 'addClass', additionalClasses.stage);
  $index.when(additionalClasses.index, 'addClass', additionalClasses.index);
  $loadingIndicator.when(additionalClasses.loading, 'addClass', additionalClasses.loading);
  $progress.when(additionalClasses.progress, 'addClass', additionalClasses.progress);
  $background.when(additionalClasses.background, 'addClass', additionalClasses.background);

  $items.forEach(($item, index) => {
    $item.attr('data-jlightbox-id', index);

    if (window.location.hash === `#${getHash($item.attr('href'))}`) {
      setTimeout(() => open(index), 150);
    }
  });

  $jlightbox
    .css('z-index', options.zIndex)
    .when(additionalClasses.general, 'addClass', additionalClasses.general)
    .on('before-open', options.onBeforeOpen)
    .on('after-open', options.onAfterOpen)
    .on('before-close', options.onBeforeClose)
    .on('after-close', options.onAfterClose)
    .on('prev', options.onPrev)
    .on('next', options.onNext);

  $prevButton.on('click', goToPrev);
  $nextButton.on('click', goToNext);
  $autoplayButton.on('click', toggleAutoplay);
  $fullscreenButton.on('click', toggleFullscreen);
  $closeButton.on('click', close);
  $stage.on('click', close);

  $items.on('click', (event) => {
    event.preventDefault();

    if ($jlightbox.hasClass(`${classPrefix}--is-open`)
      || $jlightbox.hasClass(`${classPrefix}--is-opening`)
      || $jlightbox.hasClass(`${classPrefix}--is-closing`)) {
      return;
    }

    open(event.$currentTarget.data('jlightbox-id'));
  });

  $window
    .on('hashchange', () => {
      if ($jlightbox.hasClass(`${classPrefix}--is-opening`)) {
        return;
      }

      $items.forEach(($item, index) => {
        if (window.location.hash === `#${getHash($item.attr('href'))}`) {
          if ($jlightbox.hasClass(`${classPrefix}--is-open`)) {
            setTimeout(() => goTo(index), 150);
          } else {
            setTimeout(() => open(index), 150);
          }
        } else if (window.location.hash === '' && !$jlightbox.hasClass(`${classPrefix}--is-closing`)) {
          setTimeout(close, 150);
        }
      });
    })
    .on('resize', () => {
      if (!$jlightbox.hasClass(`${classPrefix}--is-open`)) {
        return;
      }

      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }

      resizeTimeout = setTimeout(() => handleResize($stage, options), options.resizeTimeoutDelay);
    })
    .on('keydown', ({ code }) => {
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
      } else if (keyboardControls.fullscreen.includes(code)) {
        if (options.templates.fullscreenButton !== null) {
          toggleFullscreen();
        }
      } else if (keyboardControls.autoplay.includes(code)) {
        if (options.templates.autoplayButton !== null) {
          toggleAutoplay();
        }
      } else if (keyboardControls.gallery.includes(code)) {
        // TODO
        // toggleGallery();
      }
    });

  return {
    open,
    close,
    goTo,
    goToPrev,
    goToNext,
    goToFirst,
    goToLast,
    toggleFullscreen,
    toggleAutoplay,
  };
};
