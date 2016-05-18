'use strict';

require('diagram-js/test/TestHelper');

/* global bootstrapDiagram, inject */


var forEach = require('lodash/collection/forEach');

var directEditingModule = require('../../');


function triggerKeyEvent(element, event, code) {
  var e = document.createEvent('Events');

  if (e.initEvent) {
    e.initEvent(event, true, true);
  }

  e.keyCode = code;
  e.which = code;

  return element.dispatchEvent(e);
}

function expectEditingActive(directEditing, bounds) {
  expect(directEditing.isActive()).to.eql(true);

  var textarea = directEditing._textbox.textarea;

  forEach(bounds, function(val, key) {
    expect(textarea.style[key]).to.eql(val + 'px');
  });
}


describe('diagram-js-direct-editing', function() {


  describe('bootstrap', function() {

    beforeEach(bootstrapDiagram({ modules: [ directEditingModule ] }));

    it('should bootstrap diagram with component', inject(function() { }));

  });


  describe('behavior', function() {

    var DirectEditingProvider = require('./DirectEditingProvider');

    var providerModule = {
      __init__: [ 'directEditingProvider' ],
      __depends__: [ directEditingModule ],
      directEditingProvider: [ 'type', DirectEditingProvider ]
    };

    beforeEach(bootstrapDiagram({ modules: [ providerModule ] }));


    it('should register provider', inject(function(directEditing) {
      expect(directEditing._providers[0] instanceof DirectEditingProvider).to.eql(true);
    }));


    describe('controlled by provider', function() {

      it('should activate', inject(function(canvas, directEditing) {

        // given
        var shapeWithLabel = {
          id: 's1',
          x: 20, y: 10, width: 60, height: 50,
          label: 'FOO'
        };
        canvas.addShape(shapeWithLabel);

        // when
        var activated = directEditing.activate(shapeWithLabel);

        // then
        expect(activated).to.eql(true);
        expect(directEditing.getValue()).to.eql('FOO');

        // textbox is correctly positioned
        expectEditingActive(directEditing, { left: 20, top: 10, width: 60, height: 50 });
      }));


      it('should activate with custom bounds', inject(function(canvas, directEditing) {

        // given
        var shapeWithLabel = {
          id: 's1',
          x: 20, y: 10, width: 60, height: 50,
          label: 'FOO',
          labelBounds: { x: 100, y: 100, width: 50, height: 20 }
        };
        canvas.addShape(shapeWithLabel);

        // when
        var activated = directEditing.activate(shapeWithLabel);

        // then
        expect(activated).to.eql(true);

        // textbox is correctly positioned
        expectEditingActive(directEditing, { left: 100, top: 100, width: 50, height: 20 });
      }));


      it('should NOT activate', inject(function(canvas, directEditing) {

        // given
        var shapeNoLabel = {
          id: 's1',
          x: 20, y: 10, width: 60, height: 50
        };
        canvas.addShape(shapeNoLabel);

        // when
        var activated = directEditing.activate(shapeNoLabel);

        // then
        expect(activated).to.eql(false);
        expect(directEditing.isActive()).to.eql(false);
      }));


      it('should cancel', inject(function(canvas, directEditing) {

        // given
        var shapeWithLabel = {
          id: 's1',
          x: 20, y: 10, width: 60, height: 50,
          label: 'FOO'
        };
        canvas.addShape(shapeWithLabel);

        directEditing.activate(shapeWithLabel);


        // when
        directEditing.cancel();

        // then
        expect(directEditing.isActive()).to.eql(false);

        // textbox is detached (invisible)
        expect(directEditing._textbox.textarea.parentNode).not.to.exist;
      }));


      it('should cancel via ESC', inject(function(canvas, directEditing) {

        // given
        var shapeWithLabel = {
          id: 's1',
          x: 20, y: 10, width: 60, height: 50,
          label: 'FOO'
        };
        canvas.addShape(shapeWithLabel);

        var textarea = directEditing._textbox.textarea;

        directEditing.activate(shapeWithLabel);

        // when pressing ESC
        triggerKeyEvent(textarea, 'keydown', 27);

        // then
        expect(directEditing.isActive()).to.eql(false);

        // textbox is detached (invisible)
        expect(textarea.parentNode).not.to.exist;
      }));


      it('should complete + update label via ENTER', inject(function(canvas, directEditing) {

        // given
        var shapeWithLabel = {
          id: 's1',
          x: 20, y: 10, width: 60, height: 50,
          label: 'FOO'
        };
        canvas.addShape(shapeWithLabel);

        var textarea = directEditing._textbox.textarea;

        directEditing.activate(shapeWithLabel);

        textarea.value = 'BAR';

        // when pressing Enter
        triggerKeyEvent(textarea, 'keydown', 13);

        // then
        expect(directEditing.isActive()).to.eql(false);

        // textbox is detached (invisible)
        expect(directEditing._textbox.textarea.parentNode).not.to.exist;

        expect(shapeWithLabel.label).to.eql('BAR');
      }));

    });


    describe('textbox', function() {

      it('should init label on open', inject(function(canvas, directEditing) {

        // given
        var shape = {
          id: 's1',
          x: 20, y: 10, width: 60, height: 50,
          label: 'FOO'
        };
        canvas.addShape(shape);

        // when
        directEditing.activate(shape);

        // then
        expect(directEditing._textbox.textarea.value).to.eql('FOO');

      }));


      it('should clear label after close', inject(function(canvas, directEditing) {

        // given
        var shape = {
          id: 's1',
          x: 20, y: 10, width: 60, height: 50,
          label: 'FOO'
        };
        canvas.addShape(shape);

        // when
        directEditing.activate(shape);
        directEditing.cancel();

        // then
        expect(directEditing._textbox.textarea.value).to.eql('');
      }));

    });

  });

});