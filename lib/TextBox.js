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
    textAlign: 'center',
    boxSizing: 'border-box'
  }, style || {});

  this.textarea
    .val(value || '')
    .appendTo(this.container)
    .css(css)
    .attr('title', 'Press SHIFT+Enter for line feed')
    .focus()
    .select()
    .on('keydown', this.keyHandler);
};

TextBox.prototype.destroy = function() {
  this.textarea
    .val('')
    .remove()
    .off('keydown', this.keyHandler);
};

TextBox.prototype.getValue = function() {
  return this.textarea.val();
};