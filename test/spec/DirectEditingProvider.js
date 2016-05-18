'use strict';


function DirectEditingProvider(directEditing) {
  directEditing.registerProvider(this);
}

DirectEditingProvider.prototype.activate = function(element) {

  if (element.label) {
    return { bounds: element.labelBounds || element, text: element.label };
  }
};

DirectEditingProvider.prototype.update = function(element, text) {
  element.label = text;
};


module.exports = DirectEditingProvider;

DirectEditingProvider.$inject = ['directEditing'];