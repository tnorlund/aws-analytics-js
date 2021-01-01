const { Blog, blogFromItem } = require( '..' )

const validBlogs = [
  {},
  { numberPosts: `0` },
  { numberProjects: `0` },
  { numberPosts: `0`, numberProjects: `0` },
  { numberUsers: `0` },
  { numberProjects: `0` },
  { numberUsers: `0`, numberProjects: `0` },
  { numberUsers: `0` },
  { numberPosts: `0` },
  { numberUsers: `0`, numberPosts: `0` },
]

const invalidBlogs = [
  { numberUsers: `-1` },
  { numberPosts: `-1` },
  { numberProjects: `-1` },
]

test.each( validBlogs )(
  'blog valid constructor', 
  parameter => expect( new Blog( parameter ) ).toEqual( {
    numberUsers: 0, numberPosts: 0, numberProjects: 0
  } )
)

test.each( invalidBlogs )(
  `blog invalid constructor`,
  parameter => expect( () => new Blog( parameter ) ).toThrow()
)

test( `blog key`, () => {
  expect( new Blog( {} ).key() ).toEqual( {
    'PK': { 'S': `#BLOG` },
    'SK': { 'S': `#BLOG` }
  } )
} )

test( `blog toItem`, () => {
  const blog = new Blog( {} )
  expect( blog.toItem() ).toStrictEqual( {
    'PK': { 'S': `#BLOG` },
    'SK': { 'S': `#BLOG` },
    'Type': { 'S': `blog` },
    'NumberUsers': { 'N': `0` },
    'NumberPosts': { 'N': `0` },
    'NumberProjects': { 'N': `0` }
  } )
} )

test( `blog blogFromItem`, () => {
  const blog = new Blog( {} )
  expect( blogFromItem( blog.toItem() ) ).toStrictEqual( blog )
} )
