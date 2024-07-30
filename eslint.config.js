import globals from "globals";
import pluginJs from "@eslint/js";
import jsdoc from "eslint-plugin-jsdoc";
import { default as jquery } from "eslint-config-jquery";


export default [
  {
    ignores: [
      "bin/*.js"
    ]
  },
  pluginJs.configs.recommended,
  jsdoc.configs[ "flat/recommended" ],
  jquery,
  {
    languageOptions: {
      globals: globals.nodeBuiltin
    },
    files: [
      "src/**/*.js"
    ],
    rules:
    {
      indent: [
        "error",
        2
      ],
      "linebreak-style": [
        "error",
        "unix"
      ],
      "jsdoc/check-indentation": [
        "warn"
      ],
      "jsdoc/check-line-alignment": [
        "warn"
      ],
      "jsdoc/require-description": [
        "warn"
      ],
      "jsdoc/require-description-complete-sentence": [
        "warn"
      ],
      "jsdoc/require-file-overview": [
        "warn"
      ],
      "jsdoc/require-throws": [
        "warn"
      ]
    }
  }
];
