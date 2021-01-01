const { parseDate } = require( `./utils` )

const { ZeroPadNumber } = require( `./utils` )
class Comment {
  /**
   * A project object.
   * @param {Object} details The details of the project.
   */
  constructor( {
    userNumber, userCommentNumber, userName, slug, text,
    vote = `0`, numberVotes = `0`, dateAdded = new Date(), replyChain = []
  } ) {
    if ( typeof userNumber === `undefined` )
      throw new Error( `Must give user's number` )
    this.userNumber = parseInt( userNumber )
    if ( typeof userCommentNumber === `undefined` )
      throw new Error( `Must give the number of comments the user has made.` )
    this.userCommentNumber = parseInt( userCommentNumber )
    if ( typeof userName === `undefined` )
      throw Error( `Must give the user's name.` )
    this.userName = userName
    if ( typeof slug === `undefined` ) 
      throw new Error( `Must give post's slug` )
    this.slug = slug
    if ( typeof text === `undefined` )
      throw new Error( `Must give the text of the comment` )
    this.text = text
    this.vote = parseInt( vote )
    if ( parseInt( numberVotes ) < 0 )
      throw new Error( `Number of votes must be a positive number` )
    this.numberVotes = parseInt( numberVotes )
    this.dateAdded = (
      ( typeof dateAdded == `string` ) ? parseDate( dateAdded ): dateAdded
    )
    if ( !Array.isArray( replyChain) )
      throw new Error( `Chain of comments must be an array.` )
    this.replyChain = replyChain.map( ( date ) => {
      if ( typeof date == `string` ) return parseDate( date )
      else if ( date instanceof Date ) return dateAdded
      else throw Error(
        `The chain of comments this replies to must be either strings or dates`
      )
    } )
    this.replies = {}
    this.votes = {}
  }

  /**
   * @returns {Object} The partition key.
   */
  pk() { return {
    'S': `USER#${ ZeroPadNumber( this.userNumber ) }`
  } }

  /**
   * @returns {Object} The primary key.
   */
  key() {
    return {
      'PK': {
        'S': `USER#${ ZeroPadNumber( this.userNumber ) }`
      },
      'SK': { 'S': `#COMMENT#${ this.dateAdded.toISOString() }` }
    }
  }

  /**
   * @returns {Object} The global secondary index partition key.
   */
  gsi1pk() { return { 'S': `POST#${ this.slug }` } }

  /**
   * @returns {Object} The global secondary index primary key.
   */
  gsi1() {
    if ( this.replyChain.length == 0 )
      return {
        'GSI1PK': { 'S': `POST#${ this.slug }` },
        'GSI1SK': {
          'S': `#COMMENT#${ this.dateAdded.toISOString() }`
        }
      }
    else
      return {
        'GSI1PK': { 'S': `POST#${ this.slug }` },
        'GSI1SK': {
          'S': `#COMMENT#`
            + this.replyChain.map( ( date ) => date.toISOString() )
              .join( `#COMMENT#` ) + `#COMMENT#` + this.dateAdded.toISOString()
        }
      }
  }

  /**
   * @returns {Object} The DynamoDB syntax of a Project.
   */
  toItem() {
    return {
      ...this.key(),
      ...this.gsi1(),
      'Type': { 'S': `comment` },
      'User': { 'S': this.userName },
      'Text': { 'S': this.text },
      'Vote': { 'N': String( this.vote ) },
      'NumberVotes': { 'N': String( this.numberVotes ) },
      'Slug': { 'S': this.slug },
      'UserCommentNumber': { 'N': String( this.userCommentNumber ) },
      'DateAdded': { 'S': this.dateAdded.toISOString() }
    }
  }
}

/**
 * Turns the post from a DynamoDB item into the class.
 * @param   {Object} item The item returned from DynamoDB.
 * @returns {Object}      The post as a class.
 */
const commentFromItem = ( item ) => {
  const dates = item.GSI1SK.S.match(
    /#COMMENT#(\d+-\d+-\d+T\d+:\d+:\d+\.\d+Z)/gm
  ).map(
    ( date ) => date.split( `#` )[2]
  )
  return new Comment ( {
    userNumber: parseInt( item.PK.S.split( `#` )[1] ).toString(),
    userCommentNumber: parseInt( item.UserCommentNumber.N ).toString(),
    userName: item.User.S,
    slug: item.Slug.S,
    text: item.Text.S,
    vote: parseInt( item.Vote.N ).toString(),
    numberVotes: parseInt( item.NumberVotes.N ).toString(),
    dateAdded: dates[ dates.length -1 ],
    replyChain: dates.slice( 0, -1 )
  } )
}

module.exports = { Comment, commentFromItem }