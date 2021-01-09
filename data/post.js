const AWS = require( `aws-sdk` )
const dynamoDB = new AWS.DynamoDB()
const { Blog, Post, postFromItem } = require( `../entities` )

/**
 * Adds a post to DynamoDB.
 * @param {String} tableName The name of the DynamoDB table.
 * @param {Object} post      The post to add.
 * @returns {Map}            Whether the post was added to the table.
 */
const addPost = async ( tableName, post ) => {
  if ( typeof tableName == `undefined` ) 
    throw Error( `Must give the name of the DynamoDB table` )
  if ( typeof post == `undefined` )
    throw new Error( `Must give post` )
  const blog = new Blog( {} )
  try {
    await dynamoDB.transactWriteItems( {
      TransactItems: [
        {
          Update: {
            TableName: tableName,
            Key: blog.key(),
            ConditionExpression: `attribute_exists(PK)`,
            UpdateExpression: `SET #count = #count + :inc`,
            ExpressionAttributeNames: { '#count': `NumberPosts` },
            ExpressionAttributeValues: { ':inc': { 'N': `1` } },
            ReturnValuesOnConditionCheckFailure: `ALL_OLD`
          },
        },
        {
          Put: {
            TableName: tableName,
            Item: post.toItem(),
            ConditionExpression: `attribute_not_exists(PK)`
          }
        }
      ]
    } ).promise()
    return { post }
  } catch( error ) {
    let errorMessage = `Could not add post to blog`
    if ( error.code === `TransactionCanceledException` )
      errorMessage = `Could not add '${post.title}' to table`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { 'error': errorMessage }
  }
}

/**
 * Increments the number of comments in the DynamoDB post item.
 * @param {String} tableName The name of the DynamoDB table.
 * @param {Object} post      The post to increment the number of comments.
 */
const incrementNumberPostComments = async ( tableName, post ) => {
  if ( !tableName )
    throw new Error( `Must give the name of the DynamoDB table` )
  if ( typeof post == `undefined` )
    throw new Error( `Must give post` )
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
    return { 'post': new Post( {
      slug: post.slug,
      title: post.title,
      numberComments: response.Attributes.NumberComments.N
    } ) }
  } catch( error ) {
    let errorMessage = `Could not increment number of post comments`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `Post does not exist`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { 'error': errorMessage }
  }
}

/**
 * Decrements the number of comments in the DynamoDB post item.
 * @param {String} tableName The name of the DynamoDB table.
 * @param {Object} post      The post to decrement the number of comments.
 */
const decrementNumberPostComments = async ( tableName, post ) => {
  if ( !tableName )
    throw new Error( `Must give the name of the DynamoDB table` )
  if ( typeof post == `undefined` )
    throw new Error( `Must give post` )
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
    return { 'post': new Post( {
      slug: post.slug,
      title: post.title,
      numberComments: response.Attributes.NumberComments.N
    } ) }
  } catch( error ) {
    let errorMessage = `Could not decrement number of post comments`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `Post does not exist`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { 'error': errorMessage }
  }
}

module.exports = { 
  addPost,
  incrementNumberPostComments, decrementNumberPostComments
}