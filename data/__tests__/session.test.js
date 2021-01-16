const {
  addVisitor,
  addSession, getSession
} = require( `../` )
const { 
  Visitor, Session 
} = require( `../../entities` )

describe( `addSession`, () => {
  test( `A session can be added to the table`, async () => {
    const visitor = new Visitor( { ip: `0.0.0.0` } )
    const session = new Session( {
      ip: `0.0.0.0`, avgTime: 10.0, totalTime: 100.0, sessionStart: new Date()
    } )
    await addVisitor( `test-table`, visitor )
    const result = await addSession( `test-table`, visitor, session )
    expect( result ).toEqual( { session } )
  } )

  test( `Returns an error when the table does not exists`, async () => {
    const visitor = new Visitor( { ip: `0.0.0.0` } )
    const session = new Session( {
      ip: `0.0.0.0`, avgTime: 10.0, totalTime: 100.0, sessionStart: new Date()
    } )
    const result = await addSession( `not-a-table`, visitor, session )
    expect( result ).toEqual( { error: `Table does not exist` } )
  } )

  test( `Returns an error when the session exists`, async () => {
    const visitor = new Visitor( { ip: `0.0.0.0` } )
    const session = new Session( {
      ip: `0.0.0.0`, avgTime: 10.0, totalTime: 100.0, sessionStart: new Date()
    } )
    await addVisitor( `test-table`, visitor )
    await addSession( `test-table`, visitor, session )
    const result = await addSession( `test-table`, visitor, session )
    expect( result ).toEqual( { error: `Session already in table` } )
  } )

  test( `Returns an error when the visitor does not exists`, async () => {
    const visitor = new Visitor( { ip: `0.0.0.0` } )
    const session = new Session( {
      ip: `0.0.0.0`, avgTime: 10.0, totalTime: 100.0, sessionStart: new Date()
    } )
    const result = await addSession( `test-table`, visitor, session )
    expect( result ).toEqual( { error: `Visitor does not exist` } )
  } )

  test( `Throws an error when no session object is given`, async () => {
    const visitor = new Visitor( { ip: `0.0.0.0` } )
    await expect(
      addSession( `test-table`, visitor )
    ).rejects.toThrow( `Must give session` )
  } )

  test( `Throws an error when no visitor object is given`, async () => {
    await expect(
      addSession( `test-table` )
    ).rejects.toThrow( `Must give visitor` )
  } )

  test( `Throws an error when no table is given`, async () => {
    await expect(
      addSession()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `getSession`, () => {
  test( `A session can be queried from table`, async () => {
    const visitor = new Visitor( { ip: `0.0.0.0` } )
    const session = new Session( {
      ip: `0.0.0.0`, avgTime: 10.0, totalTime: 100.0, sessionStart: new Date()
    } )
    await addVisitor( `test-table`, visitor )
    await addSession( `test-table`, visitor, session )
    const result = await getSession( `test-table`, session )
    expect( result ).toEqual( { session } )
  } )

  test( `Returns an error when the table does not exists`, async () => {
    const session = new Session( {
      ip: `0.0.0.0`, avgTime: 10.0, totalTime: 100.0, sessionStart: new Date()
    } )
    const result = await getSession( `not-a-table`, session )
    expect( result ).toEqual( { error: `Table does not exist` } )
  } )

  test( `Returns an error when the session does not exists`, async () => {
    const session = new Session( {
      ip: `0.0.0.0`, avgTime: 10.0, totalTime: 100.0, sessionStart: new Date()
    } )
    const result = await getSession( `test-table`, session )
    expect( result ).toEqual( { error: `Session does not exist` } )
  } )

  test( `Throws an error when no session object is given`, async () => {
    await expect(
      getSession( `test-table` )
    ).rejects.toThrow( `Must give session` )
  } )

  test( `Throws an error when no table is given`, async () => {
    await expect(
      getSession()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )