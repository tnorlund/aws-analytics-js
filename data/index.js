const {
  addBlog, getBlog, updateBlog, resetBlog,
  incrementNumberBlogUsers, decrementNumberBlogUsers,
  incrementNumberBlogPosts, decrementNumberBlogPosts,
  incrementNumberBlogProjects, decrementNumberBlogProjects
} = require( `./blog` )

const { 
  addComment, getComment, removeComment,
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
  addPost, getPostDetails, removePost,
  incrementNumberPostComments, decrementNumberPostComments
} = require( `./post` )

const {
  addUser, getUser, getUserDetails, updateUserName,
  incrementNumberUserFollows, decrementNumberUserFollows,
  incrementNumberUserComments, decrementNumberUserComments,
  incrementNumberUserVotes, decrementNumberUserVotes
} = require( `./user` )

const { addTOS } = require( `./tos` )

const { addVote, removeVote } = require( `./vote` )

module.exports = {
  // Blog
  addBlog, getBlog, updateBlog, resetBlog,
  incrementNumberBlogUsers, decrementNumberBlogUsers,
  incrementNumberBlogPosts, decrementNumberBlogPosts,
  incrementNumberBlogProjects, decrementNumberBlogProjects,
  // Comment
  addComment, getComment, removeComment,
  incrementNumberCommentVotes, decrementNumberCommentVotes,
  incrementCommentVote, decrementCommentVote,
  // Project
  addProject, getProject, getProjectDetails, updateProject, removeProject,
  incrementNumberProjectFollows, decrementNumberProjectFollows,
  // Project Follow
  addProjectFollow, removeProjectFollow,
  // User
  addUser, getUser, getUserDetails, updateUserName,
  incrementNumberUserFollows, decrementNumberUserFollows,
  incrementNumberUserComments, decrementNumberUserComments,
  incrementNumberUserVotes, decrementNumberUserVotes,
  // TOS
  addTOS,
  // Post
  addPost, getPostDetails, removePost,
  incrementNumberPostComments, decrementNumberPostComments,
  // Vote
  addVote, removeVote,
}