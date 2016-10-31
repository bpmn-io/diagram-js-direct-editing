'use strict';

var assign = require('lodash/object/assign'),
    domEvent = require('min-dom/lib/event'),
    domRemove = require('min-dom/lib/remove');

function stopPropagation(event) {
  event.stopPropagation();
}


/**
 * Initializes a container div 'contentContainer' which contains an editable content div 'content'.
 *
 * @param {object} options
 * @param {DOMElement} options.container The DOM element to append the contentContainer to
 * @param {String} options.keyHandler
 */
function TextBox(options) {

  this.container = options.container;

  this.content = document.createElement('div');

  this.content.contentEditable = 'true';

  this.keyHandler = options.keyHandler || function() {};
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
TextBox.prototype.create = function(bounds, style, value) {

  var content = this.content,
      container = this.container;

  assign(content.style, {
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
    overflowY: 'auto',
    border: '1px solid #ccc',
    padding: '2px',
    wordWrap: 'normal',
    textAlign: 'center',
    outline: 'none'
  }, style || {});

  content.innerText = value;

  domEvent.bind(content, 'keydown', this.keyHandler);
  domEvent.bind(content, 'mousedown', stopPropagation);

  container.appendChild(content);

  this.setCursor();

  return content;
};


/**
 * Clear content and style of the textbox, unbind listeners and
 * reset CSS style.
 */
TextBox.prototype.destroy = function() {
  var content = this.content;

  // clear content
  content.innerText = '';

  // clear optional bounds values
  assign(content.style, {
    width: '',
    height: '',
    maxWidth: '',
    maxHeight: '',
    minWidth: '',
    minHeight: ''
  });

  domEvent.unbind(content, 'keydown', this.keyHandler);
  domEvent.unbind(content, 'mousedown', stopPropagation);

  domRemove(content);
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
