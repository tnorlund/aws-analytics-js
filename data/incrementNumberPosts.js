const AWS = require( `aws-sdk` )
const dynamoDB = new AWS.DynamoDB()
const { Blog, blogFromItem } = require( `../entities` )

/**
 * Increments the number of projects in the DynamoDB blog item.
 * @param {String} tableName The name of the DynamoDB table.
 */
const incrementNumberPosts = async ( tableName ) => {
  if ( !tableName )
    throw new Error( `Must give the name of the DynamoDB table` )
  let blog = new Blog( {} )
  try {
    const response = await dynamoDB.updateItem( {
      TableName: tableName,
      Key: blog.key(),
      ConditionExpression: `attribute_exists(PK)`,
      UpdateExpression: `SET #count = #count + :inc`,
      ExpressionAttributeNames: { '#count': `NumberPosts` },
      ExpressionAttributeValues: { ':inc': { 'N': `1` } },
      ReturnValues: `ALL_NEW`
    } ).promise()
    return { 'blog': blogFromItem( response.Attributes ) }
  } catch( error ) {
    let errorMessage = `Could not increment number of blog posts`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `Blog does not exist`
    return { 'error': errorMessage }
  }
}

module.exports = { incrementNumberPosts }