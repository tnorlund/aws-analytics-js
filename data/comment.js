const AWS = require( `aws-sdk` )
const dynamoDB = new AWS.DynamoDB()
const { 
  incrementNumberUserComments, incrementNumberUserVotes 
} = require( `./user` )
const { incrementNumberPostComments } = require( `./post` )
const { Comment, Vote } = require( `../entities` )

/**
 * Adds a comment to a post.
 * @param {String} tableName  The name of the DynamoDB table.
 * @param {Object} user       The user adding the comment.
 * @param {Object} post       The post the user is adding the comment to.
 * @param {String} text       The text of the comment.
 * @returns {commentResponse} The result of accessing the database.
 */
const addComment = async ( tableName, user, post, text ) => {
  if ( !tableName ) throw Error( `Must give the name of the DynamoDB table` )
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
  // Create the comment and vote.
  const comment = new Comment( {
    userNumber: user_response.user.userNumber,
    userCommentNumber: user_response.user.numberComments,
    userName: user_response.user.name,
    slug: post_response.post.slug,
    postCommentNumber: post_response.post.numberComments,
    text,
    vote: 1,
    numberVotes: 1
  } )
  const vote = new Vote( {
    userNumber: user_response.user.userNumber,
    userName: user_response.user.name,
    slug: post_response.post.slug,
    replyChain: [ comment.dateAdded.toISOString() ],
    commentDate: comment.dateAdded.dateAdded,
    up: true,
    voteNumber: 1
  } )
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
    } )
    return { comment, vote }
  } catch ( error ) {
    console.log( `error`, error )
    let errorMessage = `Could not add comment to post`
    if ( error.code == `ConditionalCheckFailedException` )
      errorMessage = `Comment already in database`
    return { error: errorMessage }
  }
}

module.exports = { addComment }