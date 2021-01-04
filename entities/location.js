const { parseDate, isIP, variableToItemAttribute } = require( `./utils` )

class Location {
  /**
   * A location object.
   * @param {Object} details The details of the location.
   */
  constructor( {
    ip, country, region, city, latitude, longitude, postalCode, timezone,
    domains, autonomousSystem, isp, proxy, vpn, tor, dateAdded
  } ) {
    if ( typeof ip === `undefined` )
      throw new Error( `Must give IP address` )
    if ( !isIP( ip ) )
      throw new Error( `Must pass a valid IP address` )
    this.ip = ip
    if ( typeof country === `undefined` )
      throw new Error( `Must give country` )
    this.country = country
    if ( typeof region === `undefined` )
      throw new Error( `Must give region` )
    this.region = region
    if ( typeof city === `undefined` )
      throw new Error( `Must give city` )
    this.city = city
    if ( typeof latitude === `undefined` )
      throw new Error( `Must give latitude` )
    if ( isNaN( latitude ) )
      throw new Error( `Latitude must be a number` )
    this.latitude = parseFloat( latitude )
    if ( typeof longitude === `undefined` )
      throw new Error( `Must give longitude` )
    if ( isNaN( longitude ) )
      throw new Error( `Longitude must be a number` )
    this.longitude = parseFloat( longitude )
    this.postalCode = postalCode
    if ( typeof timezone === `undefined` )
      throw new Error( `Must give timezone` )
    this.timezone = timezone
    this.domains = domains
    this.autonomousSystem = autonomousSystem
    this.isp = isp
    this.proxy = proxy
    this.vpn = vpn
    this.tor = tor
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
      'SK': variableToItemAttribute( `#LOCATION` )
    }
  }

  /**
   * @returns {Object} The DynamoDB syntax of a location.
   */
  toItem() {
    return {
      ...this.key(),
      'Type': variableToItemAttribute( `location` ),
      'Country': variableToItemAttribute( this.country ),
      'Region': variableToItemAttribute( this.region ),
      'City': variableToItemAttribute( this.city ),
      'Latitude': variableToItemAttribute( this.latitude ),
      'Longitude': variableToItemAttribute( this.longitude ) ,
      'PostalCode': variableToItemAttribute( this.postalCode ),
      'TimeZone': variableToItemAttribute( this.timezone ),
      'Domains': variableToItemAttribute( this.domains ),
      'AutonomousSystem': variableToItemAttribute( this.autonomousSystem ),
      'ISP': variableToItemAttribute( this.isp ),
      'Proxy': variableToItemAttribute( this.proxy ),
      'VPN': variableToItemAttribute( this.vpn ),
      'TOR': variableToItemAttribute( this.tor ),
      'DateAdded': variableToItemAttribute( this.dateAdded.toISOString() )
    }
  }
}

const locationFromItem = ( item ) => {
  const autonomousSystem = {}
  Object.keys( item.AutonomousSystem.M ).map( key => {
    if ( `N` in item.AutonomousSystem.M[key] )
      autonomousSystem[key] = Number( item.AutonomousSystem.M[key].N )
    if ( `S` in item.AutonomousSystem.M[key] )
      autonomousSystem[key] = item.AutonomousSystem.M[key].S
    if ( `NULL` in item.AutonomousSystem.M[key] ) 
      autonomousSystem[key] = undefined
  } )
  return new Location( {
    ip: item.PK.S.split( `#` )[1], 
    country: item.Country.S,
    region: item.Region.S, 
    city: item.City.S, 
    latitude: item.Latitude.N, 
    longitude: item.Longitude.N, 
    postalCode: ( `S` in item.PostalCode ) ? item.PostalCode.S : undefined,
    timezone: item.TimeZone.S,
    domains: ( `SS` in item.Domains ) ? item.Domains.SS : undefined,
    autonomousSystem, 
    isp: item.ISP.S, 
    proxy: item.Proxy.BOOL, 
    vpn: item.VPN.BOOL, 
    tor: item.TOR.BOOL, 
    dateAdded: item.DateAdded.S
  } )
}

module.exports = { Location, locationFromItem }