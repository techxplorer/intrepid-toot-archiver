/**
 * @file The defintition of the lookup-user command class.
 */

import chalk from "chalk";
import { input, confirm } from "@inquirer/prompts";
import isFQDN from "validator/lib/isFQDN.js";
import matches from "validator/lib/matches.js";

/**
 * Make available various properties from the package.json file, and
 * provide simple methods to explore unit testing.
 */
export default class LookupUser {

  /**
   * Run the command to lookup user details.
   */
  async run() {

    console.log( chalk.bold( "Collecting required info..." ) );

    const host = await input( {
      message: "Enter the domain name of the host",
      required: true,
      validate: ( value = "" ) => isFQDN( value ) || "Enter valid domain name"

    } );

    const userName = await input( {
      message: "Enter the user name",
      required: true,
      validate: ( value = "" ) => matches( value, /^@?([A-Z0-9._%+-]+)/gmi ) || "Enter valid user name"
    } );

    console.log( chalk.green( "Collected information" ) );
    console.table( [
      {
        name: "Server host",
        value: host
      },
      {
        name: "User name",
        value: userName
      }
    ] );

    const useConfig = await confirm( {
      message: "Lookup user using collected information",
      default: true
    } );

    if ( useConfig !== true ) {
      return;
    }

    console.log( chalk.bold( "Looking up user..." ) );

  }

}
