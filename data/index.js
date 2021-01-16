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
  addSession, getSession 
} = require( `./session` )

const {
  addUser, getUser, getUserDetails, updateUserName,
  incrementNumberUserFollows, decrementNumberUserFollows,
  incrementNumberUserComments, decrementNumberUserComments,
  incrementNumberUserVotes, decrementNumberUserVotes
} = require( `./user` )

const { addTOS } = require( `./tos` )

const { addVote, removeVote } = require( `./vote` )

const { 
  addVisitor, getVisitor,
  incrementNumberSessions, decrementNumberSessions
} = require( `./visitor` )

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
  // Post
  addPost, getPostDetails, removePost,
  incrementNumberPostComments, decrementNumberPostComments,
  // Session
  addSession, getSession,
  // User
  addUser, getUser, getUserDetails, updateUserName,
  incrementNumberUserFollows, decrementNumberUserFollows,
  incrementNumberUserComments, decrementNumberUserComments,
  incrementNumberUserVotes, decrementNumberUserVotes,
  // TOS
  addTOS,
  // Vote
  addVote, removeVote,
  // Visitor
  addVisitor, getVisitor,
  incrementNumberSessions, decrementNumberSessions
}