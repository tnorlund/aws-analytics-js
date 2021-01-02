/**
 * Zero-pads a number so that it takes up 6 characters in length.
 * @param {Number} number The number to zero-pad
 * @returns {String}      The zero-padded number as a string.
 */
function ZeroPadNumber( number ) {
  if ( isNaN( number ) )
    throw new Error( `Must pass a number` )
  if ( parseInt( number ) < 0 )
    throw new Error( `Must pass a positive number` )
  return ( `00000` + number ).slice( -6 )
}

/**
 * Converts an ISO formatted date into a Date object.
 * @param {String} dateString An ISO formatted date.
 * @returns A Date object.
 */
const parseDate = ( dateString ) => {
  const parsed = dateString.split( /\D+/ )
  if ( parsed.length == 8 )
    return( new Date( Date.UTC(
      parsed[0], --parsed[1], parsed[2], parsed[3], parsed[4], parsed[5],
      parsed[6]
    ) ) )
  else
    throw new Error( `Date must be formatted with ISO format.` )
}

/**
 * Determines whether a string is formatted as an IP address.
 * @param {String} ip The IP address to check.
 */
const isIP = ( ip ) => {
  if ( typeof ip !== `string` )
    throw Error( `Must pass IP address as a string` )
  return Boolean( ip.match( /\d+\.\d+\.\d+\.\d/ ) )
}

/**
 * Converts a JS variable into DynamoDB syntax.
 * @param {Any} variable The variable to be converted.
 */
const variableToItemAttribute = ( variable ) => {
  if ( typeof variable === `number` ) return { 'N': variable.toString() }
  if ( typeof variable === `boolean` ) return { 'BOOL': variable }
  if ( variable instanceof Date ) return { 'S': variable.toISOString() }
  if ( 
    typeof variable === `undefined` || variable == `` || variable == `None`
  ) return { 'NULL': true }
  if ( Array.isArray( variable ) ) {
    if ( !variable.some( isNaN ) ) return { 'NS': variable.map( String ) }
    else return { 'SS': variable }
  }
  if ( Object.prototype.toString.call( variable ) === `[object Object]` ) {
    let attribute = {}
    Object.keys( variable ).map( 
      key => attribute[key] = variableToItemAttribute( variable[key] ) 
    ) 
    return { 'M': { ...attribute } }
  }
  return { 'S': variable.toString() }
}

module.exports = { ZeroPadNumber, parseDate, isIP, variableToItemAttribute }