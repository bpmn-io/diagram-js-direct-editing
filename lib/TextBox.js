'use strict';

var assign = require('lodash/object/assign'),
    domEvent = require('min-dom/lib/event'),
    domRemove = require('min-dom/lib/remove');

function stopPropagation(event) {
  event.stopPropagation();
}

function TextBox(options) {

  this.container = options.container;
  this.textarea = document.createElement('textarea');

  this.keyHandler = options.keyHandler || function() {};
}

module.exports = TextBox;


TextBox.prototype.create = function(bounds, style, value) {

  var textarea = this.textarea,
      container = this.container;

  assign(textarea.style, {
    width: bounds.width + 'px',
    height: bounds.height + 'px',
    left: bounds.x + 'px',
    top: bounds.y + 'px',
    position: 'absolute',
    textAlign: 'center',
    boxSizing: 'border-box'
  }, style || {});

  textarea.value = value;
  textarea.title = 'Press SHIFT+Enter for line feed';

  domEvent.bind(textarea, 'keydown', this.keyHandler);
  domEvent.bind(textarea, 'mousedown', stopPropagation);

  container.appendChild(textarea);

  setTimeout(function() {
    if (textarea.parent) {
      textarea.select();
    }
    textarea.focus();
  }, 100);
};

TextBox.prototype.destroy = function() {
  var textarea = this.textarea;

  textarea.value = '';

  domEvent.unbind(textarea, 'keydown', this.keyHandler);
  domEvent.unbind(textarea, 'mousedown', stopPropagation);

  domRemove(textarea);
};

TextBox.prototype.getValue = function() {
  return this.textarea.value;
};
