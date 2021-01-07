const {
  addPost,
  addBlog
} = require( `..` )
const { Blog, Post } = require( `../../entities` )

describe( `addPost`, () => {
  test( `A post can be added from to the table`, async () => {
    let blog = new Blog( {} )
    const post = new Post( {
      slug: `/`, title: `Tyler Norlund`
    } )
    await addBlog( `test-table`, blog )
    const result = await addPost( `test-table`, post )
    expect( result ).toEqual( { post } )
  } )

  test( `Returns an error when the post is in the table`, async () => {
    let blog = new Blog( {} )
    const post = new Post( {
      slug: `/`, title: `Tyler Norlund`
    } )
    await addBlog( `test-table`, blog )
    await addPost( `test-table`, post )
    const result = await addPost( `test-table`, post )
    expect( result ).toEqual( {
      error: `Could not add '${ post.title }' to table`
    } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    let blog = new Blog( {} )
    const post = new Post( {
      slug: `/`, title: `Tyler Norlund`
    } )
    await addBlog( `test-table`, blog )
    const result = await addPost( `table-not-exist`, post )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no post object is given`, async () => {
    await expect(
      addPost( `test-table` )
    ).rejects.toThrow( `Must give post` )
  } )

  test( `Throws an error when no table name is given.`, async () => {
    await expect(
      addPost()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )
