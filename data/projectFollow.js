const AWS = require( `aws-sdk` )
const dynamoDB = new AWS.DynamoDB()
const { ProjectFollow } = require( `../entities` )
const { incrementNumberProjectFollows } = require( `./project` )
const { incrementNumberUserFollows } = require( `./user` )

/**
 * Adds a project's follow to DynamoDB.
 * @param {String} tableName The name of the DynamoDB table.
 * @param {Object} project   The project to add.
 */
const addProjectFollow = async ( tableName, user, project ) => {
  if ( typeof tableName == `undefined` ) 
    throw Error( `Must give the name of the DynamoDB table` )
  if ( typeof user == `undefined` ) throw new Error( `Must give user` )
  if ( typeof project == `undefined` ) throw new Error( `Must give project` )
  try {
    // Increment the number of the project's followers.
    const project_response = await incrementNumberProjectFollows(
      tableName, project 
    )
    if ( project_response.error ) return { error: project_response.error }
    // Increment the number of projects the user follows.
    const user_response = await incrementNumberUserFollows( tableName, user )
    if ( user_response.error ) return { error: user_response.error }
    // Add the project's follow to the DB.
    const projectFollow = new ProjectFollow( {
      userName: user_response.user.name, 
      userNumber: user_response.user.userNumber,
      userFollowNumber: user_response.user.numberFollows, 
      email: user_response.user.email, 
      slug: project_response.project.slug,
      title: project_response.project.title,
      projectFollowNumber: project_response.project.numberFollows
    } )
    await dynamoDB.putItem( {
      TableName: tableName,
      Item: projectFollow.toItem(),
      ConditionExpression: `attribute_not_exists(PK)`
    } ).promise()
    return { projectFollow }
  } catch( error ) {
    let errorMessage = `Could not add '${user.name}' as a follower to `
    + `'${project.title}'`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `'${ user.name }' is already following `
      + `'${ project.title }'`
    return { 'error': errorMessage }
  }
}

module.exports = {
  addProjectFollow
}