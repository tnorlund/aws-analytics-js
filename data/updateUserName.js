const AWS = require( `aws-sdk` )
const dynamoDB = new AWS.DynamoDB()

// TODO
// [ ] Update user item
// [X] Update votes
// [X] Update comments
// [X] Update follows
const updateUserName = async (
  tableName, newName, user, votes, comments, follows
) => {
  if ( !tableName ) throw Error( `Must give the name of the DynamoDB table` )
  if ( votes ) {
    const { voteError } = await updateVotesName( tableName, newName, votes )
    if ( voteError ) return { error: voteError }
  }
  if ( comments ) {
    const { commentError } = await updateCommentName(
      tableName, newName, comments
    )
    if ( commentError ) return { error: commentError }
  }
  if ( follows ) {
    const { followError } = await updateFollowName(
      tableName, newName, follows
    )
    if ( followError ) return { error: followError }
  }
  try {
    await dynamoDB.updateItem( {
      TableName: tableName,
      Key: user.key(),
      ConditionExpression: `attribute_exists(PK)`,
      UpdateExpression: `SET #user = :user`,
      ExpressionAttributeNames: {
        '#user': `Name`,
      },
      ExpressionAttributeValues: {
        ':user': { 'S': newName }
      },
      ReturnValues: `ALL_NEW`
    } ).promise()
    user.name = newName
    return { newUser: user }
  } catch( error ) {
    // eslint-disable-next-line no-console
    console.log( `ERROR updateUserName`, error )
    return { error: error }
  }
}

const updateFollowName = async ( tableName, newName, follows ) => {
  try {
    // eslint-disable-next-line no-undef
    return { followResponse: await Promise.all(
      follows.map( async ( follow ) => {
        return await dynamoDB.updateItem( {
          TableName: tableName,
          Key: follow.key(),
          ConditionExpression: `attribute_exists(PK)`,
          UpdateExpression: `SET #user = :user`,
          ExpressionAttributeNames: {
            '#user': `UserName`,
          },
          ExpressionAttributeValues: {
            ':user': { 'S': newName }
          },
          ReturnValues: `ALL_NEW`
        } ).promise() } ) ) }
  } catch ( error ) {
    // eslint-disable-next-line no-console
    console.log( `ERROR updateFollowName`, error )
    return { followError: error }
  }
}

const updateCommentName = async ( tableName, newName, comments ) => {
  try {
    // eslint-disable-next-line no-undef
    return { commentResponse: await Promise.all(
      comments.map( async ( comment ) => {
        return await dynamoDB.updateItem( {
          TableName: tableName,
          Key: comment.key(),
          ConditionExpression: `attribute_exists(PK)`,
          UpdateExpression: `SET #user = :user`,
          ExpressionAttributeNames: {
            '#user': `User`,
          },
          ExpressionAttributeValues: {
            ':user': { 'S': newName }
          },
          ReturnValues: `ALL_NEW`
        } ).promise() } ) ) }
  } catch ( error ) {
    // eslint-disable-next-line no-console
    console.log( `ERROR updateCommentName`, error )
    return { commentError: error }
  }
}

const updateVotesName = async ( tableName, newName, votes ) => {
  try {
    // eslint-disable-next-line no-undef
    return { voteResponse: await Promise.all(
      votes.map( async ( vote ) => {
        return await dynamoDB.updateItem( {
          TableName: tableName,
          Key: vote.key(),
          ConditionExpression: `attribute_exists(PK)`,
          UpdateExpression: `SET #userName = :userName`,
          ExpressionAttributeNames: {
            '#userName': `UserName`,
          },
          ExpressionAttributeValues: {
            ':userName': { 'S': newName }
          },
          ReturnValues: `ALL_NEW`
        } ).promise() } ) ) }
  } catch ( error ) {
    // eslint-disable-next-line no-console
    console.log( `ERROR updateVotesName`, error )
    return { voteError: error }
  }
}

module.exports = { updateUserName }