'use strict';

var assign = require('lodash/object/assign'),
    bind = require('lodash/function/bind'),
    pick = require('lodash/object/pick');

var domAttr = require('min-dom/lib/attr'),
    domClasses = require('min-dom/lib/classes'),
    domEvent = require('min-dom/lib/event'),
    domRemove = require('min-dom/lib/remove');

var min = Math.min,
    max = Math.max;

function preventDefault(e) {
  e.preventDefault();
}

function stopPropagation(e) {
  e.stopPropagation();
}


/**
 * Initializes a container for a content editable div.
 *
 * Structure:
 *
 * container
 *   parent
 *     content
 *     handle
 *
 * @param {object} options
 * @param {DOMElement} options.container The DOM element to append the contentContainer to
 * @param {Function} options.keyHandler Handler for key events
 * @param {Function} options.resizeHandler Handler for resize events
 */
function TextBox(options) {
  this.container = options.container;

  this.parent = document.createElement('div');

  this.content = document.createElement('div');

  this.parent.appendChild(this.content);

  domAttr(this.content, 'contentEditable', 'true');

  this.keyHandler = options.keyHandler || function() {};
  this.resizeHandler = options.resizeHandler || function() {};

  this.autoResize = bind(this.autoResize, this);
}

module.exports = TextBox;


/**
 * Create a text box with the given position, size, style and text content
 *
 * @param {Object} bounds
 * @param {Number} bounds.x absolute x position
 * @param {Number} bounds.y absolute y position
 * @param {Number} [bounds.width] fixed width value
 * @param {Number} [bounds.height] fixed height value
 * @param {Number} [bounds.maxWidth] maximum width value
 * @param {Number} [bounds.maxHeight] maximum height value
 * @param {Number} [bounds.minWidth] minimum width value
 * @param {Number} [bounds.minHeight] minimum height value
 * @param {Object} [style]
 * @param {String} value text content
 *
 * @return {DOMElement} The created content DOM element
 */
TextBox.prototype.create = function(bounds, style, value, options) {
  var self = this;

  var parent = this.parent,
      content = this.content,
      container = this.container;

  options = options || {};

  style = this.style = style || {};

  var parentStyle = pick(style, [
    'width',
    'height',
    'maxWidth',
    'maxHeight',
    'minWidth',
    'minHeight',
    'left',
    'top',
    'backgroundColor',
    'position',
    'overflow',
    'border',
    'wordWrap',
    'textAlign',
    'outline',
    'transform'
  ]);

  assign(parent.style, {
    width: bounds.width + 'px',
    height: bounds.height + 'px',
    maxWidth: bounds.maxWidth + 'px',
    maxHeight: bounds.maxHeight + 'px',
    minWidth: bounds.minWidth + 'px',
    minHeight: bounds.minHeight + 'px',
    left: bounds.x + 'px',
    top: bounds.y + 'px',
    backgroundColor: '#ffffff',
    position: 'absolute',
    overflow: 'visible',
    border: '1px solid #ccc',
    wordWrap: 'normal',
    textAlign: 'center',
    outline: 'none'
  }, parentStyle);

  var contentStyle = pick(style, [
    'fontSize',
    'lineHeight',
    'padding',
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft'
  ]);

  assign(content.style, {
    boxSizing: 'border-box',
    width: '100%',
    outline: 'none'
  }, contentStyle);

  if (options.centerVertically) {
    assign(content.style, {
      position: 'absolute',
      top: '50%',
      transform: 'translate(0, -50%)'
    }, contentStyle);
  }

  content.innerText = value;

  domEvent.bind(content, 'keydown', this.keyHandler);
  domEvent.bind(content, 'mousedown', stopPropagation);
  domEvent.bind(content, 'paste', function(e) {
    self._handlePaste(e, style);
  });

  if (options.autoResize) {
    domEvent.bind(content, 'input', this.autoResize);
  }

  if (options.resizable) {
    this.resizable(style);
  }

  container.appendChild(parent);

  this.setCursor();

  return parent;
};

/**
 * Intercept paste events to remove formatting from pasted text.
 */
TextBox.prototype._handlePaste = function(e, style) {
  e.preventDefault();

  var text = e.clipboardData.getData('text/plain');

  this.content.innerText = text;

  this.setCursor();

  var hasResized = this.autoResize(style);

  if (hasResized) {
    this.resizeHandler(hasResized);
  }
};

/**
 * Automatically resize element vertically to fit its content.
 */
