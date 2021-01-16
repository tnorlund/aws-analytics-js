const AWS = require( `aws-sdk` )
const dynamoDB = new AWS.DynamoDB()
const { visitorFromItem } = require( `../entities` )

/**
 * Adds a visitor to the DynamoDB table.
 * @param {String} tableName The name of the DynamoDB table.
 * @param {Object} visitor   The visitor added to the table
 */
const addVisitor = async ( tableName, visitor ) => {
  if ( typeof tableName == `undefined` )
    throw new Error( `Must give the name of the DynamoDB table` )
  if ( typeof visitor == `undefined` )
    throw new Error( `Must give visitor` )
  try {
    await dynamoDB.putItem( {
      TableName: tableName,
      Item: visitor.toItem(),
      ConditionExpression : `attribute_not_exists(PK)`
    } ).promise()
    return { visitor }
  } catch( error ) {
    let errorMessage = `Could not add visitor`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `Visitor already in table`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { 'error': errorMessage }
  }
}

/**
 * Retrieves the visitor from DynamoDB.
 * @param {String} tableName The name of the DynamoDB table.
 * @param {Object} visitor   The visitor requested.
 */
const getVisitor = async ( tableName, visitor ) => {
  if ( typeof tableName == `undefined` )
    throw new Error( `Must give the name of the DynamoDB table` )
  if ( typeof visitor == `undefined` ) throw new Error( `Must give visitor` )
  try {
    const result = await dynamoDB.getItem( {
      TableName: tableName,
      Key: visitor.key()
    } ).promise()
    if ( !result.Item ) return { error: `Visitor does not exist` }
    return { visitor: visitorFromItem( result.Item ) }
  } catch( error ) {
    let errorMessage = `Could not get visitor`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { 'error': errorMessage }
  }
}

/**
 * Increments a visitor's number of sessions in DynamoDB.
 * @param {String} tableName The name of the DynamoDB table.
 * @param {Object} visitor   The visitor to increment the number of sessions.
 */
const incrementNumberSessions = async ( tableName, visitor ) => {
  if ( typeof tableName == `undefined` )
    throw new Error( `Must give the name of the DynamoDB table` )
  if ( typeof visitor == `undefined` ) throw new Error( `Must give visitor` )
  try {
    const response = await dynamoDB.updateItem( {
      TableName: tableName,
      Key: visitor.key(),
      ConditionExpression: `attribute_exists(PK)`,
      UpdateExpression: `SET #count = #count + :inc`,
      ExpressionAttributeNames: { '#count': `NumberSessions` },
      ExpressionAttributeValues: { ':inc': { 'N': `1` } },
      ReturnValues: `ALL_NEW`
    } ).promise()
    return { 'visitor': visitorFromItem( response.Attributes ) }
  } catch( error ) {
    let errorMessage = `Could not increment number sessions`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `Visitor does not exist`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { 'error': errorMessage }
  }
}

/**
 * Decrements a visitor's number of sessions in DynamoDB.
 * @param {String} tableName The name of the DynamoDB table.
 * @param {Object} visitor   The visitor to decrement the number of sessions.
 */
const decrementNumberSessions = async ( tableName, visitor ) => {
  if ( typeof tableName == `undefined` )
    throw new Error( `Must give the name of the DynamoDB table` )
  if ( typeof visitor == `undefined` ) throw new Error( `Must give visitor` )
  try {
    const response = await dynamoDB.updateItem( {
      TableName: tableName,
      Key: visitor.key(),
      ConditionExpression: `attribute_exists(PK)`,
      UpdateExpression: `SET #count = #count - :dec`,
      ExpressionAttributeNames: { '#count': `NumberSessions` },
      ExpressionAttributeValues: { ':dec': { 'N': `1` } },
      ReturnValues: `ALL_NEW`
    } ).promise()
    return { 'visitor': visitorFromItem( response.Attributes ) }
  } catch( error ) {
    let errorMessage = `Could not increment number sessions`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `Visitor does not exist`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { 'error': errorMessage }
  }
}

module.exports = { 
  addVisitor, getVisitor,
  incrementNumberSessions, decrementNumberSessions
}