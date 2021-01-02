const { isIP } = require( `./utils` )

class Visitor {
  constructor( {
    ip, numberSessions = 0,
  } ) {
    if ( typeof ip === `undefined` )
      throw new Error( `Must give IP address` )
    if ( !isIP( ip ) )
      throw new Error( `Must pass a valid IP address` )
    this.ip = ip
    if ( isNaN( numberSessions ) )
      throw new Error( `Number of sessions must be a number` )
    if ( parseInt( numberSessions ) < 0 )
      throw new Error( `Number of sessions must be positive` )
    this.numberSessions = parseInt( numberSessions )
  }

  /**
   * @returns {Object} The partition key.
   */
  pk() {
    return {
      'S': `VISITOR#${ this.ip }`
    }
  }

  /**
   * @returns {Object} The primary key
   */
  key() {
    return {
      'PK': { 'S': `VISITOR#${ this.ip }` },
      'SK': { 'S': `#VISITOR` }
    }
  }

  /**
   * @returns {Object} The DynamoDB syntax of a Visitor.
   */
  toItem() {
    return {
      ...this.key(),
      'Type': { 'S': `visitor` },
      'NumberSessions': { 'N': this.numberSessions.toString() },
    }
  }
}

/**
 * Turns the visitor form a DynamoDB item into the object.
 * @param   {Object} item The item returned from DynamoDB
 * @returns {Object}      The visitor as an object.
 */
const visitorFromItem = ( item ) => {
  return new Visitor( {
    ip: item.PK.S.split( `#` )[1],
    numberSessions: item.NumberSessions.N
  } )
}

module.exports = { Visitor, visitorFromItem }