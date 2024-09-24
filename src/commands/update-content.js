/**
 * @file The defintition of the update-content command class.
 */
import chalk from "chalk";


import StatusArchive from "../../src/lib/status-archive.js";
import ContentArchive from "../../src/lib/content-archive.js";
import TagReplacer from "../../src/lib/tag-replacer.js";

/**
 * Command to update the content uses statuses from the archive.
 */
class UpdateContent {

  allowOverwrite = false;
  debugOutput = false;
  statusTagFilter = false;
  tagReplacer = null;

  /**
   * Update the content archive.
   * @param {boolean} force Overwrite any existing content in the archive.
   * @param {boolean} debug Output configuration variables.
   * @param {string|false} statusTagFilter Only add statuses with this tag.
   */
  constructor( force = false, debug = false, statusTagFilter = false ) {

    if ( force ) {
      this.allowOverwrite = true;
    }

    if ( debug ) {
      this.debugOutput = true;
    }

    if ( statusTagFilter !== false ) {
      this.statusTagFilter = statusTagFilter;
    }

  }

  /**
   * Run the command to update the content using saved statuses.
   */
  async run() {
    console.log( chalk.bold( "Updating content archive..." ) );

    const statusArchivePath = process.env.ITA_ARCHIVE_PATH;

    if ( statusArchivePath === undefined ) {
      throw new Error( "Expected the ITA_ARCHIVE_PATH environment variable" );
    }

    const contentArchivePath = process.env.ITA_CONTENT_ARCHIVE_PATH;

    if ( contentArchivePath === undefined ) {
      throw new Error( "Expected the ITA_CONTENT_ARCHIVE_PATH environment variable" );
    }

    const tagMapYamlPath = process.env.ITA_TAG_MAP_YAML_PATH;

    if ( tagMapYamlPath !== undefined ) {
      this.tagReplacer = new TagReplacer( tagMapYamlPath );
    }

    if ( this.debugOutput ) {
      console.log( chalk.bold.underline( "\nEnvironment variables" ) );
      console.log( "Status archive path: %s", process.env.ITA_ARCHIVE_PATH );
      console.log( "Content archive path: %s", process.env.ITA_ARCHIVE_PATH );
      console.log( "Tag map YAML file path: %s", tagMapYamlPath );
      console.log( "Tag used to filter posts: %s%s", this.statusTagFilter, "\n" );
    }

    const statusArchive = new StatusArchive(
      statusArchivePath
    );

    const contentArchive = new ContentArchive(
      contentArchivePath,
      this.allowOverwrite,
      this.statusTagFilter,
      this.tagReplacer
    );

    if ( this.allowOverwrite ) {
      console.log( chalk.yellow( "Warning: Overwriting existing content" ) );
    }

    const statusCount = await statusArchive.loadContents();

    if ( statusCount === 0 ) {
      console.log( chalk.red( "Error: Status archive is empty" ) );
      process.exit( 1 );
    }

    const contentCount = await contentArchive.loadContents();

    console.log( `Number of statuses in status archive: ${ statusCount }` );

    console.log( `Number of posts in content archive: ${ contentCount }` );

    const addedContent = await contentArchive.addContent(
      statusArchive.contents,
      statusArchivePath
    );

    console.log( chalk.green( "Updated content archive" ) );
    console.log( `Number of posts added: ${ addedContent }` );
  }
}

export default UpdateContent;
