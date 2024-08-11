import globals from "globals";
import pluginJs from "@eslint/js";
import jsdoc from "eslint-plugin-jsdoc";
import { default as jqueryConfig } from "eslint-config-jquery";

const ignoresConfig = {
  ignores: [
    "bin/index.js"
  ]
};

const filesConfig = {

  //files: [
  //      "src/**/*.js"
  //      ]

};

const jsdocConfig = [
  jsdoc.configs[ "flat/recommended" ],
  {
    plugins: {
      jsdoc
    },
    files: [
      "src/**/*.js"
    ],
    ignores: [
      "test/**/*.js"
    ],
    rules: {
      "jsdoc/informative-docs": "warn",
      "jsdoc/no-blank-blocks": "warn",
      "jsdoc/require-description-complete-sentence": "warn",
      "jsdoc/require-jsdoc": [
        "error",
        {
          "require": {
            "ClassDeclaration": true,
            "MethodDefinition": true
          }
        }
      ],
      "jsdoc/require-file-overview": "warn"
    }
  }
];

const globalsConfig = {
  languageOptions: {
    globals: globals.nodeBuiltin
  }
};

const rulesConfig = {
  rules: {
    "indent": [
      "error",
      2
    ],
    "linebreak-style": [
      "error",
      "unix"
    ]
  }
};

const config = [
  ignoresConfig,
  filesConfig,
  rulesConfig,
  globalsConfig,
  pluginJs.configs.recommended,
  jqueryConfig,
  ...jsdocConfig
];

export default config;
