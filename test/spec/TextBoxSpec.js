'use strict';

var TextBox = require('../../lib/TextBox');


function triggerKeyEvent(element, event, code){
  var e = document.createEvent('Events');

  if(e.initEvent) {
    e.initEvent(event, true, true);
  }

  e.keyCode = code;
  return element.dispatchEvent(e);
}

var bounds = { x: 20, y: 10, width: 100, height: 30 };
var box, textarea;

describe('TextBox', function() {

  beforeEach(function(){
    var container = document.createElement('div');
    document.body.appendChild(container);

    var options = {
      container:  container
    };

    box = new TextBox(options);
    textarea = box.textarea;
  });

  afterEach(function(){
    document.body.removeChild(box.container);
    box = null;
  });


  describe('creation', function() {

    it('should create a textbox with a labeld textarea', function() {
      // given
      var label = 'hello';

      // when
      box.create(bounds, {}, label, { autosizing: true, defaultHeight: 30, maxHeight: 100 });

      // then
      expect(textarea.style.width).to.eql('100px');
      expect(textarea.style.height).to.eql('30px');
      expect(textarea.style.textAlign).to.eql('center');

      expect(textarea.autosizing).to.eql(true);
      expect(textarea.defaultHeight).to.eql(30);
      expect(textarea.maxHeight).to.eql(100);
      expect(box.getValue()).to.eql('hello');

      // if options are missing, they should be undefined
      expect(box.autosizing).to.eql(undefined);
    });

  });


  describe('autosizing textarea', function(){

    it('should increase height when adding newline and maxHeight is not reached', function() {
      // given
      var label = 'hello';
      box.create(bounds,{}, label, {autosizing: true, textAlignment: 'left', defaultHeight: 30, maxHeight: 100});

      // when
      var previousHeight = parseInt(textarea.style.height);
      textarea.value = textarea.value + '\nworld';
      triggerKeyEvent(textarea, 'keyup', 65);

      // then overflow should kept hidden and visible height increased
      expect(textarea.style.textAlign).to.eql('left');
      expect(textarea.style.overflow).to.eql('hidden');
      expect(box.getValue()).to.eql('hello\nworld');
      // comparison for equality doesn't work due to different browser-rendering
      expect(parseInt(textarea.style.height)).to.be.at.least(previousHeight + 1);
    });


    it('should decrease height when deleting one line', function() {
      // given
      var label = 'hello\nworld\nhello';
      box.create(bounds, {}, label, {autosizing: true, textAlignment: 'left', defaultHeight:30, maxHeight:100});
      triggerKeyEvent(textarea, 'keyup', 65);

      // when deleting a line
      var previousHeight = parseInt(textarea.style.height);
      textarea.value = 'hello\nworld';
      triggerKeyEvent(textarea, 'keyup', 65);

      // then height should be decreased
      expect(parseInt(textarea.style.height)).to.be.below(previousHeight-1);
      expect(box.getValue()).to.eql('hello\nworld');
    });

    //failing with phantomJS
    it.skip('should not increase height when maxHeight is reached', function(){
      // given
      box.create(bounds, {}, 'hello\nworld\nhello', {autosizing: true, textAlignment: 'left', defaultHeight: 30, maxHeight: 50 });
      triggerKeyEvent(textarea, 'keyup', 65);

      // when maxHeight is reached
      textarea.value = textarea.value + '\nworld\nhello\nhello';
      triggerKeyEvent(textarea, 'keyup', 65);

      // then overflow should be scrollabel (auto) and
      // visible the height should not increase
      expect(textarea.style.overflow).to.eql('auto');
      expect(textarea.style.height).to.eql(textarea.maxHeight + 'px');
      expect(box.getValue()).to.eql('hello\nworld\nhello\nworld\nhello\nhello');
    });


    it('if height falls from greater maxHeight below it, height will be adjusted and overflow hidden', function(){
      // given
      box.create(bounds, {}, 'hello\nworld\nhello', { autosizing: true, textAlignment: 'left', defaultHeight: 30, maxHeight: 50 });
      triggerKeyEvent(textarea, 'keyup', 65);

      // when falling back below maxHeight
      textarea.value = 'hello';
      triggerKeyEvent(textarea, 'keyup', 65);

      // then overflow should be hidden and height adjusted
      expect(textarea.style.overflow).to.eql('hidden');
      expect(parseInt(textarea.style.height)).to.be.below(textarea.maxHeight);
    });


    it('if label is deleted or changed to just a single line, textarea will be autosized to defaultHeight', function(){
      // given
      var label = 'hello\nworld\nhello\nworld';
      box.create(bounds, {}, label, {autosizing: true, textAlignment: 'left', defaultHeight:30, maxHeight: 100});

      // when label is deleted or below default height (single line)
      textarea.value = '';
      triggerKeyEvent(textarea, 'keyup', 65);

      // then textarea should have default height
      expect(textarea.style.overflow).to.eql('hidden');
      expect(textarea.style.height).to.eql(textarea.defaultHeight + 'px');
    });


    it('if manuel resize happening, overflow will be scrollabel', function(){
      // given
      var label = 'hello';
      box.create(bounds, {}, label, {autosizing: true, textAlignment:'left', defaultHeight:30, maxHeight: 100});

      // when mousedown happens for resizing
      triggerKeyEvent(textarea, 'mousedown', 1);

      // then overflow should be scrollabel
      expect(textarea.style.overflow).to.eql('auto');
    });

  });

});
