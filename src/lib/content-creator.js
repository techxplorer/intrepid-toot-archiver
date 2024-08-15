/**
 * @file The defintition of the ContentCreator class.
 */
import TurndownService from "turndown";
import YAML from "yaml";

/**
 * Create content from the statuses in the archive.
 */
class ContentCreator {

  /**
   * An instance of the TurndownService to convert HTML to markdown.
   * @type {TurndownService}
   */
  turndownService = null;

  /**
   * Construct a new ContentCreator and initialise dependencies.
   */
  constructor() {

    this.turndownService = new TurndownService();

  }

  /**
   * Convert the HTML version of the content to Markdown.
   * @param {string} htmlContent The html content to convert.
   * @returns {string} The content converted into Markdown.
   * @throws {TypeError} If the htmlContent not a string, or an empty string.
   */
  convertContent( htmlContent ) {

    if ( typeof htmlContent !== "string" ) {
      throw new TypeError( "The htmlContent parameter must be a string." );
    }

    if ( htmlContent.length === 0 ) {
      throw new TypeError( "The htmlContent parameter cannot be a zero length string." );
    }

    // replace any trailing spaces on each line.
    return this.turndownService.turndown( htmlContent ).replace( /[^\S\r\n]+$/gm, "" );

  }

  /**
   * Create the front matter as a YAML string.
   * @param {object} status The status object representing the content.
   * @returns {string} The front matter as a YAML string.
   * @throws {TypeError} If the status object doesn't contain the expected property.
   */
  createFrontMatter( status ) {

    const frontMatter = {};

    if ( typeof status !== "object" ) {
      throw new TypeError( "The status parameter must be an object" );
    }

    if ( status.created_at === undefined ) {
      this.throwError( "created_at" );
    }

    if ( status.url === undefined ) {
      this.throwError( "url" );
    }

    frontMatter.date = status.created_at;

    frontMatter.title = "Archived toot";

    frontMatter.description = "An archived toot";

    frontMatter.toot_url = status.url;

    frontMatter.categories = [];

    frontMatter.tags = [];

    return YAML.stringify( frontMatter );

  }

  /**
   * Make it easy to throw a consistent error message.
   * @param {string} propertyName The name of the property that wasn't found.
   */
  throwError( propertyName ) {
    throw new TypeError(
      `Unable to get ${ propertyName } from the status object`
    );
  }

}

export default ContentCreator;
