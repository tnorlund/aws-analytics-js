const { ZeroPadNumber, parseDate } = require( `./utils` )
class TOS {
  /**
   * A Terms of Service object.
   * @param {Object} details The details of the Terms of Service.
   */
  constructor( { userNumber, version, dateAccepted = new Date() } ) {
    if ( typeof userNumber === `undefined` )
      throw Error( `Must give user's number` )
    this.userNumber = parseInt( userNumber )
    if ( typeof version === `undefined` )
      throw Error( `Must give terms of service's version` )
    this.version = ( typeof version == `string` ) ?
      parseDate( version ) : version
    this.dateAccepted =  ( typeof dateAccepted == `string` ) ?
      parseDate( dateAccepted ) : dateAccepted
  }

  /**
   * @returns {Object} The partition key.
   */
  pk() {
    return { 'S': `USER#${ ZeroPadNumber( this.userNumber ) }` }
  }

  /**
   * @returns {Object} The primary key.
   */
  key() {
    return {
      'PK': { 'S': `USER#${ ZeroPadNumber( this.userNumber ) }` },
      'SK': { 'S': `#TOS#${ this.version.toISOString() }` }
    }
  }

  /**
   * @returns {Object} The DynamoDB syntax of a Terms of Service.
   */
  toItem() {
    return {
      ...this.key(),
      'Type': { 'S': `terms of service` },
      'DateAccepted': { 'S': this.dateAccepted.toISOString() }
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
    version: parseDate( item.SK.S.split( `#` )[2] ),
    dateAccepted: parseDate( item.DateAccepted.S )
  } )
}

module.exports = { TOS, tosFromItem }