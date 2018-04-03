import {
  assign
} from 'min-dash';


export default function DirectEditingProvider(directEditing) {
  directEditing.registerProvider(this);
}

DirectEditingProvider.$inject = [ 'directEditing' ];

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
