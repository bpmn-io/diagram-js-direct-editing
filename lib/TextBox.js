'use strict';

var $ = require('jquery');


function TextBox(options) {

  this.container = options.container;
  this.keyHandler = options.keyHandler || function() {};

  this.textarea = $('<textarea />');
}

module.exports = TextBox;


TextBox.prototype.create = function(bounds, value) {
  this.textarea.val(value || '').appendTo(this.container).css({
    width: bounds.width,
    height: bounds.height,
    left: bounds.x,
    top: bounds.y
  });

  if (this.keyHandler) {
    $(document).on('keyup', this.keyHandler);
  }
};

TextBox.prototype.destroy = function() {
  this.textarea.remove();

  if (this.keyHandler) {
    $(document).off('keyup', this.keyHandler);
  }
};

TextBox.prototype.getValue = function() {
  return this.textarea.val();
};