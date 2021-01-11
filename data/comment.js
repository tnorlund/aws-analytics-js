const AWS = require( `aws-sdk` )
const dynamoDB = new AWS.DynamoDB()
const { 
  incrementNumberUserComments, incrementNumberUserVotes 
} = require( `./user` )
const { incrementNumberPostComments } = require( `./post` )
const { Comment, Vote, commentFromItem } = require( `../entities` )

/**
 * Adds a comment to a post.
 * @param {String} tableName  The name of the DynamoDB table.
 * @param {Object} user       The user adding the comment.
 * @param {Object} post       The post the user is adding the comment to.
 * @param {String} text       The text of the comment.
 * @param {Array}  replyChain The set of dates the comment is replying to.
 * @returns {commentResponse} The result of accessing the database.
 */
const addComment = async ( tableName, user, post, text, replyChain ) => {
  if ( typeof tableName == `undefined` ) 
    throw Error( `Must give the name of the DynamoDB table` )
  if ( typeof user == `undefined` ) throw new Error( `Must give user` )
  if ( typeof post == `undefined` ) throw new Error( `Must give post` )
  if ( typeof text == `undefined` ) 
    throw new Error( `Must give the text of the comment` )
  // The new comment needs to be given an up-vote. After incrementing the
  // number of comments the post and user has, increment the number of votes
  // the user has.
  const user_response = await incrementNumberUserComments( tableName, user )
  if ( user_response.error ) return user_response
  const post_response = await incrementNumberPostComments( tableName, post )
  if ( post_response.error ) return post_response
  const vote_response = await incrementNumberUserVotes( tableName, user )
  if ( vote_response.error ) return vote_response
  let comment, vote
  // Create the comment and vote.
  if ( typeof replyChain == `undefined` ) {
    comment = new Comment( {
      userNumber: user_response.user.userNumber,
      userCommentNumber: user_response.user.numberComments,
      userName: user_response.user.name,
      slug: post_response.post.slug,
      postCommentNumber: post_response.post.numberComments,
      text,
      vote: 1,
      numberVotes: 1
    } )
    vote = new Vote( {
      userNumber: user_response.user.userNumber,
      userName: user_response.user.name,
      slug: post_response.post.slug,
      replyChain: [ comment.dateAdded.toISOString() ],
      commentDate: comment.dateAdded.dateAdded,
      up: true,
      voteNumber: 1
    } )
  } else {
    comment = new Comment( {
      userNumber: user_response.user.userNumber,
      userCommentNumber: user_response.user.numberComments,
      userName: user_response.user.name,
      slug: post_response.post.slug,
      postCommentNumber: post_response.post.numberComments,
      vote: 1,
      numberVotes: 1,
      text, 
      replyChain: replyChain
    } )
    vote = new Vote( {
      userNumber: user_response.user.userNumber,
      userName: user_response.user.name,
      slug: post_response.post.slug,
      replyChain: [ ...replyChain, comment.dateAdded.toISOString() ],
      up: true,
      voteNumber: 1,
    } )
  }
  try {
    await dynamoDB.transactWriteItems( {
      TransactItems: [
        { Put: {
          TableName: tableName,
          Item: comment.toItem(),
          ConditionExpression: `attribute_not_exists(PK)`
        } },
        { Put: {
          TableName: tableName,
          Item: vote.toItem(),
          ConditionExpression: `attribute_not_exists(PK)`
        } }
      ]
    } ).promise()
    return { comment, vote }
  } catch ( error ) {
    console.log( `error`, error )
    let errorMessage = `Could not add comment to post`
    if ( error.code == `ConditionalCheckFailedException` )
      errorMessage = `Comment already in database`
    return { error: errorMessage }
  }
}

/**
 * Retrieves the comment from DynamoDB.
 * @param {String} tableName The name of the DynamoDB table.
 * @param {Object} comment   The comment requested.
 */
const getComment = async ( tableName, comment ) => {
  if ( typeof tableName == `undefined` )
    throw Error( `Must give the name of the DynamoDB table` )
  if ( typeof comment == `undefined` ) throw new Error( `Must give comment` )
  try {
    const result = await dynamoDB.getItem( {
      TableName: tableName,
      Key: comment.key()
    } ).promise()
    if ( !result.Item ) return { error: `Comment does not exist` }
    else return { comment: commentFromItem( result.Item ) }
  } catch( error ) {
    let errorMessage = `Could not get comment`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { error: errorMessage }
  }
}

/**
* Increments the number of votes a comment has.
* @param {String} tableName  The name of the DynamoDB table.
* @param {Object} comment    The comment to increment the number of votes.
* @returns {commentResponse} The result of incrementing the number of votes
*                            the comment has.
*/
const incrementNumberCommentVotes = async ( tableName, comment ) => {
  if ( typeof tableName == `undefined` ) 
    throw Error( `Must give the name of the DynamoDB table` )
  if ( typeof comment == `undefined` ) throw new Error( `Must give comment` )
  try {
    const response = await dynamoDB.updateItem( {
      TableName: tableName,
      Key: comment.key(),
      ConditionExpression: `attribute_exists(PK)`,
      UpdateExpression: `SET #count = #count + :inc`,
      ExpressionAttributeNames: { '#count': `NumberVotes` },
      ExpressionAttributeValues: { ':inc': { 'N': `1` } },
      ReturnValues: `ALL_NEW`
    } ).promise()
    // Set the number of votes the comment has to the value returned by the
    // database.
    comment.numberVotes = parseInt( response.Attributes.NumberVotes.N )
    return { comment }
  } catch( error ) {
    let errorMessage = `Could not increment the number of votes the comment `
    + `has`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `Comment does not exist`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { error : errorMessage }
  }
}

module.exports = { 
  addComment, getComment,
  incrementNumberCommentVotes
}