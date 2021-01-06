const { createBlog, getBlog } = require( `..` )
const { Blog } = require( `../../entities` )

test( `A blog can be queried from the table`, async () => { 
  const blog = new Blog( {} )
  let result = await createBlog( `test-table`, blog )
  result = await getBlog( `test-table` )
  expect( result ).toEqual( { 'blog': blog } )
} )