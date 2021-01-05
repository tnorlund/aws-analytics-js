const AWS = require( `aws-sdk` )
const dynamoDB = new AWS.DynamoDB()
const { User } = require( `../entities` )
const { removeVote } = require( `./removeVote` )
const { getPostDetails } = require( `./getPostDetails` )

/**
 * Removes a comment and its votes from the table.
 * @param {String} tableName   The name of the DynamoDB table.
 * @param {Object} user        The user requesting to remove the comment.
 * @param {Object} post        The post to remove the comment from.
 * @param {String} commentDate The date-time of the comment to delete.
 */
const removeCommentFromPost = async (
  tableName, post, replyChain
) => {
  if ( !tableName ) throw Error( `Must give the name of the DynamoDB table` )
  try {
    // Get the comments and votes
    const { comments } = await getPostDetails( tableName, post )
    // Get the comment object from the post
    const comment = getCommentFromComments( comments, replyChain )
    if ( !comment ) return { error: `Could not find comment in post` }
    const { error, requestedPost } = await removeComment(
      tableName, comment, post
    )
    if ( error ) return { error: error }
    else return { post: requestedPost }
  } catch ( error ) {
    // eslint-disable-next-line no-console
    console.log( `ERROR removeCommentFromPost`, error )
    let errorMessage = `Could not remove comment from post`
    if ( error.code == `ConditionalCheckFailedException` )
      errorMessage = `Comment not in database.`
    return { error: errorMessage }
  }
}
/**
 * @typedef  {Object} removeResult  The result of removing a comment from the
 *                                  table.
 * @property {String} error         The error that occurs while remove the
 *                                  comment from the table.
 * @property {Object} requestedPost The post with the new number of comments.
 */

/**
 * Recursively deletes a comment from the table.
 * @param {String} tableName The name of the DynamoDB table.
 * @param {Object} comment   The comment to remove from the post.
 * @param {Object} post      The post to remove the comment from.
 * @returns {removeResult}   The result of removing the comment with its votes
 *                           and replies from the table.
 */
const removeComment = async ( tableName, comment, post ) => {
  // Recursively delete the replies associated with the comment.
  if ( Object.keys( comment.replies ).length > 0 ) {
    const replyPromises = Object.values( comment.replies ).map(
      async ( reply ) => {
        return await removeComment( tableName, reply, post )
      } )
    // Check to see if any of the replies had any errors
    // eslint-disable-next-line no-undef
    const results = await Promise.all( replyPromises )
    const errors = results.filter( ( result ) => {
      if ( `error` in result ) return result
    } )
    if ( errors.length > 0 ) return { error: errors.join( `\n` ) }
  }
  // Remove all votes
  const { voteError } = await removeVotesFromComment( tableName, comment )
  if ( voteError ) return { error: voteError }
  // Decrement the number of comments the user has
  const { userError } = decrementNumberOfUserComments( tableName, new User( {
    name: ` `, email: ` `, userNumber: comment.userNumber
  } ) )
  if ( userError ) return { error: userError }
  // Decrement the number of comments the post has
  const { postResponse, postError } = await decrementNumberOfPostComments(
    tableName, post
  )
  if ( postError ) return { error: postError }
  // Remove the comment from the table
  const { commentError } = deleteComment( tableName, comment )
  if ( commentError ) return { error: commentError }
  return { requestedPost: postResponse }
}

/**
 * Gets the unique comment from the post's details using the chain of replies.
 * @param {{Object}} comments   The comments, votes, and replies from the post.
 * @param {[String]} replyChain The array of date-times the unique comment is
 *                              associated with.
 */
const getCommentFromComments = ( comments, replyChain ) => {
  if ( replyChain.length > 0 ) {
    const date = replyChain.shift()
    if ( replyChain.length == 0 )
      return comments[ date ]
    else
      return getCommentFromComments( comments[ date ].replies, replyChain )
  } else {
    return undefined
  }
}

/**
 * @typedef  {Object} deleteComment   The object returned by the function that
 *                                    deletes the comment.
 * @property {String} commentResponse The comment that was removed from the
 *                                    table.
 * @property {String} commentError    The error that occurs while deleting the
 *                                    comment.
 */

/**
 * Deletes a comment from the table.
 * @param {Sting} tableName The name of the DynamoDB table.
 * @param {Object} comment  The comment to delete from the table
 */
const deleteComment = async ( tableName, comment ) => {
  try {
    await dynamoDB.deleteItem( {
      TableName: tableName,
      Key: comment.key(),
      ConditionExpression: `attribute_exists(PK)`
    } ).promise()
    return { commentResponse: comment }
  } catch( error ) {
    // eslint-disable-next-line no-console
    console.log( `ERROR deleteComment`, error )
    let errorMessage = `Could not delete comment`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `Comment does not exist`
    return { commentError: errorMessage }
  }
}

