const AWS = require( `aws-sdk` )
const dynamoDB = new AWS.DynamoDB()

// TODO
// [X] Decrement the number of votes the comment has
// [X] Decrement the number of votes the user has
// [X] Decrement/Increment the vote of the comment
// [X] Remove the vote to the table

/**
 * @typedef  {Object} voteResponse The object returned by the function that
 *                                 removes a vote from the table.
 * @property {String} error        The error that occurs when attempting to
 *                                 remove the vote from the table.
 * @property {Object} user         The user with a new number of votes.
 * @property {Object} comment      The comment with a new number of votes.
 */

/**
 * Removes a vote from the table.
 * @param {String} tableName The DynamoDB table.
 * @param {Object} user      The user whose vote is being removed.
 * @param {Object} comment   The comment whose vote is being removed.
 * @param {Object} vote      The vote that is removed.
 * @returns {voteResponse}   The result of removing a vote from the table.
 */
const removeVote = async ( tableName, user, comment, vote ) => {
  if ( !tableName ) throw Error( `Must give the name of the DynamoDB table` )
  // Decrement the number of votes the comment has
  const {
    commentResponse, commentError
  } = await decrementNumberOfCommentVotes( tableName, comment )
  if ( commentError ) return { error: commentError }
  // Decrement the number of votes the user has
  const { userResponse, userError } = await decrementNumberOfUserVotes(
    tableName, user
  )
  if ( userError ) return { error: userError }
  // Decrement/Increment the vote of the comment
  const voteResponse = ( ( vote.up ) ?
    await downVoteComment( tableName, commentResponse ) :
    await upVoteComment( tableName, commentResponse )
  )
  if ( voteResponse.upError ) return { error: voteResponse.upError }
  if ( voteResponse.downError ) return { error: voteResponse.downError }
  // Remove the vote from the table.
  try {
    await dynamoDB.deleteItem( {
      TableName: tableName,
      Key: vote.key(),
      ConditionExpression: `attribute_exists(PK)`
    } ).promise()
    return { user: userResponse, comment: voteResponse.voteResponse }
  } catch ( error ) {
    // eslint-disable-next-line no-console
    console.log( `ERROR removeVote`, error )
    let errorMessage = `Could not remove vote`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `Vote does not exist`
    return { error: errorMessage }
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
 *                                 decrements the number of votes the user has.
 * @property {String} userError    The error that occurs when attempting to
 *                                 decrement the number of votes the user has.
 * @property {Object} userResponse The user object updated by the values in the
 *                                 database.
 */

/**
 * Decrements the number of votes a user has.
 * @param {String} tableName The DynamoDB table.
 * @param {Object} user      The user to decrement the number of votes.
 * @returns {userResponse}   The result of decrementing the number votes the
 *                           user has.
 */
const decrementNumberOfUserVotes = async ( tableName, user ) => {
  if ( !tableName )
    throw new Error( `Must give the name of the DynamoDB table` )
  try {
    const response = await dynamoDB.updateItem( {
      TableName: tableName,
      Key: user.key(),
      ConditionExpression: `attribute_exists(PK)`,
      UpdateExpression: `SET #count = #count - :dec`,
      ExpressionAttributeNames: { '#count': `NumberVotes` },
      ExpressionAttributeValues: { ':dec': { 'N': `1` } },
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
    console.log( `ERROR decrementNumberOfUserVotes`, error )
    let errorMessage = `Could not decrement the number of votes the user has`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `User does not exist`
    return { 'userError': errorMessage }
  }
}

/**
 * @typedef  {Object} commentResponse The object returned by the function that
 *                                    decrements the number of votes the comment
 *                                    has.
 * @property {String} commentError    The error that occurs when attempting to
 *                                    decrement the number of votes the comment
 *                                    has.
 * @property {Object} commentResponse The comment object updated by the values
 *                                    in the database.
 */

/**
 * Decrements the number of votes a comment has.
 * @param {String} tableName  The name of the DynamoDB table.
 * @param {Object} comment    The comment to decrement the number of votes.
 * @returns {commentResponse} The result of decrementing the number of votes
 *                            the comment has.
 */
const decrementNumberOfCommentVotes = async ( tableName, comment ) => {
  if ( !tableName )
    throw new Error( `Must give the name of the DynamoDB table` )
  try {
    const response = await dynamoDB.updateItem( {
      TableName: tableName,
      Key: comment.key(),
      ConditionExpression: `attribute_exists(PK)`,
      UpdateExpression: `SET #count = #count - :dec`,
      ExpressionAttributeNames: { '#count': `NumberVotes` },
      ExpressionAttributeValues: { ':dec': { 'N': `1` } },
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
    console.log( `ERROR decrementNumberOfCommentVotes`, error )
    let errorMessage = `Could not decrement the number of votes the comment has`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `Comment does not exist`
    return { 'commentError': errorMessage }
  }
}

module.exports = { removeVote }