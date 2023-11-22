import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
export declare class Table extends dynamodb.Table {
    private readonly _attributeDefinitions;
    private readonly globalSecondaryIndexesBuilders;
    private readonly globalSecondaryIndexesBuilderProvider;
    private readonly _globalSecondaryIndexSchemas;
    private readonly _nonKeyAttributes;
    private readonly _indexScaling;
    private readonly _billingMode;
    protected get hasIndex(): boolean;
    constructor(scope: Construct, id: string, props: dynamodb.TableProps);
    /**
     * Validate non-key attributes by checking limits within secondary index, which may vary in future.
     *
     * @param _nonKeyAttributes a list of non-key attribute names
     */
    private _validateNonKeyAttributes;
    private _buildIndexProjection;
    /**
     * Register the key attribute of table or secondary index to assemble attribute definitions of TableResourceProps.
     *
     * @param attribute the key attribute of table or secondary index
     */
    private _registerAttribute;
    /**
     * Validate index name to check if a duplicate name already exists.
     *
     * @param indexName a name of global secondary index
     */
    private _validateIndexName;
    private _buildIndexKeySchema;
    /**
     * Validate read and write capacity are not specified for on-demand tables (billing mode PAY_PER_REQUEST).
     *
     * @param props read and write capacity properties
     */
    private _validateProvisioning;
    private sdkBasedAddGlobalSecondaryIndex;
    /**
     * Add a global secondary index of table.
     *
     * @param props the property of global secondary index
     */
    addGlobalSecondaryIndex(props: dynamodb.GlobalSecondaryIndexProps): void;
}