TextBox.prototype.autoResize = function() {
  var parent = this.parent,
      content = this.content;

  var fontSize = parseInt(this.style.fontSize) || 12;

  if (content.scrollHeight > parent.offsetHeight ||
      content.scrollHeight < parent.offsetHeight - fontSize) {
    var bounds = parent.getBoundingClientRect();

    var height = content.scrollHeight;
    parent.style.height = height + 'px';

    this.resizeHandler({
      width: bounds.width,
      height: bounds.height,
      dx: 0,
      dy: height - bounds.height
    });
  }
};

/**
 * Make an element resizable by adding a resize handle.
 */
TextBox.prototype.resizable = function() {
  var self = this;

  var parent = this.parent,
      resizeHandle = this.resizeHandle;

  var minWidth = parseInt(this.style.minWidth) || 0,
      minHeight = parseInt(this.style.minHeight) || 0,
      maxWidth = parseInt(this.style.maxWidth) || Infinity,
      maxHeight = parseInt(this.style.maxHeight) || Infinity;

  if (!resizeHandle) {
    resizeHandle = this.resizeHandle = document.createElement('div');

    domClasses(resizeHandle).add('djs-direct-editing-resize-handle');

    var startX, startY, startWidth, startHeight;

    var onMouseDown = function(e) {
      preventDefault(e);
      stopPropagation(e);

      startX = e.clientX;
      startY = e.clientY;

      var bounds = parent.getBoundingClientRect();

      startWidth = bounds.width;
      startHeight = bounds.height;

      domEvent.bind(document, 'mousemove', onMouseMove);
      domEvent.bind(document, 'mouseup', onMouseUp);
    };

    var onMouseMove = function(e) {
      preventDefault(e);
      stopPropagation(e);

      var newWidth = min(max(startWidth + e.clientX - startX, minWidth), maxWidth);
      var newHeight = min(max(startHeight + e.clientY - startY, minHeight), maxHeight);

      parent.style.width = newWidth + 'px';
      parent.style.height = newHeight + 'px';

      self.resizeHandler({
        width: startWidth,
        height: startHeight,
        dx: e.clientX - startX,
        dy: e.clientY - startY
      });
    };

    var onMouseUp = function(e) {
      preventDefault(e);
      stopPropagation(e);

      domEvent.unbind(document,'mousemove', onMouseMove, false);
      domEvent.unbind(document, 'mouseup', onMouseUp, false);
    };

    domEvent.bind(resizeHandle, 'mousedown', onMouseDown);
  }

  assign(resizeHandle.style, {
    position: 'absolute',
    bottom: '0px',
    right: '0px',
    cursor: 'nwse-resize',
    width: '0',
    height: '0',
    borderTop: (parseInt(this.style.fontSize) / 4 || 3) + 'px solid transparent',
    borderRight: (parseInt(this.style.fontSize) / 4 || 3) + 'px solid #ccc',
    borderBottom: (parseInt(this.style.fontSize) / 4 || 3) + 'px solid #ccc',
    borderLeft: (parseInt(this.style.fontSize) / 4 || 3) + 'px solid transparent'
  });

  parent.appendChild(resizeHandle);
};


/**
 * Clear content and style of the textbox, unbind listeners and
 * reset CSS style.
 */
TextBox.prototype.destroy = function() {
  var parent = this.parent,
      content = this.content,
      resizeHandle = this.resizeHandle;

  // clear content
  content.innerText = '';

  // clear styles
  parent.removeAttribute('style');
  content.removeAttribute('style');

  domEvent.unbind(content, 'keydown', this.keyHandler);
  domEvent.unbind(content, 'mousedown', stopPropagation);
  domEvent.unbind(content, 'input', this.autoResize);

  if (resizeHandle) {
    resizeHandle.removeAttribute('style');

    domRemove(resizeHandle);
  }

  domRemove(parent);
};


TextBox.prototype.getValue = function() {
  return this.content.innerText;
};


/**
 * Set the cursor to the end of the text
 */
TextBox.prototype.setCursor = function() {

  this.content.focus();

  // scroll to the bottom
  this.content.scrollTop = this.content.scrollHeight;

  if (typeof window.getSelection != 'undefined' && typeof document.createRange != 'undefined') {

    var range = document.createRange();

    range.selectNodeContents(this.content);
    range.collapse(false);

    var selection = window.getSelection();

    selection.removeAllRanges();
    selection.addRange(range);

  } else if (typeof document.body.createTextRange != 'undefined') {

    var textRange = document.body.createTextRange();

    textRange.moveToElementText(this.content);
    textRange.collapse(false);
    textRange.select();
  }
};
