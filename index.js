import $, { noop } from 'jlight';

const translate = (options, key) => {
  let language = 'en';

  const translations = {
    ...options.translations,
    en: {
      close: 'Close',
      next: 'Next Item',
      prev: 'Previous Item',
      ...(options.translations.en || {}),
    },
    de: {
      close: 'Schließen',
      next: 'Nächstes Element',
      prev: 'Vorheriges Element',
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

const getPlaceholders = (string) => (string.match(/{{(.*?)}}/g) || []).map((match) => match.slice(2, -2));

const replacePlaceholders = (theString, options) => {
  let string = theString;

  getPlaceholders(string).forEach((theKey) => {
    const key = theKey.trim();
    const replaceRegEx = new RegExp(`{{ ${key} }}`, 'g');

    string = string.replace(replaceRegEx, translate(options, key));
  });

  return string;
};

const template = (options) => {
  const { classPrefix } = options;

  let {
    prevButtonTemplate,
    nextButtonTemplate,
    closeButtonTemplate,
    loadingIndicatorTemplate,
  } = options;

  if (!prevButtonTemplate) {
    const prev = translate(options, 'prev');

    prevButtonTemplate = `
      <button
        type="button"
        class="${classPrefix}__arrow ${classPrefix}__arrow--prev"
        title="${prev}"
        aria-label="${prev}"
        data-jlightbox-prev
      ></button>
    `;
  } else {
    prevButtonTemplate = replacePlaceholders(prevButtonTemplate, options);
  }

  if (!nextButtonTemplate) {
    const next = translate(options, 'next');

    nextButtonTemplate = `
      <button
        type="button"
        class="${classPrefix}__arrow ${classPrefix}__arrow--next"
        title="${next}"
        aria-label="${next}"
        data-jlightbox-next
      ></button>
    `;
  } else {
    nextButtonTemplate = replacePlaceholders(nextButtonTemplate, options);
  }

  if (!closeButtonTemplate) {
    const close = translate(options, 'close');

    closeButtonTemplate = `
      <button
        type="button"
        class="${classPrefix}__control-button ${classPrefix}__control-button--close"
        title="${close}"
        aria-label="${close}"
        data-jlightbox-close
      ></button>
    `;
  } else {
    closeButtonTemplate = replacePlaceholders(closeButtonTemplate, options);
  }

  if (!loadingIndicatorTemplate) {
    loadingIndicatorTemplate = `<div class="${classPrefix}__loading" data-jlightbox-loading></div>`;
  }

  return `
    <div class="${classPrefix}">
      ${prevButtonTemplate}
      <div class="${classPrefix}__stage" data-jlightbox-stage></div>
      ${nextButtonTemplate}
      ${closeButtonTemplate}
      ${loadingIndicatorTemplate}
      <div class="${classPrefix}__background" data-jlightbox-background></div>
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

const doOpenAnimation = ($originalItem, $stage, options) => {
  const {
    classPrefix,
    openAnimationDuration,
    openAnimationType,
    stagePaddingX,
    stagePaddingY,
    zIndex,
  } = options;

  const originalDimensions = getOriginalDimensions($originalItem);
  const href = $originalItem.attr('href');
  const isVideo = href.endsWith('mp4') || href.endsWith('webm');
  let $realContent;

  if (isVideo) {
    $realContent = $(`<video class="${classPrefix}__item ${classPrefix}__item--video ${classPrefix}__item--real" controls><source src="${href}"></source></video>`);
  } else {
    $realContent = $(`<img src="${href}" class="${classPrefix}__item ${classPrefix}__item--image ${classPrefix}__item--real">`);
  }

  const $loadingIndicator = $stage.closest(`.${classPrefix}`).find('[data-jlightbox-loading]');

  const $clonedContent = $originalItem
    .find(':first-child')
    .clone()
    .addClass(`${classPrefix}__item ${classPrefix}__item--cloned`);

  const $itemWrapper = $(`<div class="${classPrefix}__item-wrapper">`);

  $itemWrapper
    .append($clonedContent)
    .append($realContent);

  $originalItem.css('z-index', zIndex + 1);
  $loadingIndicator.stop().fadeIn(200);

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

  $realContent.stop().animate({
    opacity: 0,
    ...originalDimensions,
  }, closeAnimationDuration, noop, closeAnimationType);

  $clonedContent.stop().animate({
    opacity: 1,
    ...originalDimensions,
  }, closeAnimationDuration, noop, closeAnimationType);
};

export default (opts = {}) => {
  const options = {
    selector: '[data-jlightbox]',
    classPrefix: 'jlightbox',
    additionalClasses: '',
    additionalPrevButtonClasses: '',
    additionalNextClasses: '',
    additionalCloseClasses: '',
    additionalStageClasses: '',
    additionalLoadingClasses: '',
    additionalBackgroundClasses: '',
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
    translations: {},
    template: '',
    prevButtonTemplate: '',
    nextButtonTemplate: '',
    closeButtonTemplate: '',
    loadingIndicatorTemplate: '',
    zIndex: 20,
    ...opts,
  };

  const {
    classPrefix,
    additionalClasses,
    additionalPrevButtonClasses,
    additionalNextClasses,
    additionalCloseClasses,
    additionalStageClasses,
    additionalLoadingClasses,
    additionalBackgroundClasses,
    openAnimationDuration,
    closeAnimationDuration,
    slideAnimationDuration,
  } = options;

  let resizeTimeout;
  const $window = $(window);
  const $items = $(options.selector);
  const $jlightbox = $(options.template
    ? replacePlaceholders(options.template, options)
    : template(options));

  $('body').append($jlightbox);

  const $stage = $jlightbox.find('[data-jlightbox-stage]');
  const $prevButton = $jlightbox.find('[data-jlightbox-prev]');
  const $nextButton = $jlightbox.find('[data-jlightbox-next]');
  const $closeButton = $jlightbox.find('[data-jlightbox-close]');
  const $loadingIndicator = $jlightbox.find('[data-jlightbox-loading]');
  const $background = $jlightbox.find('[data-jlightbox-background]');

  $jlightbox.when(additionalClasses, 'addClass', additionalClasses);
  $prevButton.when(additionalPrevButtonClasses, 'addClass', additionalPrevButtonClasses);
  $nextButton.when(additionalNextClasses, 'addClass', additionalNextClasses);
  $closeButton.when(additionalCloseClasses, 'addClass', additionalCloseClasses);
  $stage.when(additionalStageClasses, 'addClass', additionalStageClasses);
  $loadingIndicator.when(additionalLoadingClasses, 'addClass', additionalLoadingClasses);
  $background.when(additionalBackgroundClasses, 'addClass', additionalBackgroundClasses);

  $items.forEach(($item, index) => $item.attr('data-jlightbox-id', index));

  $jlightbox.css('z-index', options.zIndex);

  $jlightbox
    .on('before-open', options.onBeforeOpen)
    .on('after-open', options.onAfterOpen)
    .on('before-close', options.onBeforeClose)
    .on('after-close', options.onAfterClose)
    .on('prev', options.onPrev)
    .on('next', options.onNext);

  $window.on('resize', () => {
    if (!$jlightbox.hasClass(`${classPrefix}--is-open`)) {
      return;
    }

    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }

    resizeTimeout = setTimeout(() => handleResize($stage, options), options.resizeTimeoutDelay);
  });

  const open = (index) => {
    $jlightbox
      .trigger('before-open')
      .addClass(`${classPrefix}--is-opening`);

    doOpenAnimation(
      $items.filter(`[data-jlightbox-id="${index || '0'}"]`),
      $stage,
      options,
    );

    $prevButton.fadeIn(openAnimationDuration);
    $nextButton.fadeIn(openAnimationDuration);
    $closeButton.fadeIn(openAnimationDuration);

    $background.fadeIn(openAnimationDuration, () => {
      $jlightbox
        .data('current-index', index)
        .removeClass(`${classPrefix}--is-opening`)
        .addClass(`${classPrefix}--is-open`)
        .trigger('after-open');
    });
  };

  const close = () => {
    const index = $jlightbox.data('current-index') || 0;
    const $video = $jlightbox.find('video');

    if ($video.length) {
      $video.get(0).pause();
    }

    $jlightbox
      .trigger('before-close')
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
    $closeButton.fadeOut(openAnimationDuration);

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
    const insertionMethod = indexToGoTo < index ? 'prepend' : 'append';
    const $currentItemWrapper = $stage.find(`.${classPrefix}__item-wrapper`);
    const $itemToGoTo = $items.filter(`[data-jlightbox-id="${indexToGoTo}"]`);

    if (!$itemToGoTo.length) {
      return;
    }

    const href = $itemToGoTo.attr('href');
    const isVideo = href.endsWith('mp4') || href.endsWith('webm');
    let $realContent;

    if (isVideo) {
      $realContent = $(`<video class="${classPrefix}__item ${classPrefix}__item--video ${classPrefix}__item--real" controls><source src="${href}"></source></video>`);
    } else {
      $realContent = $(`<img src="${href}" class="${classPrefix}__item ${classPrefix}__item--image ${classPrefix}__item--real">`);
    }

    const $clonedContent = $itemToGoTo
      .find(':first-child')
      .clone()
      .addClass(`${classPrefix}__item ${classPrefix}__item--cloned`);

    const $itemWrapper = $(`<div class="${classPrefix}__item-wrapper">`);

    $jlightbox.data('current-index', indexToGoTo);
    $stage.data('busy', true);

    $itemWrapper
      .append($clonedContent)
      .append($realContent);

    $stage[insertionMethod]($itemWrapper);
    $loadingIndicator.stop().fadeIn(200);

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

      $realContent.css(targetDimensions);

      $clonedContent.css({
        ...targetDimensions,
        opacity: 0,
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

  $stage.on('click', ({ target }) => {
    if (target !== $stage.get(0)
      || $jlightbox.hasClass(`${classPrefix}--is-opening`)
      || $jlightbox.hasClass(`${classPrefix}--is-closing`)) {
      return;
    }

    close();
  });

  $items.on('click', (event) => {
    event.preventDefault();

    if ($jlightbox.hasClass(`${classPrefix}--is-open`)
      || $jlightbox.hasClass(`${classPrefix}--is-opening`)
      || $jlightbox.hasClass(`${classPrefix}--is-closing`)) {
      return;
    }

    open(event.$currentTarget.data('jlightbox-id'));
  });

  // TODO: Add drag control
  // $stage.on('dragstart', `.${classPrefix}__item--real`, (event) => {
  // });

  $prevButton.on('click', goToPrev);
  $nextButton.on('click', goToNext);
  $closeButton.on('click', close);

  return {
    open,
    close,
    goTo,
    goToPrev,
    goToNext,
    goToFirst,
    goToLast,
  };
};
