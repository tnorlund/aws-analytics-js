const {
  addBlog,
  addUser, 
  incrementNumberFollows, decrementNumberFollows
} = require( `..` )
const { Blog, User } = require( `../../entities` )


describe( `addUser`, () => {
  test( `A user can be added from to the table`, async () => {
    let blog = new Blog( {} )
    const user = new User( {
      name: `Tyler`, email: `me@me.com`
    } )
    await addBlog( `test-table`, blog )
    const result = await addUser( `test-table`, user )
    blog.numberUsers += 1
    user.userNumber = blog.numberUsers
    expect( result ).toEqual( { blog, user } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    let blog = new Blog( {} )
    const user = new User( {
      name: `Tyler`, email: `me@me.com`
    } )
    await addBlog( `test-table`, blog )
    const result = await addUser( `table-not-exist`, user )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no user object is given`, async () => {
    await expect(
      addUser( `test-table` )
    ).rejects.toThrow( `Must give user` )
  } )

  test( `Throws an error when no table name is given.`, async () => {
    await expect(
      addUser()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `incrementNumberFollows`, () => {
  test( `The number of follows the user has can be incremented`, async () => { 
    let blog = new Blog( {} )
    const user = new User( {
      name: `Tyler`, email: `me@me.com`, numberFollows: 0
    } )
    await addBlog( `test-table`, blog )
    let result = await addUser( `test-table`, user )
    result = await incrementNumberFollows( `test-table`, result.user )
    expect( result.user ).toEqual( { ...user, numberFollows: 1 } )
  } )

  test( `Returns error when no blog is in the table`, async () => {
    let user = new User( {
      name: `Tyler`, email: `me@me.com`
    } )
    const result = await incrementNumberFollows( `test-table`, user )
    expect( result ).toEqual( { 'error': `User does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    let user = new User( {
      name: `Tyler`, email: `me@me.com`
    } )
    const result = await incrementNumberFollows( `not-a-table`, user )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no user object is given`, async () => {
    await expect(
      incrementNumberFollows( `test-table` )
    ).rejects.toThrow( `Must give user` )
  } )
  
  test( `Throws an error when no table name is given.`, async () => {
    await expect( 
      incrementNumberFollows()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `decrementNumberFollows`, () => {
  test( `The number of follows the user has can be decremented`, async () => { 
    let blog = new Blog( {} )
    const user = new User( {
      name: `Tyler`, email: `me@me.com`, numberFollows: 1
    } )
    await addBlog( `test-table`, blog )
    let result = await addUser( `test-table`, user )
    result = await decrementNumberFollows( `test-table`, result.user )
    expect( result.user ).toEqual( { ...user, numberFollows: 0 } )
  } )

  test( `Returns error when no blog is in the table`, async () => {
    const user = new User( {
      name: `Tyler`, email: `me@me.com`
    } )
    const result = await decrementNumberFollows( `test-table`, user )
    expect( result ).toEqual( { 'error': `User does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    const user = new User( {
      name: `Tyler`, email: `me@me.com`
    } )
    const result = await decrementNumberFollows( `not-a-table`, user )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no user object is given`, async () => {
    await expect(
      decrementNumberFollows( `test-table` )
    ).rejects.toThrow( `Must give user` )
  } )
  
  test( `Throws an error when no table name is given.`, async () => {
    await expect( 
      decrementNumberFollows()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )