const {
  addBlog,
  addUser,
  addProject,
  addProjectFollow
} = require( `..` )
const { Blog, User, Project, ProjectFollow } = require( `../../entities` )

describe( `addProjectFollow`, () => {
  test( `A user can follow a project`, async () => {
    const blog = new Blog( {} )
    const user = new User( {
      name: `Tyler`, email: `me@me.com`
    } )
    const project = new Project( {
      slug: `/`, title: `Tyler Norlund`
    } )
    const projectFollow = new ProjectFollow( {
      userName: `Tyler`, userNumber: 1, userFollowNumber: 1, email: `me@me.com`,
      slug: `/`, title: `Tyler Norlund`, projectFollowNumber: 1
    } )
    await addBlog( `test-table`, blog )
    const user_response = await addUser( `test-table`, user )
    const project_response = await addProject( `test-table`, project )
    result = await addProjectFollow( 
      `test-table`, user_response.user, project_response.project 
    )
    expect( { ...result.projectFollow, dateFollowed: undefined } ).toEqual( { 
      ...projectFollow, dateFollowed: undefined
    } )
  } )

  test( `Returns an error when the project is in the table`, async () => {
    const blog = new Blog( {} )
    const user = new User( {
      name: `Tyler`, email: `me@me.com`
    } )
    const project = new Project( {
      slug: `/`, title: `Tyler Norlund`
    } )
    await addBlog( `test-table`, blog )
    const user_response = await addUser( `test-table`, user )
    const project_response = await addProject( `test-table`, project )
    await addProjectFollow( 
      `test-table`, user_response.user, project_response.project 
    )
    result = await addProjectFollow( 
      `test-table`, user_response.user, project_response.project 
    )   
    expect( result ).toEqual( {
      error: `'Tyler' is already following 'Tyler Norlund'`
    } )
  } )

  test( `Returns an error when the project does not exist`, async () => {
    const blog = new Blog( {} )
    const user = new User( {
      name: `Tyler`, email: `me@me.com`
    } )
    const project = new Project( {
      slug: `/`, title: `Tyler Norlund`
    } )
    await addBlog( `test-table`, blog )
    const user_response = await addUser( `test-table`, user )
    const result = await addProjectFollow( 
      `test-table`, user_response.user, project
    )
    expect( result ).toEqual( {
      error: `Project does not exist`
    } )
  } )

  test( `Returns an error when the user does not exist`, async () => {
    const blog = new Blog( {} )
    const user = new User( {
      name: `Tyler`, email: `me@me.com`
    } )
    const project = new Project( {
      slug: `/`, title: `Tyler Norlund`
    } )
    await addBlog( `test-table`, blog )
    await addProject( `test-table`, project )
    const result = await addProjectFollow( 
      `test-table`, user, project
    )
    expect( result ).toEqual( {
      error: `User does not exist`
    } )
  } )

  test( `Throws an error when no user object is given`, async () => {
    await expect(
      addProjectFollow( `test-table` )
    ).rejects.toThrow( `Must give user` )
  } )

  test( `Throws an error when no project object is given`, async () => {
    const user = new User( {
      name: `Tyler`, email: `me@me.com`
    } )
    await expect(
      addProjectFollow( `test-table`, user )
    ).rejects.toThrow( `Must give project` )
  } )

  test( `Throws an error when no table name is given.`, async () => {
    await expect(
      addProjectFollow()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )