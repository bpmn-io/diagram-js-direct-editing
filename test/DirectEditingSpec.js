import {
  bootstrapDiagram,
  inject
} from 'diagram-js/test/helper';

import {
  forEach
} from 'min-dash';

import directEditingModule from '../';

import DirectEditingProvider from './DirectEditingProvider';


var DELTA = 2;


function triggerMouseEvent(element, event, clientX, clientY) {
  var e = document.createEvent('MouseEvent');

  if (e.initMouseEvent) {
    e.initMouseEvent(event, true, true, window, 0, 0, 0, clientX, clientY, false, false, false, false, 0, null);
  }

  element.dispatchEvent(e);
}

function triggerKeyEvent(element, event, code) {
  var e = document.createEvent('Events');

  if (e.initEvent) {
    e.initEvent(event, true, true);
  }

  e.keyCode = code;
  e.which = code;

  element.dispatchEvent(e);
}

function expectEditingActive(directEditing, parentBounds, contentBounds) {
  expect(directEditing.isActive()).to.eql(true);

  var parent = directEditing._textbox.parent,
      content = directEditing._textbox.content;

  expect(parent.className).to.eql('djs-direct-editing-parent');
  expect(content.className).to.eql('djs-direct-editing-content');

  forEach(parentBounds, function(val, key) {
    expect(parseInt(parent['offset' + key.charAt(0).toUpperCase() + key.slice(1)])).to.be.closeTo(val, DELTA);
  });

  if (contentBounds) {
    forEach(contentBounds, function(val, key) {
      expect(content['offset' + key.charAt(0).toUpperCase() + key.slice(1)]).to.be.closeTo(val, DELTA);
    });
  }
}


describe('diagram-js-direct-editing', function() {


  describe('bootstrap', function() {

    beforeEach(bootstrapDiagram({
      modules: [ directEditingModule ]
    }));

    it('should bootstrap diagram with component', inject(function() { }));

  });


  describe('behavior', function() {

    var providerModule = {
      __init__: [ 'directEditingProvider' ],
      __depends__: [ directEditingModule ],
      directEditingProvider: [ 'type', DirectEditingProvider ]
    };

    beforeEach(bootstrapDiagram({
      modules: [ providerModule ]
    }));

    afterEach(inject(function(directEditingProvider) {
      directEditingProvider.setOptions(undefined);
    }));


    it('should register provider', inject(function(directEditing) {
      expect(directEditing._providers[0] instanceof DirectEditingProvider).to.eql(true);
    }));


    describe('controlled by provider', function() {

      it('should activate', inject(function(canvas, directEditing) {

        // given
        var shapeWithLabel = {
          id: 's1',
          x: 20, y: 10, width: 60, height: 50,
          label: 'FOO\nBAR'
        };
        canvas.addShape(shapeWithLabel);

        // when
        var activated = directEditing.activate(shapeWithLabel);

        // then
        expect(activated).to.eql(true);
        expect(directEditing.getValue()).to.eql('FOO\nBAR');

        var parentBounds = {
          left: 20,
          top: 10,
          width: 60,
          height: 50
        };

        var contentBounds = {
          top: 0,
          left: 0,
          width: 60,
          height: 38
        };

        // textbox is correctly positioned
        expectEditingActive(directEditing, parentBounds, contentBounds);
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

        var parentBounds = { left: 100, top: 100, width: 50, height: 20 },
            contentBounds = { left: 0, top: 0, width: 50, height: 18 };

        // textbox is correctly positioned
        expectEditingActive(directEditing, parentBounds, contentBounds);
      }));


      it('should activate with vertically centered text', inject(function(canvas, directEditing, directEditingProvider) {

        // given
        var shapeWithLabel = {
          id: 's1',
          x: 20, y: 10, width: 60, height: 50,
          label: 'FOO'
        };
        canvas.addShape(shapeWithLabel);

        directEditingProvider.setOptions({ centerVertically: true });

        // when
        var activated = directEditing.activate(shapeWithLabel);

        // then
        expect(activated).to.eql(true);
        expect(directEditing.getValue()).to.eql('FOO');

        var parentBounds = { left: 20, top: 10, width: 60, height: 50 },
            contentBounds = { left: 0, top: 25, width: 60, height: 18 };

        // textbox is correctly positioned
        expectEditingActive(directEditing, parentBounds, contentBounds);
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
        expect(directEditing._textbox.parent.parentNode).not.to.exist;
      }));


      it('should cancel via ESC', inject(function(canvas, directEditing) {

        // given
        var shapeWithLabel = {
          id: 's1',
          x: 20, y: 10, width: 60, height: 50,
          label: 'FOO'
        };
        canvas.addShape(shapeWithLabel);

        var textbox = directEditing._textbox;

        directEditing.activate(shapeWithLabel);

        // when pressing ESC
        triggerKeyEvent(textbox.content, 'keydown', 27);

        // then
        expect(directEditing.isActive()).to.eql(false);

        // textbox container is detached (invisible)
        expect(textbox.parent.parentNode).not.to.exist;
      }));


      it('should complete + update label via ENTER', inject(function(canvas, directEditing) {

        // given
        var shapeWithLabel = {
          id: 's1',
          x: 20, y: 10, width: 60, height: 50,
          label: 'FOO'
        };
        canvas.addShape(shapeWithLabel);

        var textbox = directEditing._textbox;

        directEditing.activate(shapeWithLabel);

        textbox.content.innerText = 'BAR';

        // when pressing Enter
        triggerKeyEvent(textbox.content, 'keydown', 13);

        // then
        expect(directEditing.isActive()).to.eql(false);

        // textbox is detached (invisible)
        expect(textbox.parent.parentNode).not.to.exist;

        expect(shapeWithLabel.label).to.eql('BAR');
      }));

      it('should return the correct bounds', inject(function(canvas, directEditing) {
        const shapeWithLabel = {
          id: 's1',
          x: 20, y: 10, width: 60, height: 50,
          label: 'FOO',
          labelBounds: { x: 100, y: 200, width: 50, height: 20 }
        };
        canvas.addShape(shapeWithLabel);

        var textbox = directEditing._textbox;

        directEditing.activate(shapeWithLabel);

        textbox.content.innerText = 'BAR';

        directEditing.complete();

        const bounds = shapeWithLabel.returnedBounds;
        expect(shapeWithLabel.labelBounds.x).to.eql(bounds.x);
        expect(shapeWithLabel.labelBounds.y).to.eql(bounds.y);
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
        expect(directEditing._textbox.content.innerText).to.eql('FOO');

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
        expect(directEditing._textbox.content.innerText).to.eql('');
      }));


      it('should trim label when getting value', inject(function(canvas, directEditing) {
        // given
        var shape = {
          id: 's1',
          x: 20, y: 10, width: 60, height: 50,
          label: '\nFOO\n'
        };
        canvas.addShape(shape);

        // when
        directEditing.activate(shape);

        // then
        expect(directEditing.getValue()).to.eql('FOO');
      }));


      it('should show resize handle if resizable', inject(function(canvas, directEditing, directEditingProvider) {

        // given
        var shape = {
          id: 's1',
          x: 20, y: 10, width: 60, height: 50,
          label: 'FOO'
        };
        canvas.addShape(shape);

        directEditingProvider.setOptions({ resizable: true });

        // when
        directEditing.activate(shape);

        // then
        var resizeHandle = directEditing._textbox.parent.getElementsByClassName('djs-direct-editing-resize-handle')[0];

        expect(resizeHandle).to.exist;
      }));


      it('should not show resize handle if not resizable', inject(function(canvas, directEditing) {

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
        var resizeHandle = directEditing._textbox.parent.getElementsByClassName('djs-direct-editing-resize-handle')[0];

        expect(resizeHandle).not.to.exist;
      }));


      it('should resize automatically', inject(function(canvas, directEditing, directEditingProvider) {

        // given
        var shape = {
          id: 's1',
          x: 20, y: 10, width: 60, height: 50,
          label: 'FOO\nBAR\nBAZ\nFOO\nBAR\nBAZ'
        };
        canvas.addShape(shape);

        directEditingProvider.setOptions({ autoResize: true });

        directEditing.activate(shape);

        var parent = directEditing._textbox.parent,
            content = directEditing._textbox.content;

        // when
        triggerKeyEvent(directEditing._textbox.content, 'input', 65);

        // then
        var parentHeight = parent.getBoundingClientRect().height,
            contentScrollHeight = content.scrollHeight;

        expect(parentHeight).to.be.closeTo(contentScrollHeight, DELTA);
      }));


      it('should resize on resize handle drag', inject(function(canvas, directEditing, directEditingProvider) {

        // given
        var shape = {
          id: 's1',
          x: 20, y: 10, width: 60, height: 50,
          label: 'FOO'
        };
        canvas.addShape(shape);

        directEditingProvider.setOptions({ resizable: true });

        directEditing.activate(shape);

        var parent = directEditing._textbox.parent,
            resizeHandle = directEditing._textbox.resizeHandle;

        // when
        var oldParentBounds = parent.getBoundingClientRect(),
            resizeHandleBounds = resizeHandle.getBoundingClientRect();

        var clientX = resizeHandleBounds.left + resizeHandleBounds.width / 2,
            clientY = resizeHandleBounds.top + resizeHandleBounds.height / 2;

        triggerMouseEvent(resizeHandle, 'mousedown', clientX, clientY);
        triggerMouseEvent(resizeHandle, 'mousemove', clientX + 100, clientY + 100);
        triggerMouseEvent(resizeHandle, 'mouseup', clientX + 100, clientY + 100);

        // then
        var newParentBounds = parent.getBoundingClientRect();

        expect(newParentBounds.width).to.be.closeTo(oldParentBounds.width + 100, DELTA);
        expect(newParentBounds.height).to.be.closeTo(oldParentBounds.height + 100, DELTA);
      }));

    });

  });

});
