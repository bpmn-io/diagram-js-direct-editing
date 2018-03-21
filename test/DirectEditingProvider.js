'use strict';

var assign = require('min-dash').assign;


function DirectEditingProvider(directEditing) {
  directEditing.registerProvider(this);
}

DirectEditingProvider.prototype.activate = function(element) {
  var context = {};

  if (element.label) {
    assign(context, {
      bounds: element.labelBounds || element,
      text: element.label
    });

    assign(context, {
      options: this.options || {}
    });

    return context;
  }
};

DirectEditingProvider.prototype.update = function(element, text) {
  element.label = text;
};

DirectEditingProvider.prototype.setOptions = function(options) {
  this.options = options;
};

DirectEditingProvider.$inject = [ 'directEditing' ];

module.exports = DirectEditingProvider;