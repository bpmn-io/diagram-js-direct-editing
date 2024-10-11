import bpmnIoPlugin from 'eslint-plugin-bpmn-io';

const buildFiles = [
  '*.js',
  '*.mjs'
];

export default [
  ...bpmnIoPlugin.configs.browser.map((config) => {
    return {
      ...config,
      ignores: buildFiles
    };
  }),
  ...bpmnIoPlugin.configs.node.map((config) => {
    return {
      ...config,
      files: buildFiles
    };
  }),
  ...bpmnIoPlugin.configs.mocha.map((config) => {
    return {
      ...config,
      files: [ 'test/**/*.js' ]
    };
  })
];