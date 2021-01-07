const AWS = require( `aws-sdk` )
const dynamoDB = new AWS.DynamoDB()
const { ProjectFollow, projectFollowFromItem } = require( `../entities` )
const {
  incrementNumberProjectFollows,
  incrementNumberUserFollows
} = require( `..` )

/**
 * Adds a project's follow to DynamoDB.
 * @param {String} tableName The name of the DynamoDB table.
 * @param {Object} project   The project to add.
 */
const addProjectFollow = async ( tableName, user, project ) => {
  if ( !tableName ) throw Error( `Must give the name of the DynamoDB table` )
  try {
    // Increment the number of the project's followers.
    const {
      projectResponse, projectError
    } = await incrementNumberProjectFollows( tableName, project )
    if ( projectError ) return { error: projectError }
    // Increment the number of projects the user follows.
    const { userResponse, userError } = await incrementNumberUserFollows(
      tableName, user
    )
    if ( userError ) return { error: userError }
    // Add the project's follow to the DB.
    const projectFollow = new ProjectFollow( {
      userName: userResponse.name, userNumber: userResponse.userNumber,
      userFollowNumber: userResponse.numberFollows, email: userResponse.email,
      slug: projectResponse.slug, title: projectResponse.title,
      projectFollowNumber: projectResponse.numberFollows
    } )
    await dynamoDB.putItem( {
      TableName: tableName,
      Item: projectFollow.toItem(),
      ConditionExpression: `attribute_not_exists(PK)`
    } ).promise()
    return { projectFollow: projectFollow }
  } catch( error ) {
    let errorMessage = `Could not add ${user.name} as a follower to 
      ${project.title}`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `${ user.name } is already following ${ project.title }`
    return { 'error': errorMessage }
  }
}

module.exports = {
  addProjectFollow
}