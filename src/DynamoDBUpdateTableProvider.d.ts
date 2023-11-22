import * as core from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cr from 'aws-cdk-lib/custom-resources';
/**
 * A Custom Resource provider capable of creating AWS Accounts
 */
export declare class DynamoDBUpdateTableProvider extends core.NestedStack {
    /**
     * Creates a stack-singleton resource provider nested stack.
     */
    static getOrCreate(scope: Construct): DynamoDBUpdateTableProvider;
    /**
     * The custom resource provider.
     */
    readonly provider: cr.Provider;
    constructor(scope: Construct, id: string);
}
