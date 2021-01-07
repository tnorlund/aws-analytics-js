const AWS = require( `aws-sdk` )
const dynamoDB = new AWS.DynamoDB()
const { incrementNumberUsers } = require( `..` )

/**
 * Adds a user to DynamoDB.
 * @param {String} tableName The name of the DynamoDB table.
 * @param {User} user        The user added to the blog.
 */
const addUserToBlog = async ( tableName, user ) => {
  if ( !tableName ) throw Error( `Must give the name of the DynamoDB table` )
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
    return { user: user }
  } catch( error ) {
    let errorMessage = `Could not add user to blog`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `${user.name} is already in DynamoDB`
    return { 'error': errorMessage }
  }
}

module.exports = { addUserToBlog }