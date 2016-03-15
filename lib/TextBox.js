'use strict';

var assign = require('lodash/object/assign'),
    domEvent = require('min-dom/lib/event'),
    domRemove = require('min-dom/lib/remove'),
    domClasses = require('min-dom/lib/classes');

function stopPropagation(event) {
  event.stopPropagation();
}

function TextBox(options) {

  this.container = options.container;

  this.textarea = document.createElement('textarea');

  this.keyHandler = options.keyHandler || function() {};
}

module.exports = TextBox;

TextBox.prototype.create = function(bounds, style, value, options) {

  var textarea = this.textarea,
      container = this.container;

  assign(textarea.style, {
    width: bounds.width + 'px',
    height: bounds.height + 'px',
    left: bounds.x + 'px',
    top: bounds.y + 'px',
    position: 'absolute',
    textAlign: (!!options && !!options.textAlignment) ? options.textAlignment : 'center',
    boxSizing: 'border-box'
  }, style || {});

  textarea.value = value;
  textarea.title = 'Press SHIFT+Enter for line feed';

  if(options) {
    textarea.autosizing = options.autosizing;
    textarea.defaultHeight = options.defaultHeight;
    textarea.maxHeight = options.maxHeight;
  }

  domEvent.bind(textarea, 'keydown', this.keyHandler);
  domEvent.bind(textarea, 'mousedown', stopPropagation);


  if (textarea.autosizing){
    domEvent.bind(textarea, 'keyup', this.autosize);
    domEvent.bind(textarea, 'mousedown', this.resize);
  }

  //enables scrolling inside the textarea
  domClasses(textarea).add('djs-scrollable');
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

  if (textarea.autosizing) {
    domEvent.unbind(textarea, 'keyup', this.autosize);
    domEvent.unbind(textarea, 'mousedown', this.resize);
  }

  domRemove(textarea);
};

TextBox.prototype.getValue = function() {
  return this.textarea.value;
};

TextBox.prototype.autosize = function() {

  var textarea = this;

  if (!this.maxHeight || this.maxHeight > this.scrollHeight) {
    textarea.style.overflow = "hidden";
    if (this.scrollHeight == this.clientHeight) {
      textarea.style.height = this.defaultHeight + "px";
    }
    if (this.scrollHeight > this.clientHeight) {
      var calcHeight = textarea.scrollHeight + (textarea.offsetHeight - textarea.clientHeight);
      textarea.style.height = Math.min(this.maxHeight, calcHeight) + "px";
    }
  }
  else {
    textarea.style.overflow = "auto";
  }
};

TextBox.prototype.resize = function() {
  this.style.overflow = "auto";
};

TextBox.prototype.getSize = function() {
  var textarea = this.textarea;

  return { height: textarea.offsetHeight, width: textarea.offsetWidth };
};
