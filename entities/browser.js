const { parseDate, isIP, variableToItemAttribute } = require( `./utils` )

class Browser {
  /**
   * A browser object.
   * @param {Object} details The details of the browser.
   */
  constructor( {
    app, ip, width, height, dateVisited, device, deviceType, browser, os,
    webkit, version, dateAdded
  } ) {
    if ( typeof app === `undefined` )
      throw new Error( `Must give userAgent` )
    this.app = app
    if ( typeof ip === `undefined` )
      throw new Error( `Must give IP address` )
    if ( !isIP( ip ) )
      throw new Error( `Must pass a valid IP address` )
    this.ip = ip
    this.width = parseInt( width )
    this.height = parseInt( height )
    this.dateVisited = ( typeof dateVisited === `string` ) ?
      parseDate( dateVisited ) : dateVisited
    this.device = device
    this.deviceType = deviceType
    this.browser = browser
    this.os = os
    this.webkit = webkit
    this.version = version
    this.dateAdded = ( typeof dateAdded === `string` ) ?
      parseDate( dateAdded ) : dateAdded
  }

  /**
   * @returns {Object} The partition key.
   */
  pk() {
    return variableToItemAttribute( `VISITOR#${ this.ip }` )
  }

  /**
   * @returns {Object} The primary key.
   */
  key() {
    return {
      'PK': variableToItemAttribute( `VISITOR#${ this.ip }` ),
      'SK': variableToItemAttribute(
        `BROWSER#${ this.dateVisited.toISOString() }`
      )
    }
  }

  /**
   * @returns {Object} The DynamoDB syntax of a browser.
   */
  toItem() {
    return {
      ...this.key(),
      'Type': variableToItemAttribute( `browser` ),
      'App': variableToItemAttribute( this.app ),
      'Width': variableToItemAttribute( this.width ),
      'Height': variableToItemAttribute( this.height ),
      'DateVisited': variableToItemAttribute( this.dateVisited.toISOString() ),
      'Device': variableToItemAttribute( this.device ),
      'DeviceType': variableToItemAttribute( this.deviceType ),
      'Browser': variableToItemAttribute( this.browser ),
      'OS': variableToItemAttribute( this.os ),
      'Webkit': variableToItemAttribute( this.webkit ),
      'Version': variableToItemAttribute( this.version ),
      'DateAdded': variableToItemAttribute( this.dateAdded.toISOString() )
    }
  }
}

/**
 * Turns the browser from a DynamoDB item into the class.
 * @param   {Object} item The item returned from DynamoDB.
 * @returns {Object}      The browser as a class.
 */
const browserFromItem = ( item ) => {
  return new Browser( {
    app: item.App.S,
    ip: item.PK.S.split( `#` )[1],
    width: item.Width.N,
    height: item.Height.N,
    dateVisited: item.DateVisited.S,
    device: ( `S` in item.Device ) ? item.Device.S : undefined,
    deviceType: ( `S` in item.DeviceType ) ? item.DeviceType.S : undefined,
    browser: ( `S` in item.Browser ) ? item.Browser.S : undefined,
    os: ( `S` in item.OS ) ? item.OS.S : undefined,
    webkit: ( `S` in item.Webkit ) ? item.Webkit.S : undefined,
    version: ( `S` in item.Version ) ? item.Version.S : undefined,
    dateAdded: item.DateAdded.S
  } )
}

module.exports = { Browser, browserFromItem }