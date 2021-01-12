const { getUserDetails } = require( `./getUserDetails` )
// const { addTOSToUser } = require( `./addTOStoUser` )
// const { removeProject } = require( `./removeProject` )
// const { updateProject } = require( `./updateProject` )
// const { addCommentToPost } = require( `./addCommentToPost` )
// const { getPostDetails } = require( `./getPostDetails` )
const { removeCommentFromPost } = require( `./removeCommentFromPost` )
const { removePost } = require( `./removePost` )
const { addVote } = require( `./addVote` )
const { removeVote } = require( `./removeVote` )
// const { addReplyToComment } = require( `./addReplyToComment` )
const { updateUserName } = require( `./updateUserName` )

const {
  addBlog, getBlog, updateBlog, resetBlog,
  incrementNumberBlogUsers, decrementNumberBlogUsers,
  incrementNumberBlogPosts, decrementNumberBlogPosts,
  incrementNumberBlogProjects, decrementNumberBlogProjects
} = require( `./blog` )

const { 
  addComment, getComment, 
  incrementNumberCommentVotes, decrementNumberCommentVotes,
  incrementCommentVote, decrementCommentVote
} = require( `./comment` )
const {
  addProject, getProject, getProjectDetails, updateProject, removeProject,
  incrementNumberProjectFollows, decrementNumberProjectFollows
} = require( `./project` )

const {
  addProjectFollow, removeProjectFollow
} = require( `./projectFollow` )

const {
  addPost, getPostDetails,
  incrementNumberPostComments, decrementNumberPostComments
} = require( `./post` )

const {
  addUser, getUser,
  incrementNumberUserFollows, decrementNumberUserFollows,
  incrementNumberUserComments, decrementNumberUserComments,
  incrementNumberUserVotes, decrementNumberUserVotes
} = require( `./user` )

const { addTOS } = require( `./tos` )

module.exports = {
  // Blog
  addBlog, getBlog, updateBlog, resetBlog,
  incrementNumberBlogUsers, decrementNumberBlogUsers,
  incrementNumberBlogPosts, decrementNumberBlogPosts,
  incrementNumberBlogProjects, decrementNumberBlogProjects,
  // Comment
  addComment, getComment,
  incrementNumberCommentVotes, decrementNumberCommentVotes,
  incrementCommentVote, decrementCommentVote,
  // Project
  addProject, getProject, getProjectDetails, updateProject, removeProject,
  incrementNumberProjectFollows, decrementNumberProjectFollows,
  // Project Follow
  addProjectFollow, removeProjectFollow,
  // User
  addUser, getUser,
  incrementNumberUserFollows, decrementNumberUserFollows,
  incrementNumberUserComments, decrementNumberUserComments,
  incrementNumberUserVotes, decrementNumberUserVotes,
  // TOS
  addTOS,
  // Post
  addPost, getPostDetails,
  incrementNumberPostComments, decrementNumberPostComments,

  getUserDetails,
  // addTOSToUser,
  // removeProject,
  // updateProject,
  // addCommentToPost,
  // getPostDetails,
  removeCommentFromPost,
  removePost,
  addVote,
  removeVote,
  // addReplyToComment,
  updateUserName
}