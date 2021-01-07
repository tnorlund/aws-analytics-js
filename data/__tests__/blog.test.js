const { createBlog, getBlog, incrementNumberPosts } = require( `..` )
const { Blog } = require( `../../entities` )


describe( `createBlog`, () => {
  test( `Default blog can be added to the table`, async () => {
    const blog = new Blog( {} )
    const result = await createBlog( `test-table`, blog )
    expect( result ).toEqual( { 'blog': blog } )
  } )

  test( `Blog with specific attributes can be added to the table`,
    async () => {
      const blog = new Blog( {
        numberUsers: 1, numberPosts: 1, numberProjects: 1
      } )
      const result = await createBlog( `test-table`, blog )
      expect( result ).toEqual( { 'blog': blog } )
    }
  )

  test( `Returns error when a blog is in the table`, async () => {
    const blog = new Blog( { } )
    let result = await createBlog( `test-table`, blog )
    result = await createBlog( `test-table`, blog )
    expect( result ).toEqual( { 'error': `Blog already exists` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    const result = await createBlog( `table-not-exist`, new Blog( {} ) )
    expect( result ).toEqual( { 'error': `Could not create Blog` } )
  } )

  test( `Throws an error when no blog object is given`, async () => {
    await expect(
      createBlog( `test-table` )
    ).rejects.toThrow( `Must give blog` )
  } )

  test( `Throws an error when no table name is given.`, async () => {
    await expect(
      createBlog()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `getBlog`, () => {
  test( `A blog can be queried from the table`, async () => {
    const blog = new Blog( {} )
    let result = await createBlog( `test-table`, blog )
    result = await getBlog( `test-table` )
    expect( result ).toEqual( { 'blog': blog } )
  } )

  test( `Returns error when no blog is in the table`, async () => {
    const result = await getBlog( `test-table` )
    expect( result ).toEqual( { 'error': `Blog does not exist` } )
  } )


  test( `Returns error when the table does not exist`, async () => {
    const result = await getBlog( `not-a-table` )
    expect( result ).toEqual( { 'error': `Could not retrieve blog` } )
  } )


  test( `Throws an error when no table name is given.`, async () => {
    await expect(
      getBlog()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )

describe( `incrementNumberPosts`, () => {
  test( `The number of posts the blog has can be incremented`, async () => { 
    let blog = new Blog( {} )
    let result = await createBlog( `test-table`, blog )
    result = await incrementNumberPosts( `test-table` )
    blog.numberPosts += 1
    expect( result ).toEqual( { 'blog': blog } )
  } )

  test( `An error is returned when no blog is in the table`, async () => {
    const result = await incrementNumberPosts( `test-table` )
    expect( result ).toEqual( { 'error': `Blog does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    const result = await incrementNumberPosts( `not-a-table` )
    expect( result ).toEqual( { 
      'error': `Could not increment number of blog posts` 
    } )
  } )
  
  test( `Throws an error when no table name is given.`, async () => {
    await expect( 
      incrementNumberPosts()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )
