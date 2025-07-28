"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Table = void 0;
const dynamodb = __importStar(require("aws-cdk-lib/aws-dynamodb"));
const core = __importStar(require("aws-cdk-lib"));
const DynamoDBUpdateTableProvider_1 = require("./DynamoDBUpdateTableProvider");
const HASH_KEY_TYPE = 'HASH';
const RANGE_KEY_TYPE = 'RANGE';
class Table extends dynamodb.Table {
    constructor(scope, id, props) {
        var _a, _b;
        super(scope, id, props);
        this._attributeDefinitions = new Array();
        this.globalSecondaryIndexesBuilders = new Array();
        this._globalSecondaryIndexSchemas = new Map();
        this._nonKeyAttributes = new Set();
        this._indexScaling = new Map();
        // Keep original billing mode logic
        if (props.replicationRegions) {
            this._billingMode = (_a = props.billingMode) !== null && _a !== void 0 ? _a : dynamodb.BillingMode.PAY_PER_REQUEST;
        }
        else {
            this._billingMode = (_b = props.billingMode) !== null && _b !== void 0 ? _b : dynamodb.BillingMode.PROVISIONED;
        }
        this.globalSecondaryIndexesBuilderProvider = DynamoDBUpdateTableProvider_1.DynamoDBUpdateTableProvider.getOrCreate(scope);
    }
    get hasIndex() {
        return this.globalSecondaryIndexesBuilders.length > 0;
    }
    /**
     * Validate non-key attributes by checking limits within secondary index, which may vary in future.
     *
     * @param _nonKeyAttributes a list of non-key attribute names
     */
    _validateNonKeyAttributes(_nonKeyAttributes) {
        if (this._nonKeyAttributes.size + _nonKeyAttributes.length > 100) {
            // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Limits.html#limits-secondary-indexes
            throw new RangeError('a maximum number of _nonKeyAttributes across all of secondary indexes is 100');
        }
        // store all non-key attributes
        _nonKeyAttributes.forEach((att) => this._nonKeyAttributes.add(att));
    }
    _buildIndexProjection(props) {
        var _a, _b;
        if (props.projectionType === dynamodb.ProjectionType.INCLUDE && !props.nonKeyAttributes) {
            // https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-dynamodb-projectionobject.html
            throw new Error(`non-key attributes should be specified when using ${dynamodb.ProjectionType.INCLUDE} projection type`);
        }
        if (props.projectionType !== dynamodb.ProjectionType.INCLUDE && props.nonKeyAttributes) {
            // this combination causes validation exception, status code 400, while trying to create CFN stack
            throw new Error(`non-key attributes should not be specified when not using ${dynamodb.ProjectionType.INCLUDE} projection type`);
        }
        if (props.nonKeyAttributes) {
            this._validateNonKeyAttributes(props.nonKeyAttributes);
        }
        return {
            projectionType: (_a = props.projectionType) !== null && _a !== void 0 ? _a : dynamodb.ProjectionType.ALL,
            nonKeyAttributes: (_b = props.nonKeyAttributes) !== null && _b !== void 0 ? _b : undefined,
        };
    }
    /**
     * Register the key attribute of table or secondary index to assemble attribute definitions of TableResourceProps.
     *
     * @param attribute the key attribute of table or secondary index
     */
    _registerAttribute(attribute) {
        const { name, type } = attribute;
        const existingDef = this._attributeDefinitions.find((def) => def.attributeName === name);
        if (existingDef && existingDef.attributeType !== type) {
            throw new Error(`Unable to specify ${name} as ${type} because it was already defined as ${existingDef.attributeType}`);
        }
        if (!existingDef) {
            this._attributeDefinitions.push({
                attributeName: name,
                attributeType: type,
            });
        }
    }
    /**
     * Validate index name to check if a duplicate name already exists.
     *
     * @param indexName a name of global secondary index
     */
    _validateIndexName(indexName) {
        if (this._globalSecondaryIndexSchemas.has(indexName)) {
            // a duplicate index name causes validation exception, status code 400, while trying to create CFN stack
            throw new Error(`a duplicate index name, ${indexName}, is not allowed`);
        }
    }
    _buildIndexKeySchema(partitionKey, sortKey) {
        this._registerAttribute(partitionKey);
        const indexKeySchema = [
            { attributeName: partitionKey.name, keyType: HASH_KEY_TYPE },
        ];
        if (sortKey) {
            this._registerAttribute(sortKey);
            indexKeySchema.push({ attributeName: sortKey.name, keyType: RANGE_KEY_TYPE });
        }
        return indexKeySchema;
    }
    /**
     * Validate read and write capacity are not specified for on-demand tables (billing mode PAY_PER_REQUEST).
     *
     * @param props read and write capacity properties
     */
    _validateProvisioning(props) {
        if (this._billingMode === dynamodb.BillingMode.PAY_PER_REQUEST) {
            if (props.readCapacity !== undefined || props.writeCapacity !== undefined) {
                throw new Error('you cannot provision read and write capacity for a table with PAY_PER_REQUEST billing mode');
            }
        }
    }
    sdkBasedAddGlobalSecondaryIndex(globalSecondaryIndex) {
        // capitalize object keys
        const capitalizedAttributeDefinitions = this._attributeDefinitions.map((def) => {
            return {
                AttributeName: def.attributeName,
                AttributeType: def.attributeType,
            };
        });
        const capitalizedKeySchema = globalSecondaryIndex.keySchema.map((key) => {
            return {
                AttributeName: key.attributeName,
                KeyType: key.keyType,
            };
        });
        const capitalizedProjection = {
            ProjectionType: globalSecondaryIndex.projection.projectionType,
        };
        return new core.CustomResource(this, `${globalSecondaryIndex.indexName}`, {
            serviceToken: this.globalSecondaryIndexesBuilderProvider.provider.serviceToken,
            resourceType: 'Custom::DynamoDBGlobalSecondaryIndex',
            properties: {
                TableName: this.tableName,
                AttributeDefinitions: capitalizedAttributeDefinitions,
                IndexName: globalSecondaryIndex.indexName,
                KeySchema: capitalizedKeySchema,
                Projection: capitalizedProjection,
            },
        });
    }
    /**
     * Add a global secondary index of table.
     *
     * @param props the property of global secondary index
     */
    addGlobalSecondaryIndex(props) {
        this._validateProvisioning(props);
        this._validateIndexName(props.indexName);
        // build key schema and projection for index
        const gsiKeySchema = this._buildIndexKeySchema(props.partitionKey, props.sortKey);
        const gsiProjection = this._buildIndexProjection(props);
        const builder = this.sdkBasedAddGlobalSecondaryIndex({
            indexName: props.indexName,
            keySchema: gsiKeySchema,
            projection: gsiProjection,
            provisionedThroughput: this._billingMode === dynamodb.BillingMode.PAY_PER_REQUEST
                ? undefined
                : {
                    readCapacityUnits: props.readCapacity || 5,
                    writeCapacityUnits: props.writeCapacity || 5,
                },
        });
        if (this.globalSecondaryIndexesBuilders.length !== 0) {
            builder.node.addDependency(this.globalSecondaryIndexesBuilders[this.globalSecondaryIndexesBuilders.length - 1]);
        }
        this.globalSecondaryIndexesBuilders.push(builder);
        this._globalSecondaryIndexSchemas.set(props.indexName, {
            partitionKey: props.partitionKey,
            sortKey: props.sortKey,
        });
        this._indexScaling.set(props.indexName, {});
    }
}
exports.Table = Table;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLG1FQUFxRDtBQUVyRCxrREFBb0M7QUFFcEMsK0VBQTRFO0FBRTVFLE1BQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQztBQUM3QixNQUFNLGNBQWMsR0FBRyxPQUFPLENBQUM7QUFVL0IsTUFBYSxLQUFNLFNBQVEsUUFBUSxDQUFDLEtBQUs7SUFjdkMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUEwQjs7UUFDbEUsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFkVCwwQkFBcUIsR0FBRyxJQUFJLEtBQUssRUFBaUQsQ0FBQztRQUNuRixtQ0FBOEIsR0FBRyxJQUFJLEtBQUssRUFBdUIsQ0FBQztRQUdsRSxpQ0FBNEIsR0FBRyxJQUFJLEdBQUcsRUFBa0MsQ0FBQztRQUN6RSxzQkFBaUIsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO1FBQ3RDLGtCQUFhLEdBQUcsSUFBSSxHQUFHLEVBQWlDLENBQUM7UUFVeEUsbUNBQW1DO1FBQ25DLElBQUksS0FBSyxDQUFDLGtCQUFrQixFQUFFO1lBQzVCLElBQUksQ0FBQyxZQUFZLEdBQUcsTUFBQSxLQUFLLENBQUMsV0FBVyxtQ0FBSSxRQUFRLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQztTQUMvRTthQUFNO1lBQ0wsSUFBSSxDQUFDLFlBQVksR0FBRyxNQUFBLEtBQUssQ0FBQyxXQUFXLG1DQUFJLFFBQVEsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDO1NBQzNFO1FBRUQsSUFBSSxDQUFDLHFDQUFxQyxHQUFHLHlEQUEyQixDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM5RixDQUFDO0lBZkQsSUFBYyxRQUFRO1FBQ3BCLE9BQU8sSUFBSSxDQUFDLDhCQUE4QixDQUFDLE1BQU0sR0FBRyxDQUFD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LENBQUM7aUJBQzdDO1NBQ04sQ0FBQyxDQUFDO1FBQ0gsSUFBSSxJQUFJLENBQUMsOEJBQThCLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUNwRCxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2pIO1FBRUQsSUFBSSxDQUFDLDhCQUE4QixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVsRCxJQUFJLENBQUMsNEJBQTRCLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUU7WUFDckQsWUFBWSxFQUFFLEtBQUssQ0FBQyxZQUFZO1lBQ2hDLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTztTQUN2QixDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQzlDLENBQUM7Q0FDRjtBQTFNRCxzQkEwTUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBkeW5hbW9kYiBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZHluYW1vZGInO1xuaW1wb3J0IHsgU2NhbGFibGVUYWJsZUF0dHJpYnV0ZSB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1keW5hbW9kYi9saWIvc2NhbGFibGUtdGFibGUtYXR0cmlidXRlJztcbmltcG9ydCAqIGFzIGNvcmUgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgeyBEeW5hbW9EQlVwZGF0ZVRhYmxlUHJvdmlkZXIgfSBmcm9tICcuL0R5bmFtb0RCVXBkYXRlVGFibGVQcm92aWRlcic7XG5cbmNvbnN0IEhBU0hfS0VZX1RZUEUgPSAnSEFTSCc7XG5jb25zdCBSQU5HRV9LRVlfVFlQRSA9ICdSQU5HRSc7XG5cbi8qKlxuICogSnVzdCBhIGNvbnZlbmllbnQgd2F5IHRvIGtlZXAgdHJhY2sgb2YgYm90aCBhdHRyaWJ1dGVzXG4gKi9cbmludGVyZmFjZSBTY2FsYWJsZUF0dHJpYnV0ZVBhaXIge1xuICBzY2FsYWJsZVJlYWRBdHRyaWJ1dGU/OiBTY2FsYWJsZVRhYmxlQXR0cmlidXRlO1xuICBzY2FsYWJsZVdyaXRlQXR0cmlidXRlPzogU2NhbGFibGVUYWJsZUF0dHJpYnV0ZTtcbn1cblxuZXhwb3J0IGNsYXNzIFRhYmxlIGV4dGVuZHMgZHluYW1vZGIuVGFibGUge1xuICBwcml2YXRlIHJlYWRvbmx5IF9hdHRyaWJ1dGVEZWZpbml0aW9ucyA9IG5ldyBBcnJheTxkeW5hbW9kYi5DZm5UYWJsZS5BdHRyaWJ1dGVEZWZpbml0aW9uUHJvcGVydHk+KCk7XG4gIHByaXZhdGUgcmVhZG9ubHkgZ2xvYmFsU2Vjb25kYXJ5SW5kZXhlc0J1aWxkZXJzID0gbmV3IEFycmF5PGNvcmUuQ3VzdG9tUmVzb3VyY2U+KCk7XG4gIHByaXZhdGUgcmVhZG9ubHkgZ2xvYmFsU2Vjb25kYXJ5SW5kZXhlc0J1aWxkZXJQcm92aWRlcjogRHluYW1vREJVcGRhdGVUYWJsZVByb3ZpZGVyO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgX2dsb2JhbFNlY29uZGFyeUluZGV4U2NoZW1hcyA9IG5ldyBNYXA8c3RyaW5nLCBkeW5hbW9kYi5TY2hlbWFPcHRpb25zPigpO1xuICBwcml2YXRlIHJlYWRvbmx5IF9ub25LZXlBdHRyaWJ1dGVzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gIHByaXZhdGUgcmVhZG9ubHkgX2luZGV4U2NhbGluZyA9IG5ldyBNYXA8c3RyaW5nLCBTY2FsYWJsZUF0dHJpYnV0ZVBhaXI+KCk7XG4gIHByaXZhdGUgcmVhZG9ubHkgX2JpbGxpbmdNb2RlOiBkeW5hbW9kYi5CaWxsaW5nTW9kZTtcblxuICBwcm90ZWN0ZWQgZ2V0IGhhc0luZGV4KCkge1xuICAgIHJldHVybiB0aGlzLmdsb2JhbFNlY29uZGFyeUluZGV4ZXNCdWlsZGVycy5sZW5ndGggPiAwO1xuICB9XG5cbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM6IGR5bmFtb2RiLlRhYmxlUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIC8vIEtlZXAgb3JpZ2luYWwgYmlsbGluZyBtb2RlIGxvZ2ljXG4gICAgaWYgKHByb3BzLnJlcGxpY2F0aW9uUmVnaW9ucykge1xuICAgICAgdGhpcy5fYmlsbGluZ01vZGUgPSBwcm9wcy5iaWxsaW5nTW9kZSA/PyBkeW5hbW9kYi5CaWxsaW5nTW9kZS5QQVlfUEVSX1JFUVVFU1Q7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2JpbGxpbmdNb2RlID0gcHJvcHMuYmlsbGluZ01vZGUgPz8gZHluYW1vZGIuQmlsbGluZ01vZGUuUFJPVklTSU9ORUQ7XG4gICAgfVxuXG4gICAgdGhpcy5nbG9iYWxTZWNvbmRhcnlJbmRleGVzQnVpbGRlclByb3ZpZGVyID0gRHluYW1vREJVcGRhdGVUYWJsZVByb3ZpZGVyLmdldE9yQ3JlYXRlKHNjb3BlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWYWxpZGF0ZSBub24ta2V5IGF0dHJpYnV0ZXMgYnkgY2hlY2tpbmcgbGltaXRzIHdpdGhpbiBzZWNvbmRhcnkgaW5kZXgsIHdoaWNoIG1heSB2YXJ5IGluIGZ1dHVyZS5cbiAgICpcbiAgICogQHBhcmFtIF9ub25LZXlBdHRyaWJ1dGVzIGEgbGlzdCBvZiBub24ta2V5IGF0dHJpYnV0ZSBuYW1lc1xuICAgKi9cbiAgcHJpdmF0ZSBfdmFsaWRhdGVOb25LZXlBdHRyaWJ1dGVzKF9ub25LZXlBdHRyaWJ1dGVzOiBzdHJpbmdbXSkge1xuICAgIGlmICh0aGlzLl9ub25LZXlBdHRyaWJ1dGVzLnNpemUgKyBfbm9uS2V5QXR0cmlidXRlcy5sZW5ndGggPiAxMDApIHtcbiAgICAgIC8vIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9hbWF6b25keW5hbW9kYi9sYXRlc3QvZGV2ZWxvcGVyZ3VpZGUvTGltaXRzLmh0bWwjbGltaXRzLXNlY29uZGFyeS1pbmRleGVzXG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignYSBtYXhpbXVtIG51bWJlciBvZiBfbm9uS2V5QXR0cmlidXRlcyBhY3Jvc3MgYWxsIG9mIHNlY29uZGFyeSBpbmRleGVzIGlzIDEwMCcpO1xuICAgIH1cblxuICAgIC8vIHN0b3JlIGFsbCBub24ta2V5IGF0dHJpYnV0ZXNcbiAgICBfbm9uS2V5QXR0cmlidXRlcy5mb3JFYWNoKChhdHQpID0+IHRoaXMuX25vbktleUF0dHJpYnV0ZXMuYWRkKGF0dCkpO1xuICB9XG4gIHByaXZhdGUgX2J1aWxkSW5kZXhQcm9qZWN0aW9uKHByb3BzOiBkeW5hbW9kYi5TZWNvbmRhcnlJbmRleFByb3BzKTogZHluYW1vZGIuQ2ZuVGFibGUuUHJvamVjdGlvblByb3BlcnR5IHtcbiAgICBpZiAocHJvcHMucHJvamVjdGlvblR5cGUgPT09IGR5bmFtb2RiLlByb2plY3Rpb25UeXBlLklOQ0xVREUgJiYgIXByb3BzLm5vbktleUF0dHJpYnV0ZXMpIHtcbiAgICAgIC8vIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9BV1NDbG91ZEZvcm1hdGlvbi9sYXRlc3QvVXNlckd1aWRlL2F3cy1wcm9wZXJ0aWVzLWR5bmFtb2RiLXByb2plY3Rpb25vYmplY3QuaHRtbFxuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgbm9uLWtleSBhdHRyaWJ1dGVzIHNob3VsZCBiZSBzcGVjaWZpZWQgd2hlbiB1c2luZyAke2R5bmFtb2RiLlByb2plY3Rpb25UeXBlLklOQ0xVREV9IHByb2plY3Rpb24gdHlwZWAsXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmIChwcm9wcy5wcm9qZWN0aW9uVHlwZSAhPT0gZHluYW1vZGIuUHJvamVjdGlvblR5cGUuSU5DTFVERSAmJiBwcm9wcy5ub25LZXlBdHRyaWJ1dGVzKSB7XG4gICAgICAvLyB0aGlzIGNvbWJpbmF0aW9uIGNhdXNlcyB2YWxpZGF0aW9uIGV4Y2VwdGlvbiwgc3RhdHVzIGNvZGUgNDAwLCB3aGlsZSB0cnlpbmcgdG8gY3JlYXRlIENGTiBzdGFja1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgbm9uLWtleSBhdHRyaWJ1dGVzIHNob3VsZCBub3QgYmUgc3BlY2lmaWVkIHdoZW4gbm90IHVzaW5nICR7ZHluYW1vZGIuUHJvamVjdGlvblR5cGUuSU5DTFVERX0gcHJvamVjdGlvbiB0eXBlYCxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKHByb3BzLm5vbktleUF0dHJpYnV0ZXMpIHtcbiAgICAgIHRoaXMuX3ZhbGlkYXRlTm9uS2V5QXR0cmlidXRlcyhwcm9wcy5ub25LZXlBdHRyaWJ1dGVzKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgcHJvamVjdGlvblR5cGU6IHByb3BzLnByb2plY3Rpb25UeXBlID8/IGR5bmFtb2RiLlByb2plY3Rpb25UeXBlLkFMTCxcbiAgICAgIG5vbktleUF0dHJpYnV0ZXM6IHByb3BzLm5vbktleUF0dHJpYnV0ZXMgPz8gdW5kZWZpbmVkLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXIgdGhlIGtleSBhdHRyaWJ1dGUgb2YgdGFibGUgb3Igc2Vjb25kYXJ5IGluZGV4IHRvIGFzc2VtYmxlIGF0dHJpYnV0ZSBkZWZpbml0aW9ucyBvZiBUYWJsZVJlc291cmNlUHJvcHMuXG4gICAqXG4gICAqIEBwYXJhbSBhdHRyaWJ1dGUgdGhlIGtleSBhdHRyaWJ1dGUgb2YgdGFibGUgb3Igc2Vjb25kYXJ5IGluZGV4XG4gICAqL1xuICBwcml2YXRlIF9yZWdpc3RlckF0dHJpYnV0ZShhdHRyaWJ1dGU6IGR5bmFtb2RiLkF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHsgbmFtZSwgdHlwZSB9ID0gYXR0cmlidXRlO1xuICAgIGNvbnN0IGV4aXN0aW5nRGVmID0gdGhpcy5fYXR0cmlidXRlRGVmaW5pdGlvbnMuZmluZCgoZGVmKSA9PiBkZWYuYXR0cmlidXRlTmFtZSA9PT0gbmFtZSk7XG4gICAgaWYgKGV4aXN0aW5nRGVmICYmIGV4aXN0aW5nRGVmLmF0dHJpYnV0ZVR5cGUgIT09IHR5cGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYFVuYWJsZSB0byBzcGVjaWZ5ICR7bmFtZX0gYXMgJHt0eXBlfSBiZWNhdXNlIGl0IHdhcyBhbHJlYWR5IGRlZmluZWQgYXMgJHtleGlzdGluZ0RlZi5hdHRyaWJ1dGVUeXBlfWAsXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoIWV4aXN0aW5nRGVmKSB7XG4gICAgICB0aGlzLl9hdHRyaWJ1dGVEZWZpbml0aW9ucy5wdXNoKHtcbiAgICAgICAgYXR0cmlidXRlTmFtZTogbmFtZSxcbiAgICAgICAgYXR0cmlidXRlVHlwZTogdHlwZSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICogVmFsaWRhdGUgaW5kZXggbmFtZSB0byBjaGVjayBpZiBhIGR1cGxpY2F0ZSBuYW1lIGFscmVhZHkgZXhpc3RzLlxuICAgKlxuICAgKiBAcGFyYW0gaW5kZXhOYW1lIGEgbmFtZSBvZiBnbG9iYWwgc2Vjb25kYXJ5IGluZGV4XG4gICAqL1xuICBwcml2YXRlIF92YWxpZGF0ZUluZGV4TmFtZShpbmRleE5hbWU6IHN0cmluZykge1xuICAgIGlmICh0aGlzLl9nbG9iYWxTZWNvbmRhcnlJbmRleFNjaGVtYXMuaGFzKGluZGV4TmFtZSkpIHtcbiAgICAgIC8vIGEgZHVwbGljYXRlIGluZGV4IG5hbWUgY2F1c2VzIHZhbGlkYXRpb24gZXhjZXB0aW9uLCBzdGF0dXMgY29kZSA0MDAsIHdoaWxlIHRyeWluZyB0byBjcmVhdGUgQ0ZOIHN0YWNrXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGEgZHVwbGljYXRlIGluZGV4IG5hbWUsICR7aW5kZXhOYW1lfSwgaXMgbm90IGFsbG93ZWRgKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9idWlsZEluZGV4S2V5U2NoZW1hKFxuICAgIHBhcnRpdGlvbktleTogZHluYW1vZGIuQXR0cmlidXRlLFxuICAgIHNvcnRLZXk/OiBkeW5hbW9kYi5BdHRyaWJ1dGUsXG4gICk6IGR5bmFtb2RiLkNmblRhYmxlLktleVNjaGVtYVByb3BlcnR5W10ge1xuICAgIHRoaXMuX3JlZ2lzdGVyQXR0cmlidXRlKHBhcnRpdGlvbktleSk7XG4gICAgY29uc3QgaW5kZXhLZXlTY2hlbWE6IGR5bmFtb2RiLkNmblRhYmxlLktleVNjaGVtYVByb3BlcnR5W10gPSBbXG4gICAgICB7IGF0dHJpYnV0ZU5hbWU6IHBhcnRpdGlvbktleS5uYW1lLCBrZXlUeXBlOiBIQVNIX0tFWV9UWVBFIH0sXG4gICAgXTtcblxuICAgIGlmIChzb3J0S2V5KSB7XG4gICAgICB0aGlzLl9yZWdpc3RlckF0dHJpYnV0ZShzb3J0S2V5KTtcbiAgICAgIGluZGV4S2V5U2NoZW1hLnB1c2goeyBhdHRyaWJ1dGVOYW1lOiBzb3J0S2V5Lm5hbWUsIGtleVR5cGU6IFJBTkdFX0tFWV9UWVBFIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBpbmRleEtleVNjaGVtYTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWYWxpZGF0ZSByZWFkIGFuZCB3cml0ZSBjYXBhY2l0eSBhcmUgbm90IHNwZWNpZmllZCBmb3Igb24tZGVtYW5kIHRhYmxlcyAoYmlsbGluZyBtb2RlIFBBWV9QRVJfUkVRVUVTVCkuXG4gICAqXG4gICAqIEBwYXJhbSBwcm9wcyByZWFkIGFuZCB3cml0ZSBjYXBhY2l0eSBwcm9wZXJ0aWVzXG4gICAqL1xuICBwcml2YXRlIF92YWxpZGF0ZVByb3Zpc2lvbmluZyhwcm9wczogeyByZWFkQ2FwYWNpdHk/OiBudW1iZXI7IHdyaXRlQ2FwYWNpdHk/OiBudW1iZXIgfSk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9iaWxsaW5nTW9kZSA9PT0gZHluYW1vZGIuQmlsbGluZ01vZGUuUEFZX1BFUl9SRVFVRVNUKSB7XG4gICAgICBpZiAocHJvcHMucmVhZENhcGFjaXR5ICE9PSB1bmRlZmluZWQgfHwgcHJvcHMud3JpdGVDYXBhY2l0eSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcigneW91IGNhbm5vdCBwcm92aXNpb24gcmVhZCBhbmQgd3JpdGUgY2FwYWNpdHkgZm9yIGEgdGFibGUgd2l0aCBQQVlfUEVSX1JFUVVFU1QgYmlsbGluZyBtb2RlJyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzZGtCYXNlZEFkZEdsb2JhbFNlY29uZGFyeUluZGV4KFxuICAgIGdsb2JhbFNlY29uZGFyeUluZGV4OiBkeW5hbW9kYi5DZm5UYWJsZS5Mb2NhbFNlY29uZGFyeUluZGV4UHJvcGVydHkgfCBkeW5hbW9kYi5DZm5UYWJsZS5HbG9iYWxTZWNvbmRhcnlJbmRleFByb3BlcnR5LFxuICApOiBjb3JlLkN1c3RvbVJlc291cmNlIHtcbiAgICAvLyBjYXBpdGFsaXplIG9iamVjdCBrZXlzXG4gICAgY29uc3QgY2FwaXRhbGl6ZWRBdHRyaWJ1dGVEZWZpbml0aW9ucyA9IHRoaXMuX2F0dHJpYnV0ZURlZmluaXRpb25zLm1hcCgoZGVmKSA9PiB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBBdHRyaWJ1dGVOYW1lOiBkZWYuYXR0cmlidXRlTmFtZSxcbiAgICAgICAgQXR0cmlidXRlVHlwZTogZGVmLmF0dHJpYnV0ZVR5cGUsXG4gICAgICB9O1xuICAgIH0pO1xuXG4gICAgY29uc3QgY2FwaXRhbGl6ZWRLZXlTY2hlbWEgPSAoZ2xvYmFsU2Vjb25kYXJ5SW5kZXgua2V5U2NoZW1hIGFzIGR5bmFtb2RiLkNmblRhYmxlLktleVNjaGVtYVByb3BlcnR5W10pLm1hcChcbiAgICAgIChrZXkpID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBBdHRyaWJ1dGVOYW1lOiBrZXkuYXR0cmlidXRlTmFtZSxcbiAgICAgICAgICBLZXlUeXBlOiBrZXkua2V5VHlwZSxcbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgKTtcblxuICAgIGNvbnN0IGNhcGl0YWxpemVkUHJvamVjdGlvbiA9IHtcbiAgICAgIFByb2plY3Rpb25UeXBlOiAoZ2xvYmFsU2Vjb25kYXJ5SW5kZXgucHJvamVjdGlvbiBhcyBkeW5hbW9kYi5DZm5UYWJsZS5Qcm9qZWN0aW9uUHJvcGVydHkpLnByb2plY3Rpb25UeXBlLFxuICAgIH07XG4gICAgcmV0dXJuIG5ldyBjb3JlLkN1c3RvbVJlc291cmNlKHRoaXMsIGAke2dsb2JhbFNlY29uZGFyeUluZGV4LmluZGV4TmFtZX1gLCB7XG4gICAgICBzZXJ2aWNlVG9rZW46IHRoaXMuZ2xvYmFsU2Vjb25kYXJ5SW5kZXhlc0J1aWxkZXJQcm92aWRlci5wcm92aWRlci5zZXJ2aWNlVG9rZW4sXG4gICAgICByZXNvdXJjZVR5cGU6ICdDdXN0b206OkR5bmFtb0RCR2xvYmFsU2Vjb25kYXJ5SW5kZXgnLFxuICAgICAgcHJvcGVydGllczoge1xuICAgICAgICBUYWJsZU5hbWU6IHRoaXMudGFibGVOYW1lLFxuICAgICAgICBBdHRyaWJ1dGVEZWZpbml0aW9uczogY2FwaXRhbGl6ZWRBdHRyaWJ1dGVEZWZpbml0aW9ucyxcbiAgICAgICAgSW5kZXhOYW1lOiBnbG9iYWxTZWNvbmRhcnlJbmRleC5pbmRleE5hbWUsXG4gICAgICAgIEtleVNjaGVtYTogY2FwaXRhbGl6ZWRLZXlTY2hlbWEsXG4gICAgICAgIFByb2plY3Rpb246IGNhcGl0YWxpemVkUHJvamVjdGlvbixcbiAgICAgIH0sXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQWRkIGEgZ2xvYmFsIHNlY29uZGFyeSBpbmRleCBvZiB0YWJsZS5cbiAgICpcbiAgICogQHBhcmFtIHByb3BzIHRoZSBwcm9wZXJ0eSBvZiBnbG9iYWwgc2Vjb25kYXJ5IGluZGV4XG4gICAqL1xuICBwdWJsaWMgYWRkR2xvYmFsU2Vjb25kYXJ5SW5kZXgocHJvcHM6IGR5bmFtb2RiLkdsb2JhbFNlY29uZGFyeUluZGV4UHJvcHMpIHtcbiAgICB0aGlzLl92YWxpZGF0ZVByb3Zpc2lvbmluZyhwcm9wcyk7XG4gICAgdGhpcy5fdmFsaWRhdGVJbmRleE5hbWUocHJvcHMuaW5kZXhOYW1lKTtcblxuICAgIC8vIGJ1aWxkIGtleSBzY2hlbWEgYW5kIHByb2plY3Rpb24gZm9yIGluZGV4XG4gICAgY29uc3QgZ3NpS2V5U2NoZW1hID0gdGhpcy5fYnVpbGRJbmRleEtleVNjaGVtYShwcm9wcy5wYXJ0aXRpb25LZXksIHByb3BzLnNvcnRLZXkpO1xuICAgIGNvbnN0IGdzaVByb2plY3Rpb24gPSB0aGlzLl9idWlsZEluZGV4UHJvamVjdGlvbihwcm9wcyk7XG5cbiAgICBjb25zdCBidWlsZGVyID0gdGhpcy5zZGtCYXNlZEFkZEdsb2JhbFNlY29uZGFyeUluZGV4KHtcbiAgICAgIGluZGV4TmFtZTogcHJvcHMuaW5kZXhOYW1lLFxuICAgICAga2V5U2NoZW1hOiBnc2lLZXlTY2hlbWEsXG4gICAgICBwcm9qZWN0aW9uOiBnc2lQcm9qZWN0aW9uLFxuICAgICAgcHJvdmlzaW9uZWRUaHJvdWdocHV0OlxuICAgICAgICB0aGlzLl9iaWxsaW5nTW9kZSA9PT0gZHluYW1vZGIuQmlsbGluZ01vZGUuUEFZX1BFUl9SRVFVRVNUXG4gICAgICAgICAgPyB1bmRlZmluZWRcbiAgICAgICAgICA6IHtcbiAgICAgICAgICAgIHJlYWRDYXBhY2l0eVVuaXRzOiBwcm9wcy5yZWFkQ2FwYWNpdHkgfHwgNSxcbiAgICAgICAgICAgIHdyaXRlQ2FwYWNpdHlVbml0czogcHJvcHMud3JpdGVDYXBhY2l0eSB8fCA1LFxuICAgICAgICAgIH0sXG4gICAgfSk7XG4gICAgaWYgKHRoaXMuZ2xvYmFsU2Vjb25kYXJ5SW5kZXhlc0J1aWxkZXJzLmxlbmd0aCAhPT0gMCkge1xuICAgICAgYnVpbGRlci5ub2RlLmFkZERlcGVuZGVuY3kodGhpcy5nbG9iYWxTZWNvbmRhcnlJbmRleGVzQnVpbGRlcnNbdGhpcy5nbG9iYWxTZWNvbmRhcnlJbmRleGVzQnVpbGRlcnMubGVuZ3RoIC0gMV0pO1xuICAgIH1cblxuICAgIHRoaXMuZ2xvYmFsU2Vjb25kYXJ5SW5kZXhlc0J1aWxkZXJzLnB1c2goYnVpbGRlcik7XG5cbiAgICB0aGlzLl9nbG9iYWxTZWNvbmRhcnlJbmRleFNjaGVtYXMuc2V0KHByb3BzLmluZGV4TmFtZSwge1xuICAgICAgcGFydGl0aW9uS2V5OiBwcm9wcy5wYXJ0aXRpb25LZXksXG4gICAgICBzb3J0S2V5OiBwcm9wcy5zb3J0S2V5LFxuICAgIH0pO1xuXG4gICAgdGhpcy5faW5kZXhTY2FsaW5nLnNldChwcm9wcy5pbmRleE5hbWUsIHt9KTtcbiAgfVxufVxuIl19