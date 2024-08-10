/**
 * @file The defintition of the lookup-user command class.
 */
import chalk from "chalk";
import { input, confirm } from "@inquirer/prompts";
import isFQDN from "validator/lib/isFQDN.js";
import matches from "validator/lib/matches.js";

import { userNameRegEx } from "../lib/fetch-user-details.js";
import FetchUserDetails from "../lib/fetch-user-details.js";

/**
 * Command to collect server and user information and fetch the user
 * object from the server.
 */
class LookupUser {

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
      validate: ( value = "" ) => matches( value, userNameRegEx ) || "Enter valid user name"
    } );

    const tableDef = [
      {
        name: "Server host",
        value: host
      },
      {
        name: "User name",
        value: userName
      }
    ];

    console.log( chalk.green( "Collected information" ) );
    console.table( tableDef );

    const useConfig = await confirm( {
      message: "Lookup user using collected information",
      default: true
    } );

    if ( useConfig !== true ) {
      return;
    }

    console.log( chalk.bold( "Looking up user..." ) );

    const fetcher = new FetchUserDetails(
      host,
      userName
    );

    const userId = await fetcher.getUserId();

    tableDef.push( {
      name: "User Id",
      value: userId
    } );

    console.log( chalk.green( "Fetched user details" ) );
    console.table( tableDef );

  }

}

export default LookupUser;
