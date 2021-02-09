const AWS = require( `aws-sdk` )
const { Location, locationFromItem } = require( `../entities` )
const https = require( `https` )
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

/**
 * Adds a location to DynamoDB from an IP address.
 * @param {String} tableName The name of the DynamoDB table.
 * @param {String} id The unique ID of the visitor.
 * @param {String} ip The IP address of the visitor.
 */
const addLocationFromIP = async ( tableName, id, ip ) => {
  ipifyRequest( ip ).then( ( result ) => {
    if ( result.statusCode == 200 ) {
      const _location = new Location( { 
        id, ip, 
        country: result.data.location.country, 
        region: result.data.location.region,
        city: result.data.location.city,
        latitude: result.data.location.lat,
        longitude: result.data.location.lng,
        postalCode: result.data.location.postalCode == `` ? 
          undefined : result.data.location.postalCode,
        timezone: result.data.location.timezone,
        domains: result.data.domains ? result.data.domains : undefined,
        autonomousSystem: result.data.as ? result.data.as : undefined,
        isp: result.data.isp,
        proxy: result.data.proxy.proxy,
        vpn: result.data.proxy.vpn,
        tor: result.data.proxy.tor,
        dateAdded: new Date()
      } )
      const { location, error } = addLocation( tableName, _location )
      if ( error ) return { error }
      return { location }
    } else return { error: `Could not add location from IP` }
  } )
}

/**
 * Makes an HTTP request to look up the location information of an IP address.
 * @param {String} ip The IP address to look up through IPIFY.
 */
const ipifyRequest = async ( ip ) => {
  let data_buffer = ``
  const response = await new Promise( ( resolve, reject ) => {
    const request = https.get(
      `https://geo.ipify.org/api/v1?apiKey=${
        // eslint-disable-next-line no-undef
        process.env.IPIFY_KEY
      }&ipAddress=${ ip }`,
      ( result ) => {
        result.on( `data`, ( data_result ) => {
          // eslint-disable-next-line no-undef
          data_buffer += new Buffer.from( 
            data_result, `base64` 
          ).toString( `utf8` )
        } )
        result.on( `end`, () => {
          console.log( `JSON.parse`, JSON.parse( data_buffer ) )
          resolve( {
            statusCode: 200,
            body: JSON.parse( data_buffer )
          } )
        } )
        
      } )
    request.on( `error`, () => { reject( { 
      statusCode: 500, body: `Something went wrong` 
    } ) } )
  } )
  return response
}

module.exports = { addLocation, getLocation, addLocationFromIP }