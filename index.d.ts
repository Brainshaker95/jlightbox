declare module 'jlightbox';

type galleryPositions = 'bottom' | 'top' | 'left' | 'right';
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
  /** Selector for the elements that should be displayed in the lightbox */
  selector?: string,
  /** Prefix for all classes used for the lightbox DOM elements */
  classPrefix?: string,
  /** Time per element if autoplay is enabled */
  autoplayDuration?: number,
  /** Time to open in ms */
  openAnimationDuration?: number,
  /** Time to close in ms */
  closeAnimationDuration?: number,
  /** Time to slide in ms */
  slideAnimationDuration?: number,
  /** Animation style for opening */
  openAnimationType?: string,
  /** Animation style for closing */
  closeAnimationType?: string,
  /** Distance to swipe before sliding to the next element */
  swipeThreshold?: number,
  /** Hides the original element when the lighbox is opened */
  hideOriginalWhenOpened?: boolean,
  /** Position of gallery */
  galleryPosition?: galleryPositions,
  /** Time for gallery fading in in ms */
  galleryItemFadeInDuration?: number,
  /** Whether the gallery is open by default */
  showGalleryByDefault?: boolean,
  /** Whether to append navigation arraows to the lightbox stage */
  appendArrowsToStage?: boolean,
  /** Horizontal padding for the asset container */
  stagePaddingX?: number,
  /** Vertical padding for the asset container */
  stagePaddingY?: number,
  /** Function that will be called before the lightbox opens */
  onBeforeOpen?: eventListener,
  /** Function that will be called after the lightbox opens */
  onAfterOpen?: eventListener,
  /** Function that will be called before the lightbox closes */
  onBeforeClose?: eventListener,
  /** Function that will be called after the lightbox closes */
  onAfterClose?: eventListener,
  /** Function that will be called before sliding to another element */
  onBeforeSlide?: eventListener,
  /** Function that will be called after sliding to another element */
  onAfterSlide?: eventListener,
  /** Function that will be called when sliding to the previous element */
  onPrev?: eventListener,
  /** Function that will be called when sliding to the next element */
  onNext?: eventListener,
  /** The language to use for the button titles */
  language?: string,
  /** The translation dictionary used for translating the button titles */
  translations?: {
    [key: string]: translations,
  },
  /** File extensions that the lightbox will recognize as videos to load them correctly */
  videoTypes?: string[],
  /** Pattern to determine how the current items index should be displayed */
  indexText?: string,
  /** CSS z-Index for the lightbox */
  zIndex?: number,
  /** Additional classes for the templates */
  additionalClasses?: additionalClasses,
  /** Custom HTML for the templates */
  templates?: templates,
  /** Keyboard controls for controlling the lightbox */
  keyboardControls?: keyboardControls,
};

interface jLightbox {
  /**
   * Opens the lightbox at the given index
   *
   * @param {number} index Initial index
   */
  open: (index: number) => void,
  /**
   * Closes the lightbox
   *
   * @param {any} [event] Click event
   */
  close: (event?: any) => void,
  /**
   * Goes to element with the given index
   *
   * @param {number} indexToGoTo Index to go to
   */
  goTo: (indexToGoTo: number) => void,
  /** Goes to next element */
  goToPrev: () => void,
  /** Goes to previous element */
  goToNext: () => void,
  /** Goes to first element */
  goToFirst: () => void,
  /** Goes to last element */
  goToLast: () => void,
  /** Toggles autoplay feature */
  toggleAutoplay: () => void,
  /** Toggles the gallery */
  toggleGallery: () => void,
  /** Toggles fullscreen mode */
  toggleFullscreen: () => void,
  /** Gets the current items index */
  getCurrentIndex: () => number,
  /** Gets the lightbox container element */
  getElement: () => any,
  /** Gets the lightbox options */
  getOptions: () => options,
  /** Gets the total lightbox item count */
  getTotalItemCount: () => number,
  /** Destroys the lightbox instance */
  destroy: () => void
}

declare function jlightbox(options: options): jLightbox;

export = jlightbox;
