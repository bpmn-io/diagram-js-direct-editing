import Diagram from 'diagram-js/lib/Diagram.js';

import EventBus from 'diagram-js/lib/core/EventBus.js';

import { Element } from 'diagram-js/lib/model/Types.js';

import { Rect } from 'diagram-js/lib/util/Types.js';

import DirectEditingModule from './index.js';

import DirectEditing, {
  DirectEditingContext,
  DirectEditingProvider
} from './DirectEditing.js';


class LabelEditingProvider implements DirectEditingProvider {

  static $inject = [ 'eventBus', 'directEditing' ];

  constructor(eventBus: EventBus, directEditing: DirectEditing) {

    directEditing.registerProvider(this);

    eventBus.on('element.dblclick', (event: { element: Element }) => {
      directEditing.activate(event.element);
    });

    eventBus.on('selection.changed', () => {
      if (directEditing.isActive()) {
        directEditing.complete();
      }
    });

    eventBus.on('shape.remove', (event: { element: Element }) => {
      if (directEditing.isActive(event.element)) {
        directEditing.cancel();
      }
    });
  }

  activate(element: Element): DirectEditingContext | undefined {

    if (!element.businessObject) {
      return;
    }

    return {
      bounds: {
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height,
        minWidth: 90,
        minHeight: 30
      },
      text: element.businessObject.name,
      style: {
        backgroundColor: null,
        border: null,
        transform: null,
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        lineHeight: 1.2,
        paddingTop: '7px'
      },
      options: {
        autoResize: true,
        centerVertically: true,
        resizable: true
      }
    };
  }

  update(element: Element, newText: string, previousText: string, bounds: Rect) {
    element.businessObject.name = newText;

    Object.assign(element, bounds);
  }
}

const diagram = new Diagram({
  modules: [
    DirectEditingModule,
    {
      __init__: [ 'labelEditingProvider' ],
      labelEditingProvider: [ 'type', LabelEditingProvider ]
    }
  ]
});

const directEditing = diagram.get<DirectEditing>('directEditing');

const element = { id: 'Task_1', businessObject: { name: 'Task' } } as unknown as Element;

// provider defined inline
directEditing.registerProvider({
  activate: (element) => element.id === 'Label_1' ? {
    bounds: { x: 0, y: 0 },
    text: 'Label'
  } : null,
  update: (element, newText) => {
    element.businessObject.name = newText;
  }
});

if (directEditing.activate(element)) {
  const active: boolean = directEditing.isActive(element);

  const text: string = directEditing.getValue();

  console.log(active, text);

  directEditing.complete();
}

directEditing.cancel();

// provider must implement #update
// @ts-expect-error
directEditing.registerProvider({
  activate: () => null
});

// context must provide bounds
directEditing.registerProvider({
  // @ts-expect-error
  activate: () => ({ text: 'Label' }),
  update: () => {}
});

// @ts-expect-error
directEditing.activate('Task_1');
