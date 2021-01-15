const { User } = require( `../entities` )

/**
 * Converts an ISO formatted date into a Date object.
 * @param {String} dateString An ISO formatted date.
 * @returns A Date object.
 */
const parseDate = ( dateString ) => {
  const parsed = dateString.split( /\D+/ )
  return( new Date( Date.UTC(
    parsed[0], --parsed[1], parsed[2], parsed[3], parsed[4], parsed[5],
    parsed[6]
  ) ) )
}

/**
 * Aggregates the comment data to users and votes data.
 * @param {Object}   comment 
 * @param {Map} data         
 */
const aggregateData = ( comment, data ) => {
  // Recursively get the replies and votes associated to this comment
  if ( Object.keys( comment.replies ).length > 0 ) {
    Object.values( comment.replies ).forEach( 
      ( reply ) => data = aggregateData( reply, data )
    )
  }
  // Get the number of votes each user has made on this comment
  Object.values( comment.votes ).forEach( 
    ( vote ) => {
      if ( data.user[ vote.userNumber ] ) {
        if ( data.user[ vote.userNumber ][ `vote` ] )
          data.user[ vote.userNumber ].vote += 1
        else data.user[ vote.userNumber ].vote = 1
      } else {
        data.user[ vote.userNumber ] = {}
        data.user[ vote.userNumber ][`vote`] = 1
      }
      data[`vote`].push( vote.key() )
    } 
  )
  // Add the comment data
  if ( data.user[ comment.userNumber ] ) {
    if ( data.user[ comment.userNumber ][ `comment` ] )
      data.user[ comment.userNumber ].comment += 1
    else
      data.user[ comment.userNumber ].comment = 1
  } else {
    data.user[ comment.userNumber ] = {}
    data.user[ comment.userNumber ][ `comment` ] = 1
  }
  data[`comment`].push( comment.key() )
  return data
}

/**
 * Transforms the aggregate user and vote data to 
 * @param {Object} data      The aggregate user and vote data.
 * @param {String} tableName The name of the DynamoDB table.
 */
const aggregateDataToTransact = ( data, tableName ) => {
  let transact_items = []
  // Delete the comments
  data.comment.map( key => transact_items.push( {
    Delete: {
      TableName: tableName,
      Key: key,
      ConditionExpression: `attribute_exists(PK)`
    }
  } ) )
  // Delete the votes
  data.vote.map( key => transact_items.push( {
    Delete: {
      TableName: tableName,
      Key: key,
      ConditionExpression: `attribute_exists(PK)`
    }
  } ) )
  // Update each user have less than the number of votes and comments found in
  // the aggregate data.
  Object.entries( data.user ).forEach( 
    ( [ userNumber, userDetails ] ) => {
      transact_items.push( {
        Update: {
          TableName: tableName,
          Key: new User( {
            name: `someone`,
            email: `something`,
            userNumber: userNumber
          } ).key(),
          ConditionExpression: `attribute_exists(PK)`,
          UpdateExpression: 
            `SET #comments = #comments - :comment_dec, `
            + `#votes = #votes - :vote_dec`,
          ExpressionAttributeNames: { 
            '#comments': `NumberComments`,
            '#votes': `NumberVotes`,
          },
          ExpressionAttributeValues: { 
            ':comment_dec': { 'N': `${userDetails.comment}` },
            ':vote_dec': { 'N': `${userDetails.vote}` } 
          },
        }
      } )
    }
  )
  return transact_items
}

module.exports = {
  parseDate, aggregateData, aggregateDataToTransact
}