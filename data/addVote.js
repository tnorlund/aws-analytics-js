const AWS = require( `aws-sdk` )
const dynamoDB = new AWS.DynamoDB()
const { Vote } = require( `../entities` )

// TODO
// [X] Increment the number of votes the comment has
// [X] Increment the number of votes the user has
// [X] Increment the vote of the comment
// [X] Add the vote to the table

/**
 * @typedef  {Object} voteResponse The object returned by the function that
 *                                 adds a vote to the table.
 * @property {String} error        The error that occurs when attempting to
 *                                 add the vote to the table.
 * @property {Object} vote         The vote object added to the table.
 * @property {Object} user         The user with a new number of votes.
 * @property {Object} comment      The comment with a new number of votes.
 */

/**
 * Adds a vote to a comment.
 * @param {String}  tableName The DynamoDB table.
 * @param {Object}  user      The user that is adding the vote.
 * @param {Object}  comment   The comment the user is adding the vote to.
 * @param {Boolean} up        Whether the vote is an up-vote or a down-vote.
 */
const addVote = async ( tableName, user, comment, up, replyChain ) => {
  if ( !tableName ) throw Error( `Must give the name of the DynamoDB table` )
  try {
    // Increment the number of votes the comment has.
    const {
      commentResponse, commentError
    } = await incrementNumberOfCommentVotes( tableName, comment )
    if ( commentError ) return { error: commentError }
    // Increment the number of votes the user has.
    const { userResponse, userError } = await incrementNumberOfUserVotes(
      tableName, user
    )
    if ( userError ) return { error: userError }
    // Increment or decrement the vote of the comment.
    let response
    if ( up ) {
      // eslint-disable-next-line no-unused-vars
      response = await upVoteComment(
        tableName, commentResponse
      )
      if ( response.upError ) return { error: response.upError }
    } else {
      response = await downVoteComment(
        tableName, commentResponse
      )
      if ( response.downError ) return { error: response.downError }
    }
    // Create the vote and add it to the table.
    const requestedVote = new Vote( {
      userNumber: userResponse.userNumber,
      userName: userResponse.name,
      slug: commentResponse.slug,
      replyChain: replyChain,
      commentDate: commentResponse.dateAdded,
      up: up,
      voteNumber: commentResponse.numberVotes
    } )
    await dynamoDB.putItem( {
      TableName: tableName,
      Item: requestedVote.toItem(),
      ConditionExpression: `attribute_not_exists(PK)`
    } ).promise()
    return {
      vote: requestedVote, user: userResponse, comment: response.voteResponse
    }
  } catch ( error ) {
    // eslint-disable-next-line no-console
    console.log( `ERROR addVote`, error )
    return { error: error }
  }
}

/**
 * @typedef  {Object} downResponse The object returned by the function that
 *                                 decrements the votes of a comment.
 * @property {String} downError    The error that occurs when attempting to
 *                                 add the down-vote to the comment.
 * @property {Object} voteResponse The comment object updated by the values in
 *                                 the database.
 */

/**
 * Increments the vote of a comment.
 * @param {String} tableName The DynamoDB table.
 * @param {Object} comment   The comment to add the up-vote to.
 * @returns {downResponse}   The result of adding a down-vote to the comment.
 */
const downVoteComment = async ( tableName, comment ) => {
  if ( !tableName )
    throw new Error( `Must give the name of the DynamoDB table` )
  try {
    const response = await dynamoDB.updateItem( {
      TableName: tableName,
      Key: comment.key(),
      ConditionExpression: `attribute_exists(PK)`,
      UpdateExpression: `SET #count = #count - :dec`,
      ExpressionAttributeNames: { '#count': `Vote` },
      ExpressionAttributeValues: { ':dec': { 'N': `1` } },
      ReturnValues: `ALL_NEW`
    } ).promise()
    if ( !response.Attributes )
      return { 'downError': `Could not find comment` }
      // Set the vote of the comment to the value returned by the
      // database.
    comment.vote = response.Attributes.Vote.N
    return { 'voteResponse': comment }
  } catch( error ) {
    // eslint-disable-next-line no-console
    console.log( `ERROR downVoteComment`, error )
    let errorMessage = `Could not add down-vote to comment`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `Comment does not exist`
    return { 'downError': errorMessage }
  }
}

/**
 * @typedef  {Object} upResponse   The object returned by the function that
 *                                 increments the votes of a comment.
 * @property {String} upError      The error that occurs when attempting to
 *                                 add the up-vote to the comment.
 * @property {Object} voteResponse The comment object updated by the values in
 *                                 the database.
 */

/**
 * Increments the vote of a comment.
 * @param {String} tableName The DynamoDB table.
 * @param {Object} comment   The comment to add the up-vote to.
 * @returns {upResponse}     The result of adding a up-vote to the comment.
 */
const upVoteComment = async ( tableName, comment ) => {
  if ( !tableName )
    throw new Error( `Must give the name of the DynamoDB table` )
  try {
    const response = await dynamoDB.updateItem( {
      TableName: tableName,
      Key: comment.key(),
      ConditionExpression: `attribute_exists(PK)`,
      UpdateExpression: `SET #count = #count + :inc`,
      ExpressionAttributeNames: { '#count': `Vote` },
      ExpressionAttributeValues: { ':inc': { 'N': `1` } },
      ReturnValues: `ALL_NEW`
    } ).promise()
    if ( !response.Attributes )
      return { 'upError': `Could not find comment` }
      // Set the vote of the comment to the value returned by the
      // database.
    comment.vote = response.Attributes.Vote.N
    return { 'voteResponse': comment }
  } catch( error ) {
    // eslint-disable-next-line no-console
    console.log( `ERROR upVoteComment`, error )
    let errorMessage = `Could not add up-vote to comment`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `Comment does not exist`
    return { 'upError': errorMessage }
  }
}

/**
 * @typedef  {Object} userResponse The object returned by the function that
 *                                 increments the number of votes the user has.
 * @property {String} userError    The error that occurs when attempting to
 *                                 increment the number of votes the user has.
 * @property {Object} userResponse The user object updated by the values in the
 *                                 database.
 */

/**
 * Increments the number of votes a user has.
 * @param {String} tableName The DynamoDB table.
 * @param {Object} user      The user to increment the number of votes.
 * @returns {userResponse}   The result of incrementing the number votes the
 *                           user has.
 */
const incrementNumberOfUserVotes = async ( tableName, user ) => {
  if ( !tableName )
    throw new Error( `Must give the name of the DynamoDB table` )
  try {
    const response = await dynamoDB.updateItem( {
      TableName: tableName,
      Key: user.key(),
      ConditionExpression: `attribute_exists(PK)`,
      UpdateExpression: `SET #count = #count + :inc`,
      ExpressionAttributeNames: { '#count': `NumberVotes` },
      ExpressionAttributeValues: { ':inc': { 'N': `1` } },
      ReturnValues: `ALL_NEW`
    } ).promise()
    if ( !response.Attributes )
      return { 'userError': `Could not find user` }
    // Set the number of votes the user has to the value returned by the
    // database.
    user.numberVotes = response.Attributes.NumberVotes.N
    return { 'userResponse': user }
  } catch( error ) {
    // eslint-disable-next-line no-console
    console.log( `ERROR incrementNumberOfUserVotes`, error )
    let errorMessage = `Could not increment the number of votes the user has`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `User does not exist`
    return { 'userError': errorMessage }
  }
}

/**
 * @typedef  {Object} commentResponse The object returned by the function that
 *                                    increments the number of votes the comment
 *                                    has.
 * @property {String} commentError    The error that occurs when attempting to
 *                                    increment the number of votes the comment
 *                                    has.
 * @property {Object} commentResponse The comment object updated by the values
 *                                    in the database.
 */

/**
 * Increments the number of votes a comment has.
 * @param {String} tableName  The name of the DynamoDB table.
 * @param {Object} comment    The comment to increment the number of votes.
 * @returns {commentResponse} The result of incrementing the number of votes
 *                            the comment has.
 */
const incrementNumberOfCommentVotes = async ( tableName, comment ) => {
  if ( !tableName )
    throw new Error( `Must give the name of the DynamoDB table` )
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
    if ( !response.Attributes )
      return { 'commentError': `Could not find comment` }
    // Set the number of votes the comment has to the value returned by the
    // database.
    comment.numberVotes = response.Attributes.NumberVotes.N
    return { 'commentResponse': comment }
  } catch( error ) {
    // eslint-disable-next-line no-console
    console.log( `ERROR incrementNumberOfCommentVotes`, error )
    let errorMessage = `Could not increment the number of votes the comment has`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `Comment does not exist`
    return { 'commentError': errorMessage }
  }
}

module.exports = { addVote }