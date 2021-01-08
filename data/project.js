const AWS = require( `aws-sdk` )
const dynamoDB = new AWS.DynamoDB()
const { Blog, projectFromItem } = require( `../entities` )

/**
 * Adds a project to DynamoDB.
 * @param {String} tableName The name of the DynamoDB table.
 * @param {Object} project   The project to add.
 */
const addProject = async ( tableName, project ) => {
  if ( typeof tableName == `undefined` ) 
    throw Error( `Must give the name of the DynamoDB table` )
  if ( typeof project == `undefined` )
    throw new Error( `Must give project` )
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
            ExpressionAttributeNames: { '#count': `NumberProjects` },
            ExpressionAttributeValues: { ':inc': { 'N': `1` } },
            ReturnValuesOnConditionCheckFailure: `ALL_OLD`
          },
        },
        {
          Put: {
            TableName: tableName,
            Item: project.toItem(),
            ConditionExpression: `attribute_not_exists(PK)`
          }
        }
      ]
    } ).promise()
    return { project }
  } catch( error ) {
    let errorMessage = `Could not add project to blog`
    if ( error.code === `TransactionCanceledException` )
      errorMessage = `Could not add '${project.title}' to table`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { 'error': errorMessage }
  }
}

/**
 * Increments the number of follows in the DynamoDB project item.
 * @param {String} tableName The name of the DynamoDB table.
 * @param {Object} project   The project to increment the number of follows.
 */
const incrementNumberProjectFollows = async ( tableName, project ) => {
  if ( !tableName )
    throw new Error( `Must give the name of the DynamoDB table` )
  if ( typeof project == `undefined` )
    throw new Error( `Must give project` )
  try {
    const response = await dynamoDB.updateItem( {
      TableName: tableName,
      Key: project.key(),
      ConditionExpression: `attribute_exists(PK)`,
      UpdateExpression: `SET #count = #count + :inc`,
      ExpressionAttributeNames: { '#count': `NumberFollows` },
      ExpressionAttributeValues: { ':inc': { 'N': `1` } },
      ReturnValues: `ALL_NEW`
    } ).promise()
    return { 'project': projectFromItem( response.Attributes ) }
  } catch( error ) {
    let errorMessage = `Could not increment number of project follows`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `Project does not exist`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { 'error': errorMessage }
  }
}

/**
 * Decrements the number of follows in the DynamoDB project item.
 * @param {String} tableName The name of the DynamoDB table.
 * @param {Object} project   The project to decrement the number of follows.
 */
const decrementNumberProjectFollows = async ( tableName, project ) => {
  if ( !tableName )
    throw new Error( `Must give the name of the DynamoDB table` )
  if ( typeof project == `undefined` )
    throw new Error( `Must give project` )
  try {
    const response = await dynamoDB.updateItem( {
      TableName: tableName,
      Key: project.key(),
      ConditionExpression: `attribute_exists(PK)`,
      UpdateExpression: `SET #count = #count - :dec`,
      ExpressionAttributeNames: { '#count': `NumberFollows` },
      ExpressionAttributeValues: { ':dec': { 'N': `1` } },
      ReturnValues: `ALL_NEW`
    } ).promise()
    return { 'project': projectFromItem( response.Attributes ) }
  } catch( error ) {
    let errorMessage = `Could not decrement number of project follows`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `Project does not exist`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { 'error': errorMessage }
  }
}

module.exports = {
  addProject,
  incrementNumberProjectFollows, decrementNumberProjectFollows
}