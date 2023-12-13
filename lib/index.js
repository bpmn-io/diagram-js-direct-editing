import InteractionEventsModule from 'diagram-js/lib/features/interaction-events';

import DirectEditing from './DirectEditing.js';

export default {
  __depends__: [
    InteractionEventsModule
  ],
  __init__: [ 'directEditing' ],
  directEditing: [ 'type', DirectEditing ]
};