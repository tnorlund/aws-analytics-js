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