#!/usr/bin/env node
/* eslint-disable jsdoc/require-jsdoc */
import path from "node:path";

import { Command } from "commander";
import dotenv from "dotenv";
import prettyMS from "pretty-ms";

import LookupUser from "../src/commands/lookup-user.js";
import PackageUtils from "../src/utils/package-utils.js";
import UpdateArchive from "../src/commands/update-archive.js";

const startTime = process.hrtime.bigint();

async function run() {

  // Load in the environment variables.
  const result = dotenv.config(
    {
      path: path.resolve(
        path.resolve(
          import.meta.dirname,
          "../.env"
        )
      )
    }
  );

  if ( result.error ) {
    throw result.error;
  }

  // Setup the program.
  const program = new Command();
  const appPackage = new PackageUtils();
  program
    .version( appPackage.getVersion() )
    .description( appPackage.getDescription() )
    .showHelpAfterError( "(add --help for additional information)" )
    .addHelpText(
      "after",
      `\nMore info: ${ appPackage.getHomepage() }\nVersion: ${ appPackage.getVersion() }`
    );

  // Add the lookup user command.
  program.command( "lookup-user" )
    .description( "Lookup user details on a Mastodon host" )
    .action( async() => {
      const lookupUser = new LookupUser();
      await lookupUser.run();
    } );

  // Add the update-archive command.
  program.command( "update-archive" )
    .description( "Download new statuses and update the archive" )
    .action( async() => {
      const updateArchive = new UpdateArchive();
      await updateArchive.run();
    } );

  // Parse the command line parameters.
  await program.parseAsync( process.argv );

  const endTime = process.hrtime.bigint();
  const totalTime = Number( endTime - startTime ) * 1e-6;

  console.log( "\nElapsed time:", prettyMS( totalTime ) );
}

run();
