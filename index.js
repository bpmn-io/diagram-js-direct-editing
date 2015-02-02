module.exports = {
  __depends__: [ require('diagram-js/lib/features/interaction-events') ],
  __init__: [ 'directEditing' ],
  directEditing: [ 'type', require('./lib/DirectEditing') ]
};