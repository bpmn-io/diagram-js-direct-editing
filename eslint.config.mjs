import bpmnIoPlugin from 'eslint-plugin-bpmn-io';

export default [
  ...bpmnIoPlugin.configs.browser.map((config) => {
    return {
      ...config,
      files: [ 'lib/**/*.js' ]
    };
  }),
  ...bpmnIoPlugin.configs.node.map((config) => {
    return {
      ...config,
      files: [ '*.js', '*.mjs', 'test/suite.js' ]
    };
  }),
  ...bpmnIoPlugin.configs.mocha.map((config) => {
    return {
      ...config,
      files: [ 'test/**/*.js' ]
    };
  })
];