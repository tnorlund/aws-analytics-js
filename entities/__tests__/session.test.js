const { Session, sessionFromItem } = require( `../` )

const ip = `0.0.0.0`
const avgTime = 10.0
const totalTime = 100.0
const sessionStart = new Date()

const validSessions = [
  { ip, avgTime, totalTime, sessionStart },
  { ip, avgTime: avgTime.toString(), totalTime, sessionStart },
  { ip, avgTime, totalTime: totalTime.toString(), sessionStart },
  { ip, avgTime, totalTime, sessionStart: sessionStart.toISOString() }
]

const invalidSessions = [
  {},
  { sessionStart, ip: `something` },
  { sessionStart }
]

describe( `session object`, () => {
  test.each( validSessions )(
    `valid constructor`,
    parameter => {
      const session = new Session( parameter )
      expect( session.ip ).toEqual( ip )
      expect( session.avgTime ).toEqual( parseFloat( avgTime ) )
      expect( session.totalTime ).toEqual( parseFloat( totalTime ) )
      expect( session.sessionStart ).toEqual( sessionStart )
    } 
  )

  test( `valid constructor`, () => { 
    const session =  new Session( { ip, sessionStart } )
    expect( session.ip ).toEqual( ip )
    expect( session.avgTime ).toEqual( undefined )
    expect( session.totalTime ).toEqual( undefined )
    expect( session.sessionStart ).toEqual( sessionStart )
  } )

  test.each( invalidSessions )( 
    `invalid constructor`,
    parameter => expect( () => new Session( parameter ) ).toThrow()
  )

  test( `pk`, () => expect( new Session( { ip, avgTime, totalTime, sessionStart } ).pk() ).toEqual( {
    'S': `VISITOR#${ ip }`
  } ) )

  test( `key`, () => expect( new Session( { ip, avgTime, totalTime, sessionStart } ).key() ).toEqual( {
    'PK': { 'S': `VISITOR#${ ip }` },
    'SK': { 'S': `SESSION#${ sessionStart.toISOString() }` }
  } ) )

  test( `gsi2pk`, () => expect( new Session( { ip, avgTime, totalTime, sessionStart } ).gsi2pk() ).toEqual( {
    'S': `SESSION#${ ip }#${ sessionStart.toISOString() }`
  } ) )

  test( `gsi2`, () => expect( new Session( { ip, avgTime, totalTime, sessionStart } ).gsi2() ).toEqual( {
    'GSI2PK': { 'S': `SESSION#${ ip }#${ sessionStart.toISOString() }` },
    'GSI2SK': { 'S': `#SESSION` }
  } ) )

  test( `toItem`, () => expect( new Session( { ip, avgTime, totalTime, sessionStart } ).toItem() ).toEqual( {
    'PK': { 'S': `VISITOR#${ ip }` },
    'SK': { 'S': `SESSION#${ sessionStart.toISOString() }` },
    'GSI2PK': { 'S': `SESSION#${ ip }#${ sessionStart.toISOString() }` },
    'GSI2SK': { 'S': `#SESSION` },
    'Type': { 'S': `session` },
    'AverageTime': { 'N': avgTime.toString() },
    'TotalTime': { 'N': totalTime.toString() }
  } ) )

  test( `toItem`, () => expect( new Session( { ip, sessionStart } ).toItem() ).toEqual( {
    'PK': { 'S': `VISITOR#${ ip }` },
    'SK': { 'S': `SESSION#${ sessionStart.toISOString() }` },
    'GSI2PK': { 'S': `SESSION#${ ip }#${ sessionStart.toISOString() }` },
    'GSI2SK': { 'S': `#SESSION` },
    'Type': { 'S': `session` },
    'AverageTime': { 'NULL': true },
    'TotalTime': { 'NULL': true }
  } ) )

  test( `sessionFromItem`, () => {
    const session = new Session( { ip, avgTime, totalTime, sessionStart } )
    expect( sessionFromItem( session.toItem() ) ).toEqual( session )
  } )

  test( `sessionFromItem`, () => {
    const session = new Session( { ip, sessionStart } )
    expect( sessionFromItem( session.toItem() ) ).toEqual( session )
  } )
} )