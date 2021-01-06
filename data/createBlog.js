const AWS = require( `aws-sdk` )
const dynamoDB = new AWS.DynamoDB()

/**
 * Adds a Blog to a DynamoDB table
 * @param   {String} tableName The name of the DynamoDB table.
 * @param   {Blog}   blog      The blog object added.
 * @returns {Map}              Whether the blog was added to the DB.
 */
const createBlog = async ( tableName, blog ) => {
  if ( typeof tableName === `undefined` ) 
    throw new Error( `Must give the name of the DynamoDB table` )
  try {
    await dynamoDB.putItem( {
      TableName: tableName,
      Item: blog.toItem(),
      ConditionExpression: `attribute_not_exists(PK)`
    } ).promise()
    return( { blog: blog } )
  } catch( error ) {
    console.log( `ERROR createBlog ${ error }` )
    let errorMessage = `Could not create Blog`
    if ( error.code == `ConditionalCheckFailedException` )
      errorMessage = `Blog already exists`
    return { error: errorMessage }
  }
}

module.exports = {
  createBlog
}