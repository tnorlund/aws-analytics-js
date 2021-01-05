const { Location, locationFromItem } = require( `..` )

const ip = `0.0.0.0`
const country = `US` 
const region = `CA`
const city = `Westlake Village`
const latitude =  34.14584
const longitude = -118.80565
const postalCode = `91361`
const timezone = `-08:00`
const domains = [`cpe-75-82-84-171.socal.res.rr.com`]
const autonomousSystem = {
  'asn': 20001,
  'domain': `https://www.spectrum.com`,
  'route': `75.82.0.0/15`,
  'type': `Cable/DSL/ISP`
} 
const autonomousSystem_null = {
  'asn': 20001,
  'domain': undefined,
  'route': `75.82.0.0/15`,
  'type': undefined
} 
const isp = `Charter Communications`
const proxy = false
const vpn = false
const tor = false
const dateAdded = new Date()

const validLocations = [
  { ip, country, region, city, latitude, longitude, postalCode, timezone, domains, autonomousSystem, isp, proxy, vpn, tor, dateAdded },
  { ip, country, region, city, latitude, longitude, postalCode, timezone, domains, autonomousSystem, isp, proxy, vpn, tor, dateAdded: dateAdded.toISOString() }
]

const invalidLocations = [
  {},
  { ip: `something` },
  { ip },
  { ip, country },
  { ip, country, region },
  { ip, country, region, city },
  { ip, country, region, city, latitude: `something` },
  { ip, country, region, city, latitude },
  { ip, country, region, city, latitude, longitude: `something` },
  { ip, country, region, city, latitude, longitude },
]

describe( `location object`, () => {
  test.each( validLocations )(
    `valid constructor`,
    parameter => {
      const location = new Location( parameter )
      expect( location.ip ).toEqual( ip )
      expect( location.country ).toEqual( country )
      expect( location.city ).toEqual( city )
      expect( location.latitude ).toEqual( latitude )
      expect( location.postalCode ).toEqual( postalCode )
      expect( location.timezone ).toEqual( timezone )
      expect( location.domains ).toEqual( domains )
      expect( location.autonomousSystem ).toEqual( autonomousSystem )
      expect( location.isp ).toEqual( isp )
      expect( location.proxy ).toEqual( proxy )
      expect( location.dateAdded ).toEqual( dateAdded )
    } 
  )

  test.each( invalidLocations )( 
    `invalid constructor`,
    parameter => expect( () => new Location( parameter ) ).toThrow()
  )

  test( `pk`, () => expect( new Location( { ip, country, region, city, latitude, longitude, postalCode, timezone, domains, autonomousSystem, isp, proxy, vpn, tor, dateAdded } ).pk() ).toEqual( {
    'S': `VISITOR#${ ip }`
  } ) )

  test( `key`, () => expect( new Location( { ip, country, region, city, latitude, longitude, postalCode, timezone, domains, autonomousSystem, isp, proxy, vpn, tor, dateAdded } ).key() ).toEqual( {
    'PK': { 'S': `VISITOR#${ ip }` },
    'SK': { 'S': `#LOCATION` }
  } ) )

  test( `toItem`, () => expect( new Location( { ip, country, region, city, latitude, longitude, postalCode, timezone, domains, autonomousSystem, isp, proxy, vpn, tor, dateAdded } ).toItem() ).toEqual( { 
    'PK': { 'S': `VISITOR#${ ip }` },
    'SK': { 'S': `#LOCATION` },
    'Type': { 'S': `location` },
    'Country': { 'S': country },
    'Region': { 'S': region },
    'City': { 'S': city },
    'Latitude': { 'N': latitude.toString() },
    'Longitude': { 'N': longitude.toString() },
    'PostalCode': { 'S': postalCode },
    'TimeZone': { 'S': timezone },
    'Domains': { 'SS': domains },
    'AutonomousSystem': { 'M': {
      'asn': { 'N': `20001` },
      'domain': { 'S': `https://www.spectrum.com` },
      'route': { 'S': `75.82.0.0/15` },
      'type': { 'S': `Cable/DSL/ISP` }
    } },
    'ISP': { 'S': isp },
    'Proxy': { 'BOOL': proxy },
    'VPN': { 'BOOL': vpn },
    'TOR': { 'BOOL': tor },
    'DateAdded': { 'S': dateAdded.toISOString() }
  } ) )

  test( `toItem`, () => expect( new Location( { ip, country, region, city, latitude, longitude, postalCode, timezone, domains, autonomousSystem: autonomousSystem_null, isp, proxy, vpn, tor, dateAdded } ).toItem() ).toEqual( { 
    'PK': { 'S': `VISITOR#${ ip }` },
    'SK': { 'S': `#LOCATION` },
    'Type': { 'S': `location` },
    'Country': { 'S': country },
    'Region': { 'S': region },
    'City': { 'S': city },
    'Latitude': { 'N': latitude.toString() },
    'Longitude': { 'N': longitude.toString() },
    'PostalCode': { 'S': postalCode },
    'TimeZone': { 'S': timezone },
    'Domains': { 'SS': domains },
    'AutonomousSystem': { 'M': {
      'asn': { 'N': `20001` },
      'domain': { 'NULL': true },
      'route': { 'S': `75.82.0.0/15` },
      'type': { 'NULL': true }
    } },
    'ISP': { 'S': isp },
    'Proxy': { 'BOOL': proxy },
    'VPN': { 'BOOL': vpn },
    'TOR': { 'BOOL': tor },
    'DateAdded': { 'S': dateAdded.toISOString() }
  } ) )

  test( `locationFromItem`, () => {
    const location = new Location(  { ip, country, region, city, latitude, longitude, postalCode, timezone, domains, autonomousSystem, isp, proxy, vpn, tor, dateAdded } )
    expect( locationFromItem( location.toItem() ) ).toStrictEqual( location )
  } )

  test( `locationFromItem`, () => {
    const location = new Location(  { ip, country, region, city, latitude, longitude, timezone, domains:[], autonomousSystem: autonomousSystem_null, isp, proxy, vpn, tor, dateAdded } )
    expect( locationFromItem( location.toItem() ) ).toEqual( { ...location, domains: undefined } )
  } )
} )
