'use strict';


function DirectEditingProvider(directEditing) {
  directEditing.registerProvider(this);
}

DirectEditingProvider.prototype.activate = function(element) {

  if (element.label) {
    return { bounds: element.labelBounds || element, text: element.label };
  }
};

DirectEditingProvider.prototype.update = function(element, text, bounds) {
  element.label = text;
  element.height = bounds.height;
  element.width = bounds.width;

};


module.exports = DirectEditingProvider;

DirectEditingProvider.$inject = ['directEditing'];
