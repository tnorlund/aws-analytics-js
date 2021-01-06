const { createBlog, getBlog } = require( `..` )
const { Blog } = require( `../../entities` )

test( `A blog can be queried from the table`, async () => { 
  const blog = new Blog( {} )
  let result = await createBlog( `test-table`, blog )
  result = await getBlog( `test-table` )
  expect( result ).toEqual( { 'blog': blog } )
} )

test( `An error is returned when no blog is in the table`, async () => { 
  const result = await getBlog( `test-table` )
  expect( result ).toEqual( { 'error': `Blog does not exist` } )
} )


test( `An error is returned when no blog is in the table`, async () => { 
  const result = await getBlog( `not-a-table` )
  expect( result ).toEqual( { 'error': `Could not retrieve blog` } )
} )


test( `Throws an error when no table name is given.`, async () => {
  await expect( 
    getBlog()
  ).rejects.toThrow( `Must give the name of the DynamoDB table` )
} )