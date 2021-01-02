const { Visitor, visitorFromItem } = require( `..` )

const ip = `0.0.0.0`

const validVisitors = [
  { ip },
  { ip, numberSessions: `0` },
  { ip, numberSessions: 0 },
]

const invalidVisitors = [
  {},
  { ip: `something` },
  { ip, numberSessions: `something` },
  { ip, numberSessions: `-1` }
]

describe( `visitor object`, () => {
  test.each( validVisitors )(
    `valid constructor`,
    parameter => {
      const visitor = new Visitor( parameter )
      expect( visitor.ip ).toEqual( ip )
      expect( visitor.numberSessions ).toEqual( 0 )
    }
  )

  test.each( invalidVisitors )(
    `invalid constructor`,
    parameter => expect( () => new Visitor( parameter ) ).toThrow()
  )

  test( `pk`, () => expect( new Visitor( { ip } ).pk() ).toEqual( { 'S': `VISITOR#${ ip }` } ) )

  test( `key`, () => expect( new Visitor( { ip } ).key() ).toEqual( {
    'PK': { 'S': `VISITOR#${ ip }` },
    'SK': { 'S': `#VISITOR` }
  } ) )

  test( `toItem`, () => expect( new Visitor( { ip } ).toItem() ).toEqual( {
    'PK': { 'S': `VISITOR#${ ip }` },
    'SK': { 'S': `#VISITOR` },
    'Type': { 'S': `visitor` },
    'NumberSessions': { 'N': `0` }
  } ) )

  test( `visitorFromItem`, () => {
    const visitor = new Visitor( { ip } )
    expect( visitorFromItem( visitor.toItem() ) ).toEqual( visitor )
  } )
} )