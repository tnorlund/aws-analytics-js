const AWS = require( `aws-sdk` )
const dynamoDB = new AWS.DynamoDB()
const { incrementNumberProjects } = require( `./blog` ) 
// const { 
//   Blog, blogFromItem,
//   Project, projectFromItem
// } = require( `../entities` )


/**
 * Adds a project to DynamoDB.
 * @param {String} tableName The name of the DynamoDB table.
 * @param {Object} project   The project to add.
 */
const addProject = async ( tableName, project ) => {
  if ( typeof tableName == `undefined` ) 
    throw Error( `Must give the name of the DynamoDB table` )
  if ( typeof project == `undefined` )
    throw new Error( `Must give blog` )
  const { error, blog } = await incrementNumberProjects( tableName )
  if ( error ) return { error: error }
  try {
    await dynamoDB.putItem( {
      TableName: tableName,
      Item: project.toItem(),
      ConditionExpression: `attribute_not_exists(PK)`
    } ).promise()
    return { project, blog }
  } catch( error ) {
    let errorMessage = `Could not add project to blog`
    if ( error.code === `ConditionalCheckFailedException` )
      errorMessage = `'${project.title}' already exists`
    return { 'error': errorMessage }
  }
}

module.exports = {
  addProject
}