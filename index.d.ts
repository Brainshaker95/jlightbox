declare module 'jlightbox';

type galleryPositions = 'bottom' | 'top';
type eventListener = (lightbox: jLightbox, index: number) => void;

interface additionalClasses {
  general?: string,
  prevButton?: string,
  nextButton?: string,
  autoplayButton?: string,
  galleryButton?: string,
  fullscreenButton?: string,
  closeButton?: string,
  stage?: string,
  gallery?: string,
  index?: string,
  loading?: string,
  progress?: string,
  background?: string,
}

interface templates {
  general?: string,
  prevButton?: string,
  nextButton?: string,
  autoplayButton?: string,
  galleryButton?: string,
  fullscreenButton?: string,
  closeButton?: string,
  loading?: string,
  gallery?: string,
  progress?: string,
}

interface keyboardControls {
  close?: string[],
  prev?: string[],
  next?: string[],
  fullscreen?: string[],
  autoplay?: string[],
  gallery?: string[],
}

interface translations {
  close?: string,
  next?: string,
  prev?: string,
  toggleAutoplay?: string,
  toggleFullscreen?: string,
  toggleGallery?: string,
}

interface options {
  /** Selector for your elements */
  selector?: string,
  /** Prefix for all classes */
  classPrefix?: string,
  /** Time per element if autoplay is enabled */
  autoplayDuration?: number,
  /** Time to open in ms */
  openAnimationDuration?: number,
  /** Time to close in ms */
  closeAnimationDuration?: number,
  /** Time to slide in ms */
  slideAnimationDuration?: number,
  /** Animation style to open */
  openAnimationType?: string,
  /** Animation style to close */
  closeAnimationType?: string,
  /** Distance to swipe before it slides to the next element */
  swipeThreshold?: number,
  /** Hides the original element */
  hideOriginalWhenOpened?: boolean,
  /** Position of gallery */
  galleryPosition?: galleryPositions,
  /** Time for to fade in in ms */
  galleryItemFadeInDuration?: number,
  /** Is the gallery visible */
  showGalleryByDefault?: boolean,
  /** Is the gallery visible */
  appendArrowsToStage?: boolean,
  /** Padding for the asset container horizontal */
  stagePaddingX?: number,
  /** Padding for the asset container vertical */
  stagePaddingY?: number,
  /** Function that calls before the modal opens */
  onBeforeOpen?: eventListener,
  /** Function that calls after the modal opens */
  onAfterOpen?: eventListener,
  /** Function that calls before the modal closes */
  onBeforeClose?: eventListener,
  /** Function that calls after the modal closes */
  onAfterClose?: eventListener,
  /** Function that calls before it slides to another element */
  onBeforeSlide?: eventListener,
  /** Function that calls after it slides to another element */
  onAfterSlide?: eventListener,
  /** Function that calls when it slides to the previous element */
  onPrev?: eventListener,
  /** Function that calls when it slides to the next element */
  onNext?: eventListener,
  /** The language to show the text in */
  language?: string,
  /** The translations for all supported languages */
  translations?: {
    [key: string]: translations,
  },
  /** Extensions that are marked as video */
  videoTypes?: string[],
  /** Text to show in the top left corner */
  indexText?: string,
  /** z-Index for the overlay */
  zIndex?: number,
  /** Additional classes for templates */
  additionalClasses?: additionalClasses,
  /** Custom HTML for teplates */
  templates?: templates,
  /** Keyboard controls for controlling the Lightbox */
  keyboardControls?: keyboardControls,
};

interface jLightbox {
  /**
   * Open the overlay at index
   * @param {number} index Initial index
   */
  open: (index: number) => void,
  /**
   * Close the overlay
   * @param {any} [event] Click event
   */
  close: (event?: any) => void,
  /**
   * Go to element with index
   * @param {number} indexToGoTo Index to go to
   */
  goTo: (indexToGoTo: number) => void,
  /** Go to next element */
  goToPrev: () => void,
  /** Go to previous element */
  goToNext: () => void,
  /** Go to first element */
  goToFirst: () => void,
  /** Go to last element */
  goToLast: () => void,
  /** Toggle autoplay feature */
  toggleAutoplay: () => void,
  /** Toggle the gallery */
  toggleGallery: () => void,
  /** Toggle fullscreen */
  toggleFullscreen: () => void,
  /** Get current index */
  getCurrentIndex: () => number,
  /** Get current element */
  getElement: () => any,
  /** Get current options */
  getOptions: () => options,
  /** Get count of all items */
  getTotalItemCount: () => number,
  /** Remove the overlay and remove the event listener */
  destroy: () => void
}

declare function jlightbox(options: options): jLightbox;

export = jlightbox;
