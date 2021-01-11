const { 
  addBlog, addPost, addUser,
  addComment
} = require( `..` )

const { Blog, User, Post, Comment, Vote } = require( `../../entities` )

describe( `addComment`, () => {
  test( `A comment can be added to the table`, async () => {
    const blog = new Blog( {} )
    const user = new User( { name: `Tyler`, email: `me@me.com` } )
    const post = new Post( { slug: `/`, title: `Tyler Norlund` } )
    const comment = new Comment( {
      userNumber: 1, userCommentNumber: 1, userName: `Tyler`, slug: `/`, 
      text: `This is a new comment.`, vote: 1, numberVotes: 1
    } )
    const vote = new Vote( { 
      userNumber: 1, userName: `Tyler`, slug: `/`, voteNumber: 1, up: true,
      replyChain: [ comment.dateAdded ]
    } )
    await addBlog( `test-table`, blog )
    await addPost( `test-table`, post )
    await addUser( `test-table`, user )
    const result = await addComment( 
      `test-table`, user, post, `This is a new comment.`
    )
    expect( { 
      comment: { 
        ...result.comment, dateAdded: undefined 
      },
      vote: {
        ...result.vote, dateAdded: undefined, replyChain: undefined
      }
    } ).toEqual( { 
      comment: { ...comment, dateAdded: undefined }, 
      vote: { ...vote, dateAdded: undefined, replyChain: undefined }
    } )
  } )

  test( `A comment reply can be added to the table`, async () => {
    const blog = new Blog( {} )
    const user = new User( { name: `Tyler`, email: `me@me.com` } )
    const post = new Post( { slug: `/`, title: `Tyler Norlund` } )
    const comment = new Comment( {
      userNumber: 1, userCommentNumber: 2, userName: `Tyler`, slug: `/`, 
      text: `This is a reply.`, vote: 1, numberVotes: 1
    } )
    const vote = new Vote( { 
      userNumber: 1, userName: `Tyler`, slug: `/`, voteNumber: 1, up: true,
      replyChain: [ comment.dateAdded ]
    } )
    await addBlog( `test-table`, blog )
    await addPost( `test-table`, post )
    await addUser( `test-table`, user )
    const first_comment = await addComment( 
      `test-table`, user, post, `This is a new comment.`
    )
    const second_comment = await addComment( 
      `test-table`, user, post, `This is a reply.`, 
      [ first_comment.comment.dateAdded ]
    )
    expect( { 
      comment: { 
        ...second_comment.comment, dateAdded: undefined 
      },
      vote: {
        ...second_comment.vote, dateAdded: undefined, replyChain: undefined
      }
    } ).toEqual( { 
      comment: { 
        ...comment, 
        replyChain: [ first_comment.comment.dateAdded ], 
        dateAdded: undefined 
      }, 
      vote: { ...vote, dateAdded: undefined, replyChain: undefined }
    } )
  } )

  test( `Returns error when the user does not exist`, async () => {
    const user = new User( { name: `Tyler`, email: `me@me.com` } )
    const post = new Post( { slug: `/`, title: `Tyler Norlund` } )
    const result = await addComment( 
      `test-table`, user, post, `This is a new comment.`
    )
    expect( result ).toEqual( { 'error': `User does not exist` } )
  } )

  test( `Returns error when the post does not exist`, async () => {
    const user = new User( { name: `Tyler`, email: `me@me.com` } )
    const post = new Post( { slug: `/`, title: `Tyler Norlund` } )
    await addBlog( `test-table`, new Blog( {} ) )
    await addUser( `test-table`, user )
    const result = await await addComment( 
      `test-table`, user, post, `This is a new comment.`
    )
    expect( result ).toEqual( { 'error': `Post does not exist` } )
  } )

  test( `Returns error when the table does not exist`, async () => {
    const user = new User( { name: `Tyler`, email: `me@me.com` } )
    const post = new Post( { slug: `/`, title: `Tyler Norlund` } )
    const result = await addComment( 
      `not-a-table`, user, post, `This is a new comment.`
    )
    expect( result ).toEqual( { 'error': `Table does not exist` } )
  } )

  test( `Throws an error when no user object is given.`, async () => {
    await expect( 
      addComment( `test-table` )
    ).rejects.toThrow( `Must give user` )
  } )

  test( `Throws an error when no post object is given.`, async () => {
    const user = new User( { name: `Tyler`, email: `me@me.com` } )
    await expect( 
      addComment( `test-table`, user )
    ).rejects.toThrow( `Must give post` )
  } )

  test( `Throws an error when no comment text is given.`, async () => {
    const user = new User( { name: `Tyler`, email: `me@me.com` } )
    const post = new Post( { slug: `/`, title: `Tyler Norlund` } )
    await expect( 
      addComment( `test-table`, user, post )
    ).rejects.toThrow( `Must give the text of the comment` )
  } )
  
  test( `Throws an error when no table name is given.`, async () => {
    await expect( 
      addComment()
    ).rejects.toThrow( `Must give the name of the DynamoDB table` )
  } )
} )