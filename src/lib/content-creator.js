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
   * The maximum number of words to have in a title.
   * @type {number}
   */
  maxTitleLen = 10;

  /**
   * An instance of the Intl.Segmenter used to make titles.
   * @type {Intl.Segmeter}
   */
  titleSegmenter = null;

  /**
   * The maximum number of sentences to have in a description.
   * @type {number}
   */
  maxDescrLen = 2;

  /**
   * An instance of the Intl.Segmenter used to make descriptions.
   * @type {Intl.Segmeter}
   */
  descriptionSegmenter = null;

  /**
   * Construct a new ContentCreator and initialise dependencies.
   */
  constructor() {

    this.turndownService = new TurndownService();

    this.titleSegmenter = new Intl.Segmenter(
      "en-au",
      {
        granularity: "word"
      }
    );

    this.descriptionSegmenter = new Intl.Segmenter(
      "en-au",
      {
        granularity: "sentence"
      }
    );

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
   * @param {Array} categories A list of default categories.
   * @returns {string} The front matter as a YAML string.
   * @throws {TypeError} If the status object doesn't contain the expected property.
   */
  makeFrontMatter( status, categories = [] ) {

    const frontMatter = {};

    if ( !Array.isArray( categories ) ) {
      throw new TypeError( "The categories parameter must be an array" );
    }

    if ( typeof status !== "object" ) {
      throw new TypeError( "The status parameter must be an object" );
    }

    if ( status.created_at === undefined ) {
      this.throwError( "created_at" );
    }

    if ( status.url === undefined ) {
      this.throwError( "url" );
    }

    if ( status.tags === undefined || !Array.isArray( status.tags ) ) {
      this.throwError( "tags" );
    }

    frontMatter.date = status.created_at;

    // TODO: be more efficient with status content and turn it down only once.

    frontMatter.title = this.makeTitle( this.convertContent( status.content ) );

    frontMatter.description = this.makeDescription( this.convertContent( status.content ) );

    frontMatter.toot_url = status.url;

    frontMatter.categories = categories;

    frontMatter.tags = [];

    for ( const tag of status.tags ) {
      if ( tag.name !== undefined ) {
        frontMatter.tags.push( tag.name );
      }
    }

    return YAML.stringify(
      frontMatter,
      {
        lineWidth: 0
      }
    );

  }

  /**
   * Create the Markdown or a link back to the original status.
   * @param {string} statusUrl The URL to the original status on the Fediverse.
   * @throws {TypeError} When the statusUrl is not a valid URL.
   * @returns {string} The link to the original status in Markdown format.
   */
  makeLinkBack( statusUrl ) {
    if ( URL.parse( statusUrl ) === null ) {
      throw new TypeError( "A valid URL is required" );
    }

    return `[Original post on the Fediverse](${ statusUrl })`;
  }

  /**
   * Use the first words to make a post title.
   * @param {string} markdownContent The content in Markdown format.
   * @throws {TypeError} If the parameter is incorrect.
   * @returns {string} The title of the content using the first words.
   */
  makeTitle( markdownContent ) {

    if ( markdownContent === undefined ) {
      throw new TypeError( "The markdownContent parameter is required" );
    }

    if ( typeof markdownContent !== "string" ) {
      throw new TypeError( "The markdownContent parameter must be a string" );
    }

    let content = markdownContent.replaceAll(
      "\n",
      " "
    );

    content = content.replaceAll(
      "  ",
      " "
    );

    const segments = this.titleSegmenter.segment( content );

    let count = 0;
    let titleSegments = [];
    let title = "";

    for ( const segment of segments ) {

      if ( count === this.maxTitleLen ) {
        break;
      }

      titleSegments.push(
        segment
      );

      if ( segment.isWordLike === true ) {
        count++;
      }

    }

    for ( const segment of titleSegments ) {
      title += segment.segment;
    }

    title += "\u2026";

    return title;

  }

  /**
   * Use the first sentences to make a post description.
   * @param {string} markdownContent The content in Markdown format.
   * @throws {TypeError} If the parameter is incorrect.
   * @returns {string} The description of the content using the first sentences.
   */
  makeDescription( markdownContent ) {

    if ( markdownContent === undefined ) {
      throw new TypeError( "The markdownContent parameter is required" );
    }

    if ( typeof markdownContent !== "string" ) {
      throw new TypeError( "The markdownContent parameter must be a string" );
    }

    let content = markdownContent.replaceAll(
      "\n",
      " "
    );

    content = content.replaceAll(
      "  ",
      " "
    );

    const segments = this.descriptionSegmenter.segment( content );

    let count = 0;
    let descrSegments = [];
    let descr = "";

    for ( const segment of segments ) {

      if ( count === this.maxDescrLen ) {
        break;
      }

      descrSegments.push(
        segment
      );

      count++;

    }

    for ( const segment of descrSegments ) {
      descr += segment.segment;
    }

    descr = descr.trim();
    descr = descr.substring( 0, descr.length - 1 );

    descr += "\u2026";

    return descr;

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
