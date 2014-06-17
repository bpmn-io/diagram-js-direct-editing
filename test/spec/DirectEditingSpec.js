'use strict';

var TestHelper = require('diagram-js/test/TestHelper');

/* global bootstrapDiagram, inject */


var _ = require('lodash'),
    $ = require('jquery');

var directEditingModule = require('../../');


function expectEditingActive(directEditing, bounds) {
  expect(directEditing.isActive()).toBe(true);

  var textarea = directEditing._textbox.textarea;

  _.forEach(bounds, function(val, key) {
    expect(textarea.css(key)).toBe(val + 'px');
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
      expect(directEditing._providers[0] instanceof DirectEditingProvider).toBe(true);
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
        expect(activated).toBe(true);
        expect(directEditing.getValue()).toBe('FOO');

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
        expect(activated).toBe(true);

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
        expect(activated).toBe(false);
        expect(directEditing.isActive()).toBe(false);
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
        expect(directEditing.isActive()).toBe(false);

        // textbox is detached (invisible)
        expect(directEditing._textbox.textarea.parent().length).toBe(0);
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
        $(textarea).trigger($.Event('keydown', { which: 27 }));

        // then
        expect(directEditing.isActive()).toBe(false);

        // textbox is detached (invisible)
        expect(textarea.parent().length).toBe(0);
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

        // when pressing Enter
        $(textarea).val('BAR').trigger($.Event('keydown', { which: 13 }));

        // then
        expect(directEditing.isActive()).toBe(false);

        // textbox is detached (invisible)
        expect(directEditing._textbox.textarea.parent().length).toBe(0);

        expect(shapeWithLabel.label).toBe('BAR');
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
        expect(directEditing._textbox.textarea.val()).toBe('FOO');

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
        expect(directEditing._textbox.textarea.val()).toBe('');
      }));

    });

  });

});