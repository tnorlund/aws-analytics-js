const AWS = require( `aws-sdk` )
const dynamoDB = new AWS.DynamoDB()
const { incrementNumberPosts } = require( `./incrementNumberPosts` )

/**
 * Adds a post to DynamoDB.
 * @param {String} tableName The name of the DynamoDB table.
 * @param {Object} post      The post to add.
 */
const addPostToBlog = async ( tableName, post ) => {
  if ( !tableName ) throw Error( `Must give the name of the DynamoDB table` )
  const { error } = await incrementNumberPosts( tableName )
  if ( error ) return { error: error }
  try {
    await dynamoDB.putItem( {
      TableName: tableName,
      Item: post.toItem(),
      ConditionExpression: `attribute_not_exists(PK)`
    } ).promise()
    return { post: post }
  } catch( error ) {
    let errorMessage = `Could not add project to blog`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `${post.title} is already in DynamoDB`
    return { 'error': errorMessage }
  }
}

module.exports = { addPostToBlog }