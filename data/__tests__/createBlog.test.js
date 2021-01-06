const { createBlog } = require( `..` )
const { Blog } = require( `../../entities` )

test( `A new blog can be added to the table`, async () => { 
  const blog = new Blog( {} )
  const result = await createBlog( `test-table`, blog )
  expect( result ).toEqual( { 'blog': blog } )
} )

test( `A new blog with specific attributes can be added to the table`, async () => { 
  const blog = new Blog( { numberUsers: 1, numberPosts: 1, numberProjects: 1 } )
  const result = await createBlog( `test-table`, blog )
  expect( result ).toEqual( { 'blog': blog } )
} )

test( `Fails when there is already a blog in the table`, async () => { 
  const blog = new Blog( { numberUsers: 1, numberPosts: 1, numberProjects: 1 } )
  let result = await createBlog( `test-table`, blog )
  result = await createBlog( `test-table`, blog )
  expect( result ).toEqual( { 'error': `Blog already exists` } )
} )

test( `An error is returned when no blog is in the table`, async () => { 
  const result = await createBlog( `not-a-table` )
  expect( result ).toEqual( { 'error': `Could not create Blog` } )
} )

test( `Throws an error when no table name is given.`, async () => {
  await expect( 
    createBlog()
  ).rejects.toThrow( `Must give the name of the DynamoDB table` )
} )
