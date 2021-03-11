/* eslint-disable no-unused-vars */
import $ from 'jlight';

import jlightbox from './index';

import './jlightbox.scss';

$(() => {
  window.$ = $;

  const lightbox = jlightbox({
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
    },
    keyboardControls: {
      close: ['Escape', 'ArrowUp', 'ArrowDown', 'KeyW', 'KeyS'],
      prev: ['ArrowLeft', 'KeyA'],
      next: ['ArrowRight', 'KeyD'],
      fullscreen: ['KeyF'],
      autoplay: ['KeyP'],
      gallery: ['KeyG'],
    },
  });

  // Try something

  // lightbox.open(2);
});
