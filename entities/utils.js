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

module.exports = { ZeroPadNumber, parseDate }