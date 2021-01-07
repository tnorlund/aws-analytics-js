const AWS = require( `aws-sdk` )
const dynamoDB = new AWS.DynamoDB()
const { incrementNumberUsers } = require( `./blog` )
const { userFromItem } = require( `../entities` )

/**
 * Adds a user to DynamoDB.
 * @param {String} tableName The name of the DynamoDB table.
 * @param {User} user        The user added to the blog.
 */
const addUser = async ( tableName, user ) => {
  if ( typeof tableName == `undefined` )
    throw new Error( `Must give the name of the DynamoDB table` )
  if ( typeof user == `undefined` )
    throw new Error( `Must give user` )
  const { blog, error } = await incrementNumberUsers( tableName )
  if ( error ) return { error: error }
  // Set the user's number to the new number of users in the blog.
  user.userNumber = blog.numberUsers
  try {
    await dynamoDB.putItem( {
      TableName: tableName,
      Item: user.toItem(),
      ConditionExpression: `attribute_not_exists(PK)`
    } ).promise()
    return { user, blog }
  } catch( error ) {
    return { 'error': `Could not add user to blog` }
  }
}

/**
 * Increments a user's number of projects that they follow in DynamoDB.
 * @param {String} tableName The name of the DynamoDB table.
 * @param {Object} user      The user to increment the number of projects they
 *                           follow.
 */
const incrementNumberFollows = async ( tableName, user ) => {
  if ( typeof tableName == `undefined` )
    throw new Error( `Must give the name of the DynamoDB table` )
  if ( typeof user == `undefined` )
    throw new Error( `Must give user` )
  try {
    const response = await dynamoDB.updateItem( {
      TableName: tableName,
      Key: user.key(),
      ConditionExpression: `attribute_exists(PK)`,
      UpdateExpression: `SET #count = #count + :inc`,
      ExpressionAttributeNames: { '#count': `NumberFollows` },
      ExpressionAttributeValues: { ':inc': { 'N': `1` } },
      ReturnValues: `ALL_NEW`
    } ).promise()
    return { 'user': userFromItem( response.Attributes ) }
  } catch( error ) {
    let errorMessage = `Could not unfollow project`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `User does not exist`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { 'error': errorMessage }
  }
}

/**
 * Decrements a user's number of projects that they follow in DynamoDB.
 * @param {String} tableName The name of the DynamoDB table.
 * @param {Object} user      The user to decrement the number of projects they
 *                           follow.
 */
const decrementNumberFollows = async ( tableName, user ) => {
  if ( typeof tableName == `undefined` )
    throw new Error( `Must give the name of the DynamoDB table` )
  if ( typeof user == `undefined` )
    throw new Error( `Must give user` )
  try {
    const response = await dynamoDB.updateItem( {
      TableName: tableName,
      Key: user.key(),
      ConditionExpression: `attribute_exists(PK)`,
      UpdateExpression: `SET #count = #count - :dec`,
      ExpressionAttributeNames: { '#count': `NumberFollows` },
      ExpressionAttributeValues: { ':dec': { 'N': `1` } },
      ReturnValues: `ALL_NEW`
    } ).promise()
    return { 'user': userFromItem( response.Attributes ) }
  } catch( error ) {
    let errorMessage = `Could not unfollow project`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `User does not exist`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { 'error': errorMessage }
  }
}



module.exports = { 
  addUser, 
  incrementNumberFollows, decrementNumberFollows 
}