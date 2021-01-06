const AWS = require( `aws-sdk` )
const dynamoDB = new AWS.DynamoDB()
const {
  postFromItem, commentFromItem, voteFromItem, User
} = require( `../entities` )

const removePost = async ( tableName, post ) => {
  if ( !tableName ) throw Error( `Must give the name of the DynamoDB table` )
  try {
    const result = await dynamoDB.query( {
      TableName: tableName,
      IndexName: `GSI1`,
      KeyConditionExpression: `#gsi1pk = :gsi1pk`,
      ExpressionAttributeNames: { '#gsi1pk': `GSI1PK` },
      ExpressionAttributeValues: { ':gsi1pk': post.gsi1pk() },
      ScanIndexForward: true
    } ).promise()
    if ( !result.Items ) return { error: `Post does not exist` }
    let requestedPost; let requestedComments = []; let requestedVotes = []
    // Iterate over the results and set them to be the requested post,
    // comments, or votes.
    result.Items.map( ( item ) => {
      switch( item.Type.S ) {
        case `post`: requestedPost = postFromItem( item ); break
        case `comment`: requestedComments.push( commentFromItem( item ) )
          break
        case `vote`: requestedVotes.push( voteFromItem( item ) )
      }
    } )
    // Iterate over the different votes to decrement the number of votes the
    // user has made and then delete the vote item.
    const voteErrors = requestedVotes.filter( vote => {
      const requestedUser = new User( {
        name: vote.userName, email: `null`, userNumber: vote.userNumber
      } )
      const { userError } = decrementNumberOfUserVotes(
        tableName, requestedUser
      )
      if ( userError ) return userError
      dynamoDB.deleteItem( {
        TableName: tableName,
        Key: vote.key(),
        ConditionExpression: `attribute_exists(PK)`
      } ).promise()
    } )
    if ( voteErrors.length > 0 ) return { error: voteErrors.join( `, ` ) }
    // Iterate over the different comments to decrement the number of comments
    // the user has made and then delete the comment item.
    const commentErrors = requestedComments.filter( ( comment ) => {
      const requestedUser = new User( {
        name: comment.userName, email: `null`, userNumber: comment.userNumber
      } )
      const { userError } = decrementNumberOfUserComments(
        tableName, requestedUser )
      if ( userError ) return userError
      dynamoDB.deleteItem( {
        TableName: tableName,
        Key: comment.key(),
        ConditionExpression: `attribute_exists(PK)`
      } ).promise()
    } )
    if ( commentErrors.length > 0 ) return { error: commentErrors.join( `, ` ) }
    // Delete the post item.
    await dynamoDB.deleteItem( {
      TableName: tableName,
      Key: requestedPost.key(),
      ConditionExpression: `attribute_exists(PK)`
    } ).promise()
    return { post: requestedPost }
  } catch( error ) {
    // eslint-disable-next-line no-console
    console.log( `ERROR removePost`, error )
    return { error: error }
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

module.exports = { removePost }