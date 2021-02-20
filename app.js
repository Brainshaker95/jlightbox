/* eslint-disable no-unused-vars */
import $, { noop } from 'jlight';

import jlightbox from './index';

import './jlightbox.scss';

$(() => {
  window.$ = $;

  const lightbox = jlightbox({
    selector: '[data-jlightbox]',
    classPrefix: 'jlightbox',
    additionalClasses: '',
    additionalPrevButtonClasses: '',
    additionalNextClasses: '',
    additionalCloseClasses: '',
    additionalStageClasses: '',
    additionalIndexClasses: '',
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
    videoTypes: ['mp4', 'mpeg', 'webm'],
    indexText: '{{ current }} / {{ total }}',
    zIndex: 20,
  });

  // Try something

  // lightbox.open(2);
});
