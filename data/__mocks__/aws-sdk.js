const AWS = require( `aws-sdk` )

AWS.config.update( {
  region: `local`,
  endpoint: `http://localhost:8000`,
} )

beforeEach( 
  async () => {
    try {
      const client = new AWS.DynamoDB()
      await client.createTable( {
        TableName: `test-table`,
        KeySchema: [
          { 'AttributeName': `PK`, 'KeyType': `HASH` },
          { 'AttributeName': `SK`, 'KeyType': `RANGE` }
        ],
        AttributeDefinitions: [
          { 'AttributeName': `PK`, 'AttributeType': `S` },
          { 'AttributeName': `SK`, 'AttributeType': `S` },
          { 'AttributeName': `GSI1PK`, 'AttributeType': `S` },
          { 'AttributeName': `GSI1SK`, 'AttributeType': `S` },
          { 'AttributeName': `GSI2PK`, 'AttributeType': `S` },
          { 'AttributeName': `GSI2SK`, 'AttributeType': `S` }
        ],
        ProvisionedThroughput: {ReadCapacityUnits: 5, WriteCapacityUnits: 5},
        GlobalSecondaryIndexes:[
          {
            'IndexName': `GSI1`,
            'KeySchema': [
              { 'AttributeName': `GSI1PK`, 'KeyType': `HASH` },
              { 'AttributeName': `GSI1SK`, 'KeyType': `RANGE` }
            ],
            'Projection': { 'ProjectionType': `ALL` },
            'ProvisionedThroughput': {
              'ReadCapacityUnits': 5,
              'WriteCapacityUnits': 5
            }
          },
          {
            'IndexName': `GSI2`,
            'KeySchema': [
              { 'AttributeName': `GSI2PK`, 'KeyType': `HASH` },
              { 'AttributeName': `GSI2SK`, 'KeyType': `RANGE` }
            ],
            'Projection': { 'ProjectionType': `ALL` },
            'ProvisionedThroughput': {
              'ReadCapacityUnits': 5,
              'WriteCapacityUnits': 5
            }
          },
        ]
      } ).promise()
    } catch( error ) {
      console.log( `Error beforeAll`, error )
    }
  } )

afterEach(
  async () => {
    try {
      const client = new AWS.DynamoDB()
      await client.deleteTable( { TableName: `test-table` } ).promise()
    } catch( error ) {
      console.log( `error afterAll`, error )
    }
  }
)

class Request {
  constructor( result ){ this.result = result }
  promise() { return this.result }
}

class DynamoDB {
  constructor() {
    this.client = new AWS.DynamoDB()
  }
  async putItem( parameter ) { 
    try {
      const request = new Request( 
        this.client.putItem( parameter ).promise() 
      )
      return request
    } catch( error ) {
      console.log( `error putItem`, error )
    }
  }
  async getItem( parameter ){
    try{
      return new Request( this.client.getItem( parameter ).promise() )
    } catch( error ) {
      console.log( `ERROR mocked getItem`, error )
    }
  }
}

const awsSdkPromiseResponse = jest.fn().mockReturnValue(
  Promise.resolve( true )
)

module.exports = { 
  DynamoDB,
  awsSdkPromiseResponse 
}