/**
 * @file The defintition of the ContentArchive class.
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import Archive from "./archive.js";
import ContentCreator from "./content-creator.js";

/**
 * Manage an archive of text content.
 */
class ContentArchive extends Archive {

  /**
   * Instance of the ContentCreator class to create content from the status.
   * @type {ContentCreator}
   */
  contentCreator = null;

  /**
   * Manage the Content Archive.
   * @param {string} archivePath The path to the content archive directory.
   * @param {boolean} overwriteFlag Flag indicating if files should be overwritten.
   * @param {string} statusFilter An optional tag used to filter the list of statuses.
   * @throws {TypeError} When the parameters are incorrect.
   */
  constructor( archivePath, overwriteFlag = false, statusFilter = false ) {
    super( archivePath, overwriteFlag, statusFilter );
    this.fileExtension = ".md";
    this.contentCreator = new ContentCreator();
  }

  /**
   * Add any missing contents to the archive.
   * @param {Array} newStatuses A list of potential new status file names.
   * @param {string} statusArchivePath The path to the status archive.
   * @returns {number} The amount of content added to the archive.
   * @throws {TypeError} When the parameters are incorrect.
   */
  async addContent( newStatuses, statusArchivePath ) {

    if ( !Array.isArray( newStatuses ) ) {
      throw new TypeError( "New statuses must be an array" );
    }

    if ( typeof statusArchivePath !== "string" ) {
      throw new TypeError( "The statusArchivePath parameter must be a string" );
    }

    await this.loadContents();

    let addedcontents = 0;

    for ( const statusFile of newStatuses ) {
      const fileName = path.basename( statusFile, ".json" ) + ".md";

      if ( this.writeFileOptions.flag === "wx" && this.contents.indexOf( fileName ) > -1 ) {
        continue;
      }

      const filePath = path.join(
        this.archivePath,
        fileName
      );

      const statusContent = await readFile(
        path.join(
          statusArchivePath,
          statusFile
        )
      );

      const status = JSON.parse(
        statusContent.toString()
      );

      if ( this.statusFilter !== false ) {
        if ( this.statusHasTag( status, this.statusFilter ) === false ) {
          continue;
        }
      }

      const newContent = [];
      newContent.push( "---" );
      newContent.push( this.contentCreator.makeFrontMatter( status ) );
      newContent.push( "---" );
      newContent.push( this.contentCreator.convertContent( status.content ) );
      newContent.push( this.contentCreator.makeLinkBack( status.url ) );
      newContent.push( "" );

      await writeFile(
        filePath,
        newContent.join( "\n" ),
        this.writeFileOptions
      );

      addedcontents++;

    }

    this.cacheStale = true;

    return addedcontents;

  }
}

export default ContentArchive;
