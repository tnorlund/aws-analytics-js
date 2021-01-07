const {
  addProject,
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

