/**
 * @file The defintition of the ContentArchive class.
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import Archive from "./archive.js";
import ContentCreator from "./content-creator.js";

/**
 * Manage an archive of contents.
 */
class ContentArchive extends Archive {

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

    const contentCreator = new ContentCreator();

    await this.loadContent();

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

      const newContent = [];
      newContent.push( "---" );
      newContent.push( contentCreator.createFrontMatter( status ) );
      newContent.push( "---" );
      newContent.push( contentCreator.convertContent( status.content ) );
      newContent.push( contentCreator.makeLinkBack( status.url ) );
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

  /**
   * Get the number of content items in the archive.
   * @returns {number} The number of content items in the archive.
   */
  async getContentCount() {

    if ( this.cacheStale ) {
      await this.loadContent();
    }

    return this.contents.length;
  }

  /**
   * Get a list of contents in the archive.
   * @returns {number} The number of contents in the archive.
   */
  async loadContent() {

    if ( this.cacheStale === false ) {
      return this.contents;
    }

    this.contents = Array();

    this.contents = await readdir(
      this.archivePath
    );

    this.contents = this.contents.filter( content => path.extname( content ) === ".md" );

    this.cacheStale = false;

    return this.contents.length;
  }
}

export default ContentArchive;
