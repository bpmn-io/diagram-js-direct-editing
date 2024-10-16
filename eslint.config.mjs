import bpmnIoPlugin from 'eslint-plugin-bpmn-io';

const files = {
  build: [
    '*.js',
    '*.mjs'
  ],
  test: [
    'test/**/*.js'
  ]
};

export default [

  // build
  ...bpmnIoPlugin.configs.node.map((config) => {
    return {
      ...config,
      files: files.build
    };
  }),

  // lib + test
  ...bpmnIoPlugin.configs.browser.map((config) => {
    return {
      ...config,
      ignores: files.build
    };
  }),

  // test
  ...bpmnIoPlugin.configs.mocha.map((config) => {
    return {
      ...config,
      files: files.test
    };
  })
];