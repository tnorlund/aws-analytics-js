const { addUserToBlog } = require( `./addUserToBlog` )
const { getUser } = require( `./getUser` )
const { getUserDetails } = require( `./getUserDetails` )
const { addTOSToUser } = require( `./addTOStoUser` )
const { addProjectToBlog } = require( `./addProjectToBlog` )
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
  incrementNumberUsers, decrementNumberUsers,
  incrementNumberPosts, decrementNumberPosts,
  incrementNumberProjects, decrementNumberProjects
} = require( `./blog` )

module.exports = {
  // Blog
  addBlog, getBlog, updateBlog, resetBlog,
  incrementNumberUsers, decrementNumberUsers,
  incrementNumberPosts, decrementNumberPosts,
  incrementNumberProjects, decrementNumberProjects,

  addUserToBlog,
  getUser,
  getUserDetails,
  addTOSToUser,
  addProjectToBlog,
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