const AWS = require( `aws-sdk` )
const { locationFromItem } = require( `../entities` )
const dynamoDB = new AWS.DynamoDB()

/**
 * Adds a location to the DynamoDB table.
 * @param   {String} tableName The name of the DynamoDB table.
 * @param   {Object} location  The location object added.
 * @returns {Object}           Whether the location was added to the table or 
 *                             the error that occurred.
 */
const addLocation = async ( tableName, location ) => {
  if ( typeof tableName == `undefined` )
    throw new Error( `Must give the name of the DynamoDB table` )
  if ( typeof location == `undefined` ) throw new Error( `Must give location` )
  try {
    await dynamoDB.putItem( {
      TableName: tableName,
      Item: location.toItem(),
      ConditionExpression: `attribute_not_exists(PK)`
    } ).promise()
    return { location }
  } catch( error ) {
    let errorMessage = `Could not add location`
    if ( error.code == `ConditionalCheckFailedException` )
      errorMessage = `Location already exists`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { error: errorMessage }
  }
}

/**
 * Retrieves the location from DynamoDB.
 * @param   {String} tableName The name of the DynamoDB table.
 * @param   {Object} location  The location object requested
 * @returns {Object}           Whether the location was retrieved from the
 *                             table or the error that occurred.
 */
const getLocation = async ( tableName, location ) => {
  if ( typeof tableName === `undefined` )
    throw new Error( `Must give the name of the DynamoDB table` )
  if ( typeof location == `undefined` ) throw new Error( `Must give location` )
  try {
    const result = await dynamoDB.getItem( {
      TableName: tableName, Key: location.key()
    } ).promise()
    if ( !result.Item ) return { error: `Location does not exist` }
    return { location: locationFromItem( result.Item ) }
  } catch( error ) {
    let errorMessage = `Could not retrieve location`
    if ( error.code == `ResourceNotFoundException` )
      errorMessage = `Table does not exist`
    return { error: errorMessage }
  }
}

module.exports = { addLocation, getLocation }