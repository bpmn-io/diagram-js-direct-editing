'use strict';

/**
 * Direct editing provider, to be registered with
 * {@link DirectEditing#registerProvider(...)}.
 */
function DirectEditingProvider() {

  /**
   * Return an activation context = { bounds: { x, y, width, height }, text }
   * if direct editing should be active on the element.
   *
   * @param {djs.model.Base} element
   *
   * @return {ActivationContext}
   */
  this.activate = function(element) {
    return {
      bounds: null, // getBounds(element),
      text: 'foo'
    };
  };

  /**
   * Update the elements text once the user triggers direct
   * editing completion.
   *
   * @param {djs.model.Base} element
   * @param {String} text
   *
   * @return {Boolean} false, if editing box should remain open
   */
  this.update = function(element, text) {
    // handle editing completion
  };

}

module.exports = DirectEditingProvider;