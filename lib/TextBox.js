'use strict';

var $ = require('jquery');


function TextBox(options) {

  this.container = options.container;
  this.textarea = $('<textarea />');

  this.keyHandler = options.keyHandler || function() {};
}

module.exports = TextBox;


TextBox.prototype.create = function(bounds, style, value) {
  var css = $.extend({
    width: bounds.width,
    height: bounds.height,
    left: bounds.x,
    top: bounds.y,
    position: 'absolute',
    textAlign: 'center'
  }, style || {});

  this.textarea
    .val(value || '')
    .appendTo(this.container)
    .css(css)
    .focus()
    .on('keydown', this.keyHandler);
};

TextBox.prototype.destroy = function() {
  this.textarea
    .remove()
    .off('keydown', this.keyHandler);
};

TextBox.prototype.getValue = function() {
  return this.textarea.val();
};