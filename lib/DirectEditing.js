import {
  bind,
  find
} from 'min-dash';

import TextBox from './TextBox.js';

/**
 * @typedef {import('diagram-js/lib/core/Canvas.js').default} Canvas
 * @typedef {import('diagram-js/lib/core/EventBus.js').default} EventBus
 *
 * @typedef {import('diagram-js/lib/model/Types.js').Element} Element
 *
 * @typedef {import('diagram-js/lib/util/Types.js').Rect} Rect
 *
 * @typedef {import('./TextBox.js').TextBoxBounds} TextBoxBounds
 * @typedef {import('./TextBox.js').TextBoxStyle} TextBoxStyle
 * @typedef {import('./TextBox.js').TextBoxOptions} TextBoxOptions
 * @typedef {import('./TextBox.js').TextBoxResizeEvent} TextBoxResizeEvent
 */

/**
 * The context returned by a {@link DirectEditingProvider} to activate
 * direct editing for an element.
 *
 * @typedef { {
 *   bounds: TextBoxBounds;
 *   text: string;
 *   style?: TextBoxStyle;
 *   options?: TextBoxOptions;
 * } } DirectEditingContext
 */

/**
 * A provider that enables direct editing for elements.
 *
 * @typedef { {
 *   activate: (element: Element) => DirectEditingContext | null | undefined;
 *   update: (element: Element, newText: string, previousText: string, bounds: Rect) => void;
 * } } DirectEditingProvider
 */

/**
 * @typedef { {
 *   element: Element;
 *   context: DirectEditingContext;
 *   provider: DirectEditingProvider;
 * } } DirectEditingActive
 */

/**
 * A direct editing component that allows users
 * to edit an elements text directly in the diagram
 *
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 */
export default function DirectEditing(eventBus, canvas) {

  this._eventBus = eventBus;
  this._canvas = canvas;

  /**
   * @type {DirectEditingProvider[]}
   */
  this._providers = [];

  /**
   * @type {DirectEditingActive | null}
   */
  this._active = null;

  this._textbox = new TextBox({
    container: canvas.getContainer(),
    keyHandler: bind(this._handleKey, this),
    resizeHandler: bind(this._handleResize, this),
    focusoutHandler: bind(this._handleFocusout, this)
  });

  eventBus.on([ 'diagram.clear', 'diagram.destroy' ], () => this._cleanup());
}

DirectEditing.$inject = [ 'eventBus', 'canvas' ];


/**
 * Register a direct editing provider.
 *
 * A provider must expose an `#activate(element)` method that returns
 * an activation context (`{ bounds: { x, y, width, height }, text }`) if
 * direct editing is available for the given element.
 *
 * Additionally the provider must expose an
 * `#update(element, newText, previousText, bounds)` method to receive
 * direct editing updates.
 *
 * @param {DirectEditingProvider} provider
 */
DirectEditing.prototype.registerProvider = function(provider) {
  this._providers.push(provider);
};


/**
 * Returns true if direct editing is currently active
 *
 * @param {Element} [element]
 *
 * @return {boolean}
 */
DirectEditing.prototype.isActive = function(element) {
  return !!(this._active && (!element || this._active.element === element));
};


/**
 * Cancel direct editing, if it is currently active
 */
DirectEditing.prototype.cancel = function() {
  if (!this._active) {
    return;
  }

  this._fire('cancel');
  this.close();
};


/**
 * @param {string} event
 * @param {Object} [context]
 */
DirectEditing.prototype._fire = function(event, context) {
  this._eventBus.fire('directEditing.' + event, context || { active: this._active });
};

/**
 * Close direct editing, if it is currently active.
 */
DirectEditing.prototype.close = function() {
  this._fire('deactivate');

  this._cleanup();

  // restoreFocus API is available from diagram-js@15.0.0
  this._canvas.restoreFocus && this._canvas.restoreFocus();
};

DirectEditing.prototype._cleanup = function() {
  if (!this._active) {
    return;
  }

  this._textbox.destroy();

  this._active = null;

  this.resizable = undefined;
};

/**
 * Complete direct editing, updating the element via the
 * active provider if the text or bounds changed.
 */
DirectEditing.prototype.complete = function() {

  var active = this._active;

  if (!active) {
    return;
  }

  var containerBounds,
      previousBounds = active.context.bounds,
      newBounds = this.$textbox.getBoundingClientRect(),
      newText = this.getValue(),
      previousText = active.context.text;

  if (
    newText !== previousText ||
    newBounds.height !== previousBounds.height ||
    newBounds.width !== previousBounds.width
  ) {
    containerBounds = this._textbox.container.getBoundingClientRect();

    active.provider.update(active.element, newText, active.context.text, {
      x: newBounds.left - containerBounds.left,
      y: newBounds.top - containerBounds.top,
      width: newBounds.width,
      height: newBounds.height
    });
  }

  this._fire('complete');

  this.close();
};


/**
 * Returns the current text value.
 *
 * @return {string}
 */
DirectEditing.prototype.getValue = function() {
  return this._textbox.getValue();
};


/**
 * @param {KeyboardEvent} e
 */
DirectEditing.prototype._handleKey = function(e) {

  // stop bubble
  e.stopPropagation();

  var key = e.keyCode || e.charCode;

  // ESC
  if (key === 27) {
    e.preventDefault();
    return this.cancel();
  }

  // Enter
  if (key === 13 && !e.shiftKey) {
    e.preventDefault();
    return this.complete();
  }
};


/**
 * @param {TextBoxResizeEvent} event
 */
DirectEditing.prototype._handleResize = function(event) {
  this._fire('resize', event);
};


/**
 * @param {FocusEvent} event
 */
DirectEditing.prototype._handleFocusout = function(event) {

  // ignore focus moves within the textbox (e.g. to the resize handle)
  if (event.relatedTarget && this._textbox.parent.contains(event.relatedTarget)) {
    return;
  }

  this.complete();
};


/**
 * Activate direct editing on the given element
 *
 * @param {Element} element
 *
 * @return {boolean} true if the activation was possible
 */
DirectEditing.prototype.activate = function(element) {
  if (this.isActive()) {
    this.cancel();
  }

  if (this._eventBus.fire('directEditing.activate.allowed', { element: element }) === false) {
    return false;
  }

  // the direct editing context
  var context;

  var provider = find(this._providers, function(p) {
    return ((context = p.activate(element))) ? p : null;
  });

  // check if activation took place
  if (context) {
    this.$textbox = this._textbox.create(
      context.bounds,
      context.style,
      context.text,
      context.options
    );

    this._active = {
      element: element,
      context: context,
      provider: provider
    };

    if (context.options && context.options.resizable) {
      this.resizable = true;
    }

    this._fire('activate');
  }

  return !!context;
};
