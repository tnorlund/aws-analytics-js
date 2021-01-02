const { ZeroPadNumber, parseDate, isIP } = require( `../utils` )

describe( `utility functions`, () => {
  describe( `zeroPadNumber`, () => {
    test( `valid parameter`, () => expect( ZeroPadNumber( 0 ) ).toEqual( `000000` ) )
    test( `valid parameter`, () => expect( ZeroPadNumber( 1 ) ).toEqual( `000001` ) )
    test( `valid parameter`, () => expect( ZeroPadNumber( `1` ) ).toEqual( `000001` ) )
    test( `invalid parameter`, () => expect( () => ZeroPadNumber( `something` ) ).toThrow() )
    test( `invalid parameter`, () => expect( () => ZeroPadNumber( `-1` ) ).toThrow() )
  } )

  describe( `parseDate`, () => {
    const date = new Date()
    test( `valid parameter`, () => expect( parseDate( date.toISOString() ) ).toEqual( date ) )
    test( `invalid parameter`, () => expect( () => parseDate( `something` ) ).toThrow() )
  } )

  describe( `isIP`, () => {
    test( `valid parameter`, () => expect( isIP( `0.0.0.0` ) ).toEqual( true ) )
    test( `valid parameter`, () => expect( isIP( `something` ) ).toEqual( false ) )
    test( `invalid parameter`, () => expect( () => isIP( {} ) ).toThrow() )
  } )
} )