import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
/**
 * Props for DynamoDBUpdateTableFunction
 */
export interface DynamoDBUpdateTableFunctionProps extends lambda.FunctionOptions {
}
/**
 * An AWS Lambda function which executes src/dynamoDBUpdateTable.
 */
export declare class DynamoDBUpdateTableFunction extends lambda.Function {
    constructor(scope: Construct, id: string, props?: DynamoDBUpdateTableFunctionProps);
}
