const AWS = require( `aws-sdk` )
const dynamoDB = new AWS.DynamoDB()
const { Comment } = require( `../entities` )
const { addVote } = require( `./addVote` )

// TODO
// [X] Increment number of comments in post
// [X] Increment the number of comments the user has
// [ ] Add Comment

const addReplyToComment = async ( tableName, user, post, text, replyChain ) => {
  if ( !tableName ) throw Error( `Must give the name of the DynamoDB table` )
  try {
    // Increment the number of comments the user has.
    const { userResponse, userError } = await incrementNumberOfUserComments(
      tableName, user
    )
    if ( userError ) return { error: userError }
    // Increment the number of comments the post has.
    const { postResponse, postError } = await incrementNumberOfPostComments(
      tableName, post
    )
    if ( postError ) return { error: postError }
    // Add the new user and post data to create the comment object.
    const requestedComment = new Comment( {
      userNumber: userResponse.userNumber,
      userCommentNumber: userResponse.numberComments,
      userName: userResponse.name,
      slug: postResponse.slug,
      postCommentNumber: postResponse.numberComments,
      text, replyChain
    } )
    await dynamoDB.putItem( {
      TableName: tableName,
      Item: requestedComment.toItem(),
      ConditionExpression: `attribute_not_exists(PK)`
    } ).promise()
    // Add up-vote to the reply
    const { error } = await addVote(
      tableName, userResponse, requestedComment, true,
      replyChain.concat( [ requestedComment.dateAdded.toISOString() ] )
    )
    if ( error ) return { error: error }
    else return { comment: requestedComment }
  } catch ( error ) {
    // eslint-disable-next-line no-console
    console.log( `ERROR addReplyToComment`, error )
    let errorMessage = `Could not reply to comment`
    if ( error.code == `ConditionalCheckFailedException` )
      errorMessage = `Comment already in database`
    return { error: errorMessage }
  }
}

/**
 * @typedef  {Object} postResponse  The object returned by the function that
 *                                  increments the number of comments the post
 *                                  has.
 * @property {String} postError     The error that occurs when attempting to
 *                                  increment the number of comments the post
 *                                  has.
 * @property {Object} postResponse  The post object updated by the values in
 *                                  the database.
 */

/**
 * Increments a the number of comments the post has.
 * @param {String} tableName The name of the DynamoDB table.
 * @param {Object} post      The post to increment the number of comments it
 *                           has.
 * @returns {postResponse}   The result of accessing the database.
 */
const incrementNumberOfPostComments = async ( tableName, post ) => {
  if ( !tableName )
    throw new Error( `Must give the name of the DynamoDB table` )
  try {
    const response = await dynamoDB.updateItem( {
      TableName: tableName,
      Key: post.key(),
      ConditionExpression: `attribute_exists(PK)`,
      UpdateExpression: `SET #count = #count + :inc`,
      ExpressionAttributeNames: { '#count': `NumberComments` },
      ExpressionAttributeValues: { ':inc': { 'N': `1` } },
      ReturnValues: `ALL_NEW`
    } ).promise()
    if ( !response.Attributes ) return { 'postError': `Could not find post` }
    // Set the number of comments the post has to the value returned by the
    // database.
    post.numberComments = response.Attributes.NumberComments.N
    return { 'postResponse': post }
  } catch( error ) {
    // eslint-disable-next-line no-console
    console.log( `ERROR incrementNumberOfPostComments`, error )
    let errorMessage = `Could not increment the number of comments the post has`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `Post does not exist`
    return { 'postError': errorMessage }
  }
}

/**
 * @typedef  {Object} userResponse  The object returned by the function that
 *                                  increments the number of comments the user
 *                                  has.
 * @property {String} userError     The error that occurs when attempting to
 *                                  increment the number of comments the user
 *                                  has.
 * @property {Object} userResponse  The user object updated by the values in
 *                                  the database.
 */

/**
 * Increments a the number of comments the user has.
 * @param {String} tableName The name of the DynamoDB table.
 * @param {Object} user      The user to increment the number of comments they
 *                           have made.
 * @returns {userResponse}   The result of accessing the database.
 */
const incrementNumberOfUserComments = async ( tableName, user ) => {
  if ( !tableName )
    throw new Error( `Must give the name of the DynamoDB table` )
  try {
    const response = await dynamoDB.updateItem( {
      TableName: tableName,
      Key: user.key(),
      ConditionExpression: `attribute_exists(PK)`,
      UpdateExpression: `SET #count = #count + :inc`,
      ExpressionAttributeNames: { '#count': `NumberComments` },
      ExpressionAttributeValues: { ':inc': { 'N': `1` } },
      ReturnValues: `ALL_NEW`
    } ).promise()
    if ( !response.Attributes ) return { 'userError': `Could not find user` }
    // Set the number of comments the user has to the value returned by the
    // database.
    user.numberComments = response.Attributes.NumberComments.N
    return { 'userResponse': user }
  } catch( error ) {
    // eslint-disable-next-line no-console
    console.log( `ERROR incrementNumberOfUserComments`, error )
    let errorMessage = `Could not increment the number of comments the user has`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `User does not exist`
    return { 'userError': errorMessage }
  }
}

module.exports = { addReplyToComment }