const {
  addVisit, addVisits, getVisit
} = require( `../` )
const { Visit } = require( `../../entities` )

const visit = new Visit( {
  date: new Date(), 
  ip: `0.0.0.0`, 
  user: `0`, 
  title: `Tyler Norlund`, 
  slug: `/`, 
  sessionStart: new Date()
} )

describe( `addVisit`, () => {
  test( `A visit can be added to the table`, async () => {
    const result = await addVisit( `test-table`, visit )
    expect( result ).toEqual( { visit } )
  } )

  test( `Returns an error when the table does not exists`, async () => {
    const result = await addVisit( `not-a-table`, visit )
    expect( result ).toEqual( { error: `Table does not exist` } )
  } )

  test( `Returns an error when the visit exists`, async () => {
    await addVisit( `test-table`, visit )
    const result = await addVisit( `test-table`, visit )
    expect( result ).toEqual( { error: `Visit already exists` } )
  } )

  test( `Throws an error when no visit object is given`, async () => {
    await expect(
      addVisit( `test-table` )
    ).rejects.toThrow( `Must give visit` )
  } )

  test( `Throws an error when no table is given`, async () => {
    await expect(
      addVisit()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `addVisits`, () => {
  test( `Visits can be added to the table`, async () => {
    const result = await addVisits( `test-table`, [visit] )
    expect( result ).toEqual( { visits: [visit] } )
  } )

  test( `Returns an error when the table does not exists`, async () => {
    const result = await addVisits( `not-a-table`, [visit] )
    expect( result ).toEqual( { error: `Table does not exist` } )
  } )

  test( `Returns an error when the visit exists`, async () => {
    await addVisit( `test-table`, visit )
    const result = await addVisits( `test-table`, [visit] )
    expect( result ).toEqual( { error: `Visit already exists` } )
  } )

  test( `Throws an error when no visit object is given`, async () => {
    await expect(
      addVisits( `test-table` )
    ).rejects.toThrow( `Must give visits` )
  } )

  test( `Throws an error when no table is given`, async () => {
    await expect(
      addVisits()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `getVisit`, () => {
  test( `A visit can be queried from the table`, async () => {
    await addVisit( `test-table`, visit )
    const result = await getVisit( `test-table`, visit )
    expect( result ).toEqual( { visit } )
  } )

  test( `Returns error when visit is not in the table`, async () => {
    const result = await getVisit( `test-table`, visit )
    expect( result ).toEqual( { 'error': `Visit does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    const result = await getVisit( `not-a-table`, visit )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no visit object is given`, async () => {
    await expect(
      getVisit( `test-table` )
    ).rejects.toThrow( `Must give visit` )
  } )

  test( `Throws an error when no table name is given.`, async () => {
    await expect(
      getVisit()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )