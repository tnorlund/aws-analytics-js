const {
  addProject,
  incrementNumberProjectFollows, decrementNumberProjectFollows,
  addBlog
} = require( `..` )
const { Blog, Project } = require( `../../entities` )

describe( `addProject`, () => {
  test( `A project can be added from to the table`, async () => {
    let blog = new Blog( {} )
    const project = new Project( {
      slug: `/`, title: `Tyler Norlund`
    } )
    await addBlog( `test-table`, blog )
    const result = await addProject( `test-table`, project )
    expect( result ).toEqual( { project } )
  } )

  test( `Returns an error when the project is in the table`, async () => {
    let blog = new Blog( {} )
    const project = new Project( {
      slug: `/`, title: `Tyler Norlund`
    } )
    await addBlog( `test-table`, blog )
    await addProject( `test-table`, project )
    const result = await addProject( `test-table`, project )
    expect( result ).toEqual( {
      error: `Could not add '${ project.title}' to table`
    } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    let blog = new Blog( {} )
    const project = new Project( {
      slug: `/`, title: `Tyler Norlund`
    } )
    await addBlog( `test-table`, blog )
    const result = await addProject( `table-not-exist`, project )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no project object is given`, async () => {
    await expect(
      addProject( `test-table` )
    ).rejects.toThrow( `Must give project` )
  } )

  test( `Throws an error when no table name is given.`, async () => {
    await expect(
      addProject()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `incrementNumberProjectFollows`, () => {
  test( `The number of follows the project has can be incremented`, async () => { 
    let project = new Project( {
      slug: `/`, title: `Tyler Norlund`
    } )
    await addBlog( `test-table`, new Blog( {} ) )
    let result = await addProject( `test-table`, project )
    result = await incrementNumberProjectFollows( `test-table`, result.project )
    project.numberFollows += 1
    expect( result.project ).toEqual( project )
  } )

  test( `Returns error when no blog is in the table`, async () => {
    const project = new Project( {
      slug: `/`, title: `Tyler Norlund`
    } )
    const result = await incrementNumberProjectFollows( `test-table`, project )
    expect( result ).toEqual( { 'error': `Blog does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    const project = new Project( {
      slug: `/`, title: `Tyler Norlund`
    } )
    const result = await incrementNumberProjectFollows( `not-a-table`, project )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no project object is given`, async () => {
    await expect(
      incrementNumberProjectFollows( `test-table` )
    ).rejects.toThrow( `Must give project` )
  } )
  
  test( `Throws an error when no table name is given.`, async () => {
    await expect( 
      incrementNumberProjectFollows()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `decrementNumberProjectFollows`, () => {
  test( `The number of follows the project has can be decremented`, async () => { 
    let project = new Project( {
      slug: `/`, title: `Tyler Norlund`, numberFollows: 1
    } )
    await addBlog( `test-table`, new Blog( {} ) )
    let result = await addProject( `test-table`, project )
    result = await decrementNumberProjectFollows( 
      `test-table`, result.project 
    )
    project.numberFollows -= 1
    expect( result.project ).toEqual( project )
  } )

  test( `Returns error when no blog is in the table`, async () => {
    const project = new Project( {
      slug: `/`, title: `Tyler Norlund`
    } )
    const result = await decrementNumberProjectFollows( `test-table`, project )
    expect( result ).toEqual( { 'error': `Blog does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    const project = new Project( {
      slug: `/`, title: `Tyler Norlund`
    } )
    const result = await decrementNumberProjectFollows( `not-a-table`, project )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no project object is given`, async () => {
    await expect(
      decrementNumberProjectFollows( `test-table` )
    ).rejects.toThrow( `Must give project` )
  } )
  
  test( `Throws an error when no table name is given.`, async () => {
    await expect( 
      decrementNumberProjectFollows()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )
