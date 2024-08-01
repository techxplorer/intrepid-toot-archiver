#!/usr/bin/env node

import { Command } from 'commander';
import prettyMS from "pretty-ms";

import PackageUtils from "../src/utils/package-utils.js";

const startTime = process.hrtime.bigint();

async function run() {

  // Setup the program
  const program = new Command();
  const appPackage = new PackageUtils();
  program
    .version( appPackage.getVersion() )
    .description( appPackage.getDescription() )
    .showHelpAfterError( "(add --help for additional information)" )
    .addHelpText(
      'after',
      `\nMore info: ${ appPackage.getHomepage() }\nVersion: ${ appPackage.getVersion() }`
    )

  // Parse the command line parameters.
  await program.parseAsync( process.argv );

  const endTime = process.hrtime.bigint();
  const totalTime = Number( endTime - startTime ) * 1e-6;

  console.log( "Elapsed time:", prettyMS( totalTime ) );
}

run();
