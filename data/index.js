const { getUser } = require( `./getUser` )
const { getUserDetails } = require( `./getUserDetails` )
const { addTOSToUser } = require( `./addTOStoUser` )
const { addFollowToProject } = require( `./addFollowToProject` )
const { removeFollowFromProject } = require( `./removeFollowFromProject` )
const { getProject } = require( `./getProject` )
const { addPostToBlog } = require( `./addPostToBlog` )
const { getPost } = require( `./getPost` )
const { getProjectDetails } = require( `./getProjectDetails` )
const { removeProject } = require( `./removeProject` )
const { updateProject } = require( `./updateProject` )
const { addCommentToPost } = require( `./addCommentToPost` )
const { getPostDetails } = require( `./getPostDetails` )
const { removeCommentFromPost } = require( `./removeCommentFromPost` )
const { removePost } = require( `./removePost` )
const { addVote } = require( `./addVote` )
const { removeVote } = require( `./removeVote` )
const { addReplyToComment } = require( `./addReplyToComment` )
const { updateUserName } = require( `./updateUserName` )

const {
  addBlog, getBlog, updateBlog, resetBlog,
  incrementNumberBlogUsers, decrementNumberBlogUsers,
  incrementNumberBlogPosts, decrementNumberBlogPosts,
  incrementNumberBlogProjects, decrementNumberBlogProjects
} = require( `./blog` )

const {
  addProject
} = require( `./project` )

const {
  addPost,
  incrementNumberPostComments, decrementNumberPostComments
} = require( `./post` )

const { 
  addUser,
  incrementNumberUserFollows, decrementNumberUserFollows,
  incrementNumberUserComments, decrementNumberUserComments,
  incrementNumberUserVotes, decrementNumberUserVotes
} = require( `./user` )

module.exports = {
  // Blog
  addBlog, getBlog, updateBlog, resetBlog,
  incrementNumberBlogUsers, decrementNumberBlogUsers,
  incrementNumberBlogPosts, decrementNumberBlogPosts,
  incrementNumberBlogProjects, decrementNumberBlogProjects,
  // Project
  addProject,
  // User
  addUser, getUser,
  incrementNumberUserFollows, decrementNumberUserFollows,
  incrementNumberUserComments, decrementNumberUserComments,
  incrementNumberUserVotes, decrementNumberUserVotes,
  // Post
  addPost,
  incrementNumberPostComments, decrementNumberPostComments,

  getUserDetails,
  addTOSToUser,
  addFollowToProject,
  removeFollowFromProject,
  getProject,
  addPostToBlog,
  getPost,
  getProjectDetails,
  removeProject,
  updateProject,
  addCommentToPost,
  getPostDetails,
  removeCommentFromPost,
  removePost,
  addVote,
  removeVote,
  addReplyToComment,
  updateUserName
}