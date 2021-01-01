const { ZeroPadNumber, parseDate } = require( `./utils` )
class TOS {
  /**
   * A Terms of Service object.
   * @param {Object} details The details of the Terms of Service.
   */
  constructor( { userNumber, tosNumber, version, dateAccepted = new Date() } ) {
    if ( !userNumber )
      throw Error( `Must give user's number` )
    this.userNumber = parseInt( userNumber )
    if ( !tosNumber )
      throw Error( `Must give terms of service's number` )
    this.tosNumber = parseInt( tosNumber )
    if ( !version )
      throw Error( `Must give terms of service's version` )
    this.version = parseDate( version )
    this.dateAccepted =  ( typeof dateAccepted == `string` ) ?
      parseDate( dateAccepted ) : dateAccepted
  }

  /**
   * @returns {Object} The primary key.
   */
  key() {
    return {
      'PK': { 'S': `USER#${ ZeroPadNumber( this.userNumber ) }` },
      'SK': { 'S': `#TOS#${ ZeroPadNumber( this.tosNumber ) }` }
    }
  }

  /**
   * @returns {Object} The DynamoDB syntax of a Terms of Service.
   */
  toItem() {
    return {
      ...this.key(),
      'Type': { 'S': `terms of service` },
      'Version': { 'S': this.version.toISOString() },
      'DateAccepted': { 'S': this.dateAccepted.toISOString() },
      'NumberTOS': { 'N': this.tosNumber.toString() }
    }
  }
}

/**
 * Turns the terms of service from a DynamoDB item into the class.
 * @param   {Object} item The item returned from DynamoDB
 * @returns {Object}      The Terms of Service as a class.
 */
const tosFromItem = ( item ) => {
  console.log( `item`, item )
  return new TOS( {
    userNumber: item.PK.S.split( `#` )[1],
    tosNumber: item.SK.S.split( `#` )[2],
    version: item.Version.S,
    dateAccepted: parseDate( item.DateAccepted.S )
  } )
}

module.exports = {
  TOS,
  tosFromItem
}