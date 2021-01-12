const AWS = require( `aws-sdk` )
const dynamoDB = new AWS.DynamoDB()
const { incrementNumberCommentVotes } = require( `./comment` )
const { Vote } = require( `../entities` )

/**
 * Adds a vote to a comment.
 * @param {String}  tableName  The name of the DynamoDB table.
 * @param {Object}  user       The user adding the vote.
 * @param {Object}  post       The post the user is adding the vote to.
 * @param {Object}  comment    The comment the vote is being applied to.
 * @param {Boolean} up         Whether the vote is an up-vote or a down-vote.
 */
const addVote = async ( tableName, user, post, comment, up ) => {
  if ( typeof tableName == `undefined` )
    throw Error( `Must give the name of the DynamoDB table` )
  if ( typeof user == `undefined` ) throw new Error( `Must give user` )
  if ( typeof post == `undefined` ) throw new Error( `Must give post` )
  if ( typeof comment == `undefined` )
    throw new Error( `Must give comment` )
  if ( typeof up == `undefined` )
    throw new Error( `Must give whether vote is up or down` )
  // The current number of votes is required for the creation of the vote
  // object. Use the response from incrementNumberCommentVotes to determine the
  // number of votes.
  const response = await incrementNumberCommentVotes( tableName, comment )
  if ( response.error ) return response
  const vote = new Vote( {
    userNumber: user.userNumber,
    userName: user.name,
    slug: post.slug,
    replyChain: response.comment.replyChain.concat( [ 
      response.comment.dateAdded 
    ] ),
    up: up,
    voteNumber: response.comment.numberVotes
  } )
  // Increment the number of votes the user has made.
  const transact_items = [
    { Update: {
      TableName: tableName,
      Key: user.key(),
      ConditionExpression: `attribute_exists(PK)`,
      UpdateExpression: `SET #count = #count + :inc`,
      ExpressionAttributeNames: { '#count': `NumberVotes` },
      ExpressionAttributeValues: { ':inc': { 'N': `1` } }
    } },
  ]
  if ( up )
    // Increment the score of the comment
    transact_items.push( {
      Update: {
        TableName: tableName,
        Key: comment.key(),
        ConditionExpression: `attribute_exists(PK)`,
        UpdateExpression: `SET #count = #count + :inc`,
        ExpressionAttributeNames: { '#count': `Vote` },
        ExpressionAttributeValues: { ':inc': { 'N': `1` } }
      }
    } )
  else
    // Decrement the score of the comment
    transact_items.push( {
      Update: {
        TableName: tableName,
        Key: comment.key(),
        ConditionExpression: `attribute_exists(PK)`,
        UpdateExpression: `SET #count = #count - :dec`,
        ExpressionAttributeNames: { '#count': `Vote` },
        ExpressionAttributeValues: { ':dec': { 'N': `1` } }
      }
    } )
  // Add the vote item
  transact_items.push( {
    Put: {
      TableName: tableName,
      Item: vote.toItem(),
      ConditionExpression: `attribute_not_exists(PK)`
    }
  } )
  try{
    await dynamoDB.transactWriteItems( { 
      TransactItems: transact_items 
    } ).promise()
    return { vote }
  } catch( error ) {
    return { 'error': `Could not add vote to comment` }
  }
}

module.exports = { addVote }