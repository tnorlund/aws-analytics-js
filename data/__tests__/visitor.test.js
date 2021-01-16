const { 
  addVisitor, getVisitor,
  incrementNumberSessions, decrementNumberSessions
} = require( `../` )
const { Visitor } = require( `../../entities` )

describe( `addVisitor`, () => {
  test( `A visitor can be added to the table`, async () => {
    const visitor = new Visitor( { ip: `0.0.0.0` } )
    const result = await addVisitor( `test-table`, visitor )
    expect( result ).toEqual( { visitor } )
  } )

  test( `Returns an error when the visitor exists`, async () => {
    const visitor = new Visitor( { ip: `0.0.0.0` } )
    await addVisitor( `test-table`, visitor )
    const result = await addVisitor( `test-table`, visitor )
    expect( result ).toEqual( { 'error': `Visitor already in table` } )
  } )

  test( `Returns an error when the table does not exist`, async () => {
    const visitor = new Visitor( { ip: `0.0.0.0` } )
    const result = await addVisitor( `not-a-table`, visitor )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no visitor object is given`, async () => {
    await expect(
      addVisitor( `test-table` )
    ).rejects.toThrow( `Must give visitor` )
  } )

  test( `Throws an error when no table name is given.`, async () => {
    await expect(
      addVisitor()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `getVisitor`, () => {
  test( `A visitor can be queried from the table`, async () => {
    const visitor = new Visitor( { ip: `0.0.0.0` } )
    await addVisitor( `test-table`, visitor )
    const result = await getVisitor( `test-table`, visitor )
    expect( result ).toEqual( { visitor } )
  } )

  test( `Returns an error when the visitor does not exists`, async () => {
    const visitor = new Visitor( { ip: `0.0.0.0` } )
    const result = await getVisitor( `test-table`, visitor )
    expect( result ).toEqual( { 'error': `Visitor does not exist` } )
  } )

  test( `Returns an error when the table does not exist`, async () => {
    const visitor = new Visitor( { ip: `0.0.0.0` } )
    const result = await getVisitor( `not-a-table`, visitor )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no visitor object is given`, async () => {
    await expect(
      getVisitor( `test-table` )
    ).rejects.toThrow( `Must give visitor` )
  } )

  test( `Throws an error when no table name is given.`, async () => {
    await expect(
      getVisitor()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `incrementNumberSessions`, () => {
  test( `The number of sessions the visitor has can be incremented`, 
    async () => { 
      let visitor = new Visitor( { ip: `0.0.0.0` } )
      let result = await addVisitor( `test-table`, visitor )
      result = await incrementNumberSessions( `test-table`, visitor )
      visitor.numberSessions += 1
      expect( result ).toEqual( { visitor } )
    } 
  )

  test( `Returns an error when the visitor does not exists`, async () => {
    let visitor = new Visitor( { ip: `0.0.0.0` } )
    const result = await incrementNumberSessions( `test-table`, visitor )
    expect( result ).toEqual( { 'error': `Visitor does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    let visitor = new Visitor( { ip: `0.0.0.0` } )
    const result = await incrementNumberSessions( `not-a-table`, visitor )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no visitor object is given`, async () => {
    await expect(
      incrementNumberSessions( `test-table` )
    ).rejects.toThrow( `Must give visitor` )
  } )
  
  test( `Throws an error when no table name is given.`, async () => {
    await expect( 
      incrementNumberSessions()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `decrementNumberSessions`, () => {
  test( `The number of sessions the visitor has can be decremented`, 
    async () => { 
      let visitor = new Visitor( { ip: `0.0.0.0`, numberSessions: 2 } )
      let result = await addVisitor( `test-table`, visitor )
      result = await decrementNumberSessions( `test-table`, visitor )
      visitor.numberSessions -= 1
      expect( result ).toEqual( { visitor } )
    } 
  )

  test( `Returns an error when the visitor does not exists`, async () => {
    let visitor = new Visitor( { ip: `0.0.0.0` } )
    const result = await decrementNumberSessions( `test-table`, visitor )
    expect( result ).toEqual( { 'error': `Visitor does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    let visitor = new Visitor( { ip: `0.0.0.0` } )
    const result = await decrementNumberSessions( `not-a-table`, visitor )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no visitor object is given`, async () => {
    await expect(
      decrementNumberSessions( `test-table` )
    ).rejects.toThrow( `Must give visitor` )
  } )
  
  test( `Throws an error when no table name is given.`, async () => {
    await expect( 
      decrementNumberSessions()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )