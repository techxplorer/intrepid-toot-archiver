/**
 * @file The defintition of the TagReplacer class.
 */

import { lstatSync, readFileSync } from "node:fs";

import { parse } from "yaml";

/**
 * Replace a list of known tags with alternates.
 */
class TagReplacer {

  /**
   * The path to the YAML file that contains the tag mapping list.
   * @type {string}
   */
  yamlFilePath = null;

  /**
   * The tag map list.
   * @type {object}
   */
  tagMappings = null;


  /**
   * A class to automate the replacement of known tags with alternatives.
   * @param {string} yamlFilePath The path to a YAML file with the mapping list.
   */
  constructor( yamlFilePath ) {

    let syncStatus = null;

    try {
      syncStatus = lstatSync( yamlFilePath );
    // eslint-disable-next-line no-unused-vars
    } catch ( err ) {
      throw new TypeError( "YAML file not found" );

    }

    if ( !syncStatus.isFile() ) {
      throw new TypeError( "Path must be to a file" );
    }

    this.yamlFilePath = yamlFilePath;

  }

  /**
   * Load the tag mapping list from the YAML file.
   */
  loadMappingList() {

    if ( this.tagMappings !== null ) {
      return;
    }

    const yamlContent = readFileSync( this.yamlFilePath, "utf8" );

    this.tagMappings = parse( yamlContent );

  }

  /**
   * Count the number of keys in the mapping list.
   * @returns {number} The number of keys in the mapping list.
   */
  getMappingCount() {

    this.loadMappingList();

    return Object.keys( this.tagMappings ).length;
  }

  /**
   * Find matching tags and replace them with new tags from the mapping list.
   * @param {Array} originalTags An array containing a list of tags.
   * @returns {Array} A list of tags with matching ones replaced.
   */
  replaceTags( originalTags ) {

    if ( !Array.isArray( originalTags ) ) {
      throw new TypeError( "originalTags parameter must be an array" );
    }

    this.loadMappingList();

    const newTags = [];
    const keys = Object.keys( this.tagMappings );

    for ( const tag of originalTags ) {
      if ( keys.indexOf( tag ) !== -1 ) {
        if ( this.tagMappings[ tag ] !== null ) {
          newTags.push(
            this.tagMappings[ tag ]
          );
        } else {
          continue;
        }
      } else {
        newTags.push( tag );
      }
    }

    return newTags;

  }

}

export default TagReplacer;