/**
 * @typedef  {Object} removeVotes The object returned by the function that
 *                                removes the votes from a given comment.
 * @property {String} voteError   The errors that occur while removing each
 *                                vote.
 */

/**
 * Removes the votes from a given comment.
 * @param {String} tableName        The name of the DynamoDB table
 * @param {Object} requestedComment The comment to remove the votes from.
 * @returns {removeVotes}           The result of remove the votes.
 */
const removeVotesFromComment = async ( tableName, requestedComment ) => {
  try {
    // Iterate over the different votes and retrieve a promise to remove each
    // vote.
    const promises = await Object.values(
      requestedComment.votes
    ).map( async ( vote ) => {
      const { error } = await removeVote(
        tableName, new User( {
          name: vote.userName, email: ` `, userNumber: vote.userNumber
        } ), requestedComment, vote
      )
      if ( error ) return { error: error }
    } )
    // Await all of the promised vote removals
    // eslint-disable-next-line no-undef
    const errors = await ( await Promise.all( promises ) ).filter(
      ( result ) => { if ( result ) return result.error }
    )
    if ( errors.length > 0 ) return { voteError: errors.join( `, ` ) }
    return { comment: requestedComment }
  } catch( error ) {
    // eslint-disable-next-line no-console
    console.log( `ERROR removeVotesFromComment`, error )
    return { voteError: error }
  }
}

/**
 * @typedef  {Object} decPost      The object returned by the function that
 *                                 decrements the number of comments the post
 *                                 has.
 * @property {String} postError    The error that occurs when attempting to
 *                                 decrement the number of comments the post
 *                                 has.
 * @property {Object} postResponse The post object updated by the values in
 *                                 the database.
 */

/**
 * Decrements the number of comments the post has.
 * @param {String} tableName The name of the DynamoDB table.
 * @param {Object} post      The post to decrement the number of comments it
 *                           has.
 * @returns {decPost}        The result of accessing the database.
 */
const decrementNumberOfPostComments = async ( tableName, post ) => {
  if ( !tableName )
    throw new Error( `Must give the name of the DynamoDB table` )
  try {
    const response = await dynamoDB.updateItem( {
      TableName: tableName,
      Key: post.key(),
      ConditionExpression: `attribute_exists(PK)`,
      UpdateExpression: `SET #count = #count - :dec`,
      ExpressionAttributeNames: { '#count': `NumberComments` },
      ExpressionAttributeValues: { ':dec': { 'N': `1` } },
      ReturnValues: `ALL_NEW`
    } ).promise()
    if ( !response.Attributes ) return { 'postError': `Could not find post` }
    // Set the number of comments the post has to the value returned by the
    // database.
    post.numberComments = response.Attributes.NumberComments.N
    return { 'postResponse': post }
  } catch( error ) {
    // eslint-disable-next-line no-console
    console.log( `ERROR decrementNumberOfPostComments`, error )
    let errorMessage = `Could not decrement the number of comments the post has`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `Post does not exist`
    return { 'postError': errorMessage }
  }
}

/**
 * @typedef  {Object} decUser      The object returned by the function that
 *                                 decrements the number of comments the user
 *                                 has.
 * @property {String} userError    The error that occurs when attempting to
 *                                 decrement the number of comments the user
 *                                 has.
 * @property {Object} userResponse The user object updated by the values in
 *                                 the database.
 */

/**
 * Decrements the number of comments the user has.
 * @param {String} tableName The name of the DynamoDB table.
 * @param {Object} user      The user to decrement the number of comments they
 *                           have made.
 * @returns {decUser}        The result of accessing the database.
 */
const decrementNumberOfUserComments = async ( tableName, user ) => {
  if ( !tableName )
    throw new Error( `Must give the name of the DynamoDB table` )
  try {
    const response = await dynamoDB.updateItem( {
      TableName: tableName,
      Key: user.key(),
      ConditionExpression: `attribute_exists(PK)`,
      UpdateExpression: `SET #count = #count - :dec`,
      ExpressionAttributeNames: { '#count': `NumberComments` },
      ExpressionAttributeValues: { ':dec': { 'N': `1` } },
      ReturnValues: `ALL_NEW`
    } ).promise()
    if ( !response.Attributes ) return { 'userError': `Could not find user` }
    // Set the number of comments the user has to the value returned by the
    // database.
    user.numberComments = response.Attributes.NumberComments.N
    return { 'userResponse': user }
  } catch( error ) {
    // eslint-disable-next-line no-console
    console.log( `ERROR decrementNumberOfUserComments`, error )
    let errorMessage = `Could not decrement the number of comments the user has`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `User does not exist`
    return { 'userError': errorMessage }
  }
}

module.exports = { removeCommentFromPost }