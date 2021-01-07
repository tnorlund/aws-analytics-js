const {
  addBlog,
  addUser, 
  incrementNumberFollows, decrementNumberFollows,
  incrementNumberComments, decrementNumberComments,
  incrementNumberVotes, decrementNumberVotes
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
      name: `Tyler`, email: `me@me.com`, numberFollows: 2
    } )
    await addBlog( `test-table`, blog )
    let result = await addUser( `test-table`, user )
    result = await decrementNumberFollows( `test-table`, result.user )
    expect( result.user ).toEqual( { ...user, numberFollows: 1 } )
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

describe( `incrementNumberComments`, () => {
  test( `The number of comments the user has can be incremented`, async () => { 
    let blog = new Blog( {} )
    const user = new User( {
      name: `Tyler`, email: `me@me.com`, numberComments: 0
    } )
    await addBlog( `test-table`, blog )
    let result = await addUser( `test-table`, user )
    result = await incrementNumberComments( `test-table`, result.user )
    expect( result.user ).toEqual( { ...user, numberComments: 1 } )
  } )

  test( `Returns error when no blog is in the table`, async () => {
    let user = new User( {
      name: `Tyler`, email: `me@me.com`
    } )
    const result = await incrementNumberComments( `test-table`, user )
    expect( result ).toEqual( { 'error': `User does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    let user = new User( {
      name: `Tyler`, email: `me@me.com`
    } )
    const result = await incrementNumberComments( `not-a-table`, user )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no user object is given`, async () => {
    await expect(
      incrementNumberComments( `test-table` )
    ).rejects.toThrow( `Must give user` )
  } )
  
  test( `Throws an error when no table name is given.`, async () => {
    await expect( 
      incrementNumberComments()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `decrementNumberComments`, () => {
  test( `The number of comments the user has can be decremented`, async () => { 
    let blog = new Blog( {} )
    const user = new User( {
      name: `Tyler`, email: `me@me.com`, numberComments: 1
    } )
    await addBlog( `test-table`, blog )
    let result = await addUser( `test-table`, user )
    result = await decrementNumberComments( `test-table`, result.user )
    expect( result.user ).toEqual( { ...user, numberComments: 0 } )
  } )

  test( `Returns error when no blog is in the table`, async () => {
    const user = new User( {
      name: `Tyler`, email: `me@me.com`
    } )
    const result = await decrementNumberComments( `test-table`, user )
    expect( result ).toEqual( { 'error': `User does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    const user = new User( {
      name: `Tyler`, email: `me@me.com`
    } )
    const result = await decrementNumberComments( `not-a-table`, user )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no user object is given`, async () => {
    await expect(
      decrementNumberComments( `test-table` )
    ).rejects.toThrow( `Must give user` )
  } )
  
  test( `Throws an error when no table name is given.`, async () => {
    await expect( 
      decrementNumberComments()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `incrementNumberVotes`, () => {
  test( `The number of votes the user has can be incremented`, async () => { 
    let blog = new Blog( {} )
    const user = new User( {
      name: `Tyler`, email: `me@me.com`, numberVotes: 0
    } )
    await addBlog( `test-table`, blog )
    let result = await addUser( `test-table`, user )
    result = await incrementNumberVotes( `test-table`, result.user )
    expect( result.user ).toEqual( { ...user, numberVotes: 1 } )
  } )

  test( `Returns error when no blog is in the table`, async () => {
    let user = new User( {
      name: `Tyler`, email: `me@me.com`
    } )
    const result = await incrementNumberVotes( `test-table`, user )
    expect( result ).toEqual( { 'error': `User does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    let user = new User( {
      name: `Tyler`, email: `me@me.com`
    } )
    const result = await incrementNumberVotes( `not-a-table`, user )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no user object is given`, async () => {
    await expect(
      incrementNumberVotes( `test-table` )
    ).rejects.toThrow( `Must give user` )
  } )
  
  test( `Throws an error when no table name is given.`, async () => {
    await expect( 
      incrementNumberVotes()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `decrementNumberVotes`, () => {
  test( `The number of comments the user has can be decremented`, async () => { 
    let blog = new Blog( {} )
    const user = new User( {
      name: `Tyler`, email: `me@me.com`, numberVotes: 1
    } )
    await addBlog( `test-table`, blog )
    let result = await addUser( `test-table`, user )
    result = await decrementNumberVotes( `test-table`, result.user )
    expect( result.user ).toEqual( { ...user, numberVotes: 0 } )
  } )

  test( `Returns error when no blog is in the table`, async () => {
    const user = new User( {
      name: `Tyler`, email: `me@me.com`
    } )
    const result = await decrementNumberVotes( `test-table`, user )
    expect( result ).toEqual( { 'error': `User does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    const user = new User( {
      name: `Tyler`, email: `me@me.com`
    } )
    const result = await decrementNumberVotes( `not-a-table`, user )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no user object is given`, async () => {
    await expect(
      decrementNumberVotes( `test-table` )
    ).rejects.toThrow( `Must give user` )
  } )
  
  test( `Throws an error when no table name is given.`, async () => {
    await expect( 
      decrementNumberVotes()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )