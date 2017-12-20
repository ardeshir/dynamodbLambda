// Get-Heroes Function
var doc = require('aws-sdk');
var dynamo = new doc.DynamoDB();

exports.handler = function(event, context) {
    var getParams = {
        TableName:'SuperMission'
   };

    dynamo.scan(getParams, function(err, data){
        if (err) console.log(err, err.stack); // an error occurred
        else {
             context.succeed(data);
        }
    });
};

// Get-Mission-Details

var doc = require('aws-sdk');
var dynamo = new doc.DynamoDB();

exports.handler = function(event, context) {
        condition = {};
        condition["SuperHero"] = {
                ComparisonOperator: 'EQ',
                AttributeValueList:[{S: event.superhero}]
            }

    var getParams = {
        TableName:'SuperMission',
        ProjectionExpression:"SuperHero, MissionStatus, Villain1, Villain2, Villain3",
        KeyConditions: condition
   };

    dynamo.query(getParams, function(err, data){
        if (err) console.log(err, err.stack); // an error occurred
        else {
             context.succeed(data);
        }
    });
};



// SuperHeroes Data
{
	"SuperHero": "SuperMan",
	"Villain1": "Doomsday",
	"Villain2": "Genral Zod",
	"Villain3": "Lex Luther",
	"MissionStatus": "In progress",
	"SecretIdentity": "Clark Kent"
}

//  SuperDynamoDBScanPolicy

{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": [
                "dynamodb:Scan",
                "s3:GetObject",
                "s3:PutObject",
                "dynamodb:BatchWriteItem"
            ],
            "Resource": [
                "*"
            ],
            "Effect": "Allow"
        }
    ]
}

// SuperDynamoDBQueryRole

{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Condition": {
                "ForAllValues:StringEquals": {
                    "dynamodb:Attributes": [
                        "SuperHero",
                        "MissionStatus",
                        "Villain1",
                        "Villain2",
                        "Villain3"
                    ]
                }
            },
            "Action": [
                "dynamodb:Query"
            ],
            "Resource": "*",
            "Effect": "Allow"
        }
    ]
}

//   function.zip for Lambda

console.log('Loading function');
var doc = require('dynamodb-doc');
var db = new doc.DynamoDB();
var AWS = require('aws-sdk'); 
var docClient = new AWS.DynamoDB.DocumentClient();
var fun = function(event, context) 
{
 var params = {
    RequestItems: {
   "SuperMission": [ 
            { 
                PutRequest: {
                    Item: {
                        "SuperHero": "Batman",
			"Villain1": "Joker",
			"Villain2": "Bane",
			"Villain3": "Ras Al Ghul",
			"MissionStatus": "In Progress",
			"SecretIdentity": "Bruce Wayne"
                    }
                }
            },
            {  
                PutRequest: {
                    Item: {
                         "SuperHero": "Superman",
			 "Villain1": "Doomsday",
			 "Villain2": "General Zod",
			 "Villain3": "Lex Luthor",
			 "MissionStatus": "In progress",
			 "SecretIdentity": "Clark Kent"
                    }
                }
            }, 
            { 
                PutRequest: {
                    Item: {
                        "SuperHero": "The Winchester Brothers",
			"Villain1": "Vampires",
			"Villain2": "Ghosts",
			"Villain3": "Werewolves",
			"MissionStatus": "Complete",
			"SecretIdentity": "Sam and Dean"
                    }
                }
            },
	    { 
                PutRequest: {
                    Item: {
                        "SuperHero": "Iron Man",
			"Villain1": "Apocalypse",
			"Villain2": "Doctor Doom",
			"Villain3": "LOki",
			"MissionStatus": "In progress",
			"SecretIdentity": "Tony Stark"
                    }
                }
            }
        ]
    }
}


    docClient.batchWrite(params,function(err,data){
        if (err) console.log(err);
        else console.log(data);
    });
};
exports.handler = fun;


//   found CloudFormation v1

---
AWSTemplateFormatVersion: '2010-09-09'
Description: 'AWS CloudFormation Template '
Parameters:
  SuperMissionTableRead:
    Description: Read capacity units for ScheduledFlightsDemo DynamoDB table
    Type: String
    MinLength: '1'
    MaxLength: '6'
    AllowedPattern: "[0-9]*"
    Default: '1'
  SuperMissionTableWrite:
    Description: Write capacity units for ScheduledFlightsDemo DynamoDB table
    Type: String
    MinLength: '1'
    MaxLength: '6'
    AllowedPattern: "[0-9]*"
    Default: '1'
Resources:
  DynamoDBTable:
    Type: AWS::DynamoDB::Table
    Properties:
      AttributeDefinitions:
      - AttributeName: SuperHero
        AttributeType: S
      - AttributeName: MissionStatus
        AttributeType: S
      - AttributeName: Villain1
        AttributeType: S
      - AttributeName: Villain2
        AttributeType: S
      - AttributeName: Villain3
        AttributeType: S
      - AttributeName: SecretIdentity
        AttributeType: S
      KeySchema:
      - AttributeName: SuperHero
        KeyType: HASH
      - AttributeName: MissionStatus
        KeyType: RANGE
      ProvisionedThroughput:
        ReadCapacityUnits:
          Ref: SuperMissionTableRead
        WriteCapacityUnits:
          Ref: SuperMissionTableWrite
      StreamSpecification:
        StreamViewType: NEW_AND_OLD_IMAGES
      TableName: SuperMission
      GlobalSecondaryIndexes:
      - IndexName: myGSI
        KeySchema:
        - AttributeName: MissionStatus
          KeyType: HASH
        - AttributeName: Villain1
          KeyType: RANGE
        Projection:
          NonKeyAttributes:
          - SuperHero
          - SecretIdentity
          ProjectionType: INCLUDE
        ProvisionedThroughput:
          ReadCapacityUnits: '6'
          WriteCapacityUnits: '6'
      - IndexName: myGSI2
        KeySchema:
        - AttributeName: SecretIdentity
          KeyType: HASH
        - AttributeName: Villain3
          KeyType: RANGE
        Projection:
          NonKeyAttributes:
          - SuperHero
          - Villain1
          ProjectionType: INCLUDE
        ProvisionedThroughput:
          ReadCapacityUnits: '6'
          WriteCapacityUnits: '6'
      LocalSecondaryIndexes:
      - IndexName: myLSI
        KeySchema:
        - AttributeName: SuperHero
          KeyType: HASH
        - AttributeName: Villain2
          KeyType: RANGE
        Projection:
          NonKeyAttributes:
          - Villain1
          - MissionStatus
          ProjectionType: INCLUDE
  AppendItemToListFunction:
    Type: AWS::Lambda::Function
    Properties:
      FunctionName: AppendItemToListFunction
      Handler: lambdafunc.handler
      Role:
        Fn::GetAtt:
        - SuperDynamoDBScanRole
        - Arn
      Code:
        S3Bucket: us-east-1-aws-training
        S3Key: awsu-spl/spl133-dynamodb-webapp-part2/static/lambdafunc.zip
      Runtime: nodejs4.3
  SuperDynamoDBScanRole:
    Type: AWS::IAM::Role
    Properties:
      RoleName: SuperDynamoDBScanRole
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
        - Effect: Allow
          Principal:
            Service: lambda.amazonaws.com
          Action: sts:AssumeRole
  DynamoDBFullRolePolicies:
    Type: AWS::IAM::Policy
    Properties:
      PolicyName: SuperDynamoDBScanPolicy
      PolicyDocument:
        Version: '2012-10-17'
        Statement:
        - Effect: Allow
          Action:
          - dynamodb:Query
          - dynamodb:Scan
          - s3:GetObject
          - s3:PutObject
          - dynamodb:BatchWriteItem
          - dynamodb:*
          Resource:
          - "*"
      Roles:
      - Ref: SuperDynamoDBScanRole
  SuperDynamoDBQueryRole:
    Type: AWS::IAM::Role
    Properties:
      RoleName: SuperDynamoDBQueryRole
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
        - Effect: Allow
          Principal:
            Service: lambda.amazonaws.com
          Action: sts:AssumeRole
  DynamoDBSelectedRolePolicies:
    Type: AWS::IAM::Policy
    Properties:
      PolicyName: SuperDynamoDBQueryPolicy
      PolicyDocument:
        Version: '2012-10-17'
        Statement:
        - Effect: Allow
          Action:
          - dynamodb:Query
          Resource: "*"
      Roles:
      - Ref: SuperDynamoDBQueryRole
  ScheduledRule:
    Type: AWS::Events::Rule
    Properties:
      Description: ScheduledRule
      ScheduleExpression: rate(1 minute)
      State: ENABLED
      Targets:
      - Arn:
          Fn::GetAtt:
          - AppendItemToListFunction
          - Arn
        Id: TargetFunctionV1
  PermissionForEventsToInvokeLambda:
    Type: AWS::Lambda::Permission
    Properties:
      FunctionName:
        Ref: AppendItemToListFunction
      Action: lambda:InvokeFunction
      Principal: events.amazonaws.com
      SourceArn:
        Fn::GetAtt:
        - ScheduledRule
        - Arn
Outputs:
  TableName:
    Value:
      Ref: DynamoDBTable
    Description: Table name of the newly created DynamoDB table

//  Final Version of CloudFormation v2

---
AWSTemplateFormatVersion: '2010-09-09'
Description: 'AWS CloudFormation Template for SuperMission:'
Parameters:
  SuperMissionTableRead:
    Description: Read capacity units for DynamoDB table
    Type: String
    MinLength: '1'
    MaxLength: '6'
    AllowedPattern: "[0-9]*"
    Default: '1'
  SuperMissionTableWrite:
    Description: Write capacity units for DynamoDB table
    Type: String
    MinLength: '1'
    MaxLength: '6'
    AllowedPattern: "[0-9]*"
    Default: '1'
Resources:
  DynamoDBTable:
    Type: AWS::DynamoDB::Table
    Properties:
      AttributeDefinitions:
      - AttributeName: SuperHero
        AttributeType: S
      - AttributeName: MissionStatus
        AttributeType: S
      - AttributeName: Villain1
        AttributeType: S
      - AttributeName: Villain2
        AttributeType: S
      - AttributeName: Villain3
        AttributeType: S
      - AttributeName: SecretIdentity
        AttributeType: S
      KeySchema:
      - AttributeName: SuperHero
        KeyType: HASH
      - AttributeName: MissionStatus
        KeyType: RANGE
      ProvisionedThroughput:
        ReadCapacityUnits:
          Ref: SuperMissionTableRead
        WriteCapacityUnits:
          Ref: SuperMissionTableWrite
      StreamSpecification:
        StreamViewType: NEW_AND_OLD_IMAGES
      TableName: SuperMission
      GlobalSecondaryIndexes:
      - IndexName: myGSI
        KeySchema:
        - AttributeName: MissionStatus
          KeyType: HASH
        - AttributeName: Villain1
          KeyType: RANGE
        Projection:
          NonKeyAttributes:
          - SuperHero
          - SecretIdentity
          ProjectionType: INCLUDE
        ProvisionedThroughput:
          ReadCapacityUnits: '6'
          WriteCapacityUnits: '6'
      - IndexName: myGSI2
        KeySchema:
        - AttributeName: SecretIdentity
          KeyType: HASH
        - AttributeName: Villain3
          KeyType: RANGE
        Projection:
          NonKeyAttributes:
          - SuperHero
          - Villain1
          ProjectionType: INCLUDE
        ProvisionedThroughput:
          ReadCapacityUnits: '6'
          WriteCapacityUnits: '6'
      LocalSecondaryIndexes:
      - IndexName: myLSI
        KeySchema:
        - AttributeName: SuperHero
          KeyType: HASH
        - AttributeName: Villain2
          KeyType: RANGE
        Projection:
          NonKeyAttributes:
          - Villain1
          - MissionStatus
          ProjectionType: INCLUDE
  AppendItemToListFunction:
    Type: AWS::Lambda::Function
    Properties:
      Handler: lambdafunc.handler
      Role:
        Fn::GetAtt:
        - SuperDynamoDBScanRole
        - Arn
      Code:
        S3Bucket: us-east-1-aws-training
        S3Key: awsu-spl/spl133-dynamodb-webapp-part2/static/lambdafunc.zip
      Runtime: nodejs4.3
  getheroeslistFunction:
    Type: AWS::Lambda::Function
    Properties:
      Handler: getheroeslistfunc.handler
      Role:
        Fn::GetAtt:
        - SuperDynamoDBScanRole
        - Arn
      Code:
        S3Bucket: us-east-1-aws-training
        S3Key: awsu-spl/spl134-dynamodb-webapp-part3/static/getheroeslistfunc.zip
      Runtime: nodejs4.3
  getmissiondetailsFunction:
    Type: AWS::Lambda::Function
    Properties:
      Handler: getmissiondetailsfunc.handler
      Role:
        Fn::GetAtt:
        - SuperDynamoDBQueryRole
        - Arn
      Code:
        S3Bucket: us-east-1-aws-training
        S3Key: awsu-spl/spl134-dynamodb-webapp-part3/static/getmissiondetailsfunc.zip
      Runtime: nodejs4.3
  SuperDynamoDBScanRole:
    Type: AWS::IAM::Role
    Properties:
      RoleName: SuperDynamoDBScanRole
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
        - Effect: Allow
          Principal:
            Service: lambda.amazonaws.com
          Action: sts:AssumeRole
  DynamoDBFullRolePolicies:
    Type: AWS::IAM::Policy
    Properties:
      PolicyName: SuperDynamoDBScanPolicy
      PolicyDocument:
        Version: '2012-10-17'
        Statement:
        - Effect: Allow
          Action:
          - dynamodb:Query
          - dynamodb:Scan
          - s3:GetObject
          - s3:PutObject
          - dynamodb:BatchWriteItem
          - dynamodb:*
          Resource:
          - "*"
      Roles:
      - Ref: SuperDynamoDBScanRole
  SuperDynamoDBQueryRole:
    Type: AWS::IAM::Role
    Properties:
      RoleName: SuperDynamoDBQueryRole
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
        - Effect: Allow
          Principal:
            Service: lambda.amazonaws.com
          Action: sts:AssumeRole
  DynamoDBSelectedRolePolicies:
    Type: AWS::IAM::Policy
    Properties:
      PolicyName: SuperDynamoDBQueryPolicy
      PolicyDocument:
        Version: '2012-10-17'
        Statement:
        - Effect: Allow
          Action:
          - dynamodb:Query
          Resource: "*"
      Roles:
      - Ref: SuperDynamoDBQueryRole
  ScheduledRule:
    Type: AWS::Events::Rule
    Properties:
      Description: ScheduledRule
      ScheduleExpression: rate(1 minute)
      State: ENABLED
      Targets:
      - Arn:
          Fn::GetAtt:
          - AppendItemToListFunction
          - Arn
        Id: TargetFunctionV1
  PermissionForEventsToInvokeLambda:
    Type: AWS::Lambda::Permission
    Properties:
      FunctionName:
        Ref: AppendItemToListFunction
      Action: lambda:InvokeFunction
      Principal: events.amazonaws.com
      SourceArn:
        Fn::GetAtt:
        - ScheduledRule
        - Arn
Outputs:
  TableName:
    Value:
      Ref: DynamoDBTable
    Description: Table name of the newly created DynamoDB table

