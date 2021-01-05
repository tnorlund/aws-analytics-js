/**
 * Converts an ISO formatted date into a Date object.
 * @param {String} dateString An ISO formatted date.
 * @returns A Date object.
 */
const parseDate = ( dateString ) => {
  const parsed = dateString.split( /\D+/ )
  return( new Date( Date.UTC(
    parsed[0], --parsed[1], parsed[2], parsed[3], parsed[4], parsed[5],
    parsed[6]
  ) ) )
}

module.exports = {
  parseDate
}