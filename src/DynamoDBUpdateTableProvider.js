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
exports.DynamoDBUpdateTableProvider = void 0;
const core = __importStar(require("aws-cdk-lib")); // todo remove import unused
const iam = __importStar(require("aws-cdk-lib/aws-iam"));
const cr = __importStar(require("aws-cdk-lib/custom-resources"));
const dynamoDBUpdateTable_function_1 = require("./dynamoDBUpdateTable-function");
// export interface DynamoDBUpdateTableProviderProps {}
/**
 * A Custom Resource provider capable of creating AWS Accounts
 */
class DynamoDBUpdateTableProvider extends core.NestedStack {
    constructor(scope, id) {
        super(scope, id);
        const onEvent = new dynamoDBUpdateTable_function_1.DynamoDBUpdateTableFunction(this, 'DynamoDBTableUpdate', {
            role: new iam.Role(this, 'id', {
                roleName: 'id',
                assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
                managedPolicies: [
                    iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
                    iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonDynamoDBFullAccess'),
                ],
            }),
        });
        this.provider = new cr.Provider(this, 'DynamoDBUpdateTableProvider', {
            onEventHandler: onEvent,
            isCompleteHandler: onEvent,
        });
    }
    /**
     * Creates a stack-singleton resource provider nested stack.
     */
    static getOrCreate(scope) {
        const stack = core.Stack.of(scope);
        const uid = '@aws-cdk/aws-dynamodb.GSIsUpdateProvider';
        return stack.node.tryFindChild(uid) || new DynamoDBUpdateTableProvider(stack, uid);
    }
}
exports.DynamoDBUpdateTableProvider = DynamoDBUpdateTableProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRHluYW1vREJVcGRhdGVUYWJsZVByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiRHluYW1vREJVcGRhdGVUYWJsZVByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsa0RBQW9DLENBQUMsNEJBQTRCO0FBQ2pFLHlEQUEyQztBQUMzQyxpRUFBbUQ7QUFHbkQsaUZBQTZFO0FBQzdFLHVEQUF1RDtBQUV2RDs7R0FFRztBQUNILE1BQWEsMkJBQTRCLFNBQVEsSUFBSSxDQUFDLFdBQVc7SUFlL0QsWUFBWSxLQUFnQixFQUFFLEVBQVU7UUFDdEMsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVqQixNQUFNLE9BQU8sR0FBRyxJQUFJLDBEQUEyQixDQUFDLElBQUksRUFBRSxxQkFBcUIsRUFBRTtZQUMzRSxJQUFJLEVBQUUsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUU7Z0JBQzdCLFFBQVEsRUFBRSxJQUFJO2dCQUNkLFNBQVMsRUFBRSxJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxzQkFBc0IsQ0FBQztnQkFDM0QsZUFBZSxFQUFFO29CQUNmLEdBQUcsQ0FBQyxhQUFhLENBQUMsd0JBQXdCLENBQUMsMENBQTBDLENBQUM7b0JBQ3RGLEdBQUcsQ0FBQyxhQUFhLENBQUMsd0JBQXdCLENBQUMsMEJBQTBCLENBQUM7aUJBQ3ZFO2FBQ0YsQ0FBQztTQUNILENBQUMsQ0FBQztRQUdILElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSw2QkFBNkIsRUFBRTtZQUNuRSxjQUFjLEVBQUUsT0FBTztZQUN2QixpQkFBaUIsRUFBRSxPQUFPO1NBQzNCLENBQUMsQ0FBQztJQUNMLENBQUM7SUFqQ0Q7O09BRUc7SUFDSSxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQWdCO1FBQ3hDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ25DLE1BQU0sR0FBRyxHQUFHLDBDQUEwQyxDQUFDO1FBQ3ZELE9BQVEsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFpQyxJQUFJLElBQUksMkJBQTJCLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3RILENBQUM7Q0EyQkY7QUFuQ0Qsa0VBbUNDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY29yZSBmcm9tICdhd3MtY2RrLWxpYic7IC8vIHRvZG8gcmVtb3ZlIGltcG9ydCB1bnVzZWRcbmltcG9ydCAqIGFzIGlhbSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcbmltcG9ydCAqIGFzIGNyIGZyb20gJ2F3cy1jZGstbGliL2N1c3RvbS1yZXNvdXJjZXMnO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5cbmltcG9ydCB7IER5bmFtb0RCVXBkYXRlVGFibGVGdW5jdGlvbiB9IGZyb20gJy4vZHluYW1vREJVcGRhdGVUYWJsZS1mdW5jdGlvbic7XG4vLyBleHBvcnQgaW50ZXJmYWNlIER5bmFtb0RCVXBkYXRlVGFibGVQcm92aWRlclByb3BzIHt9XG5cbi8qKlxuICogQSBDdXN0b20gUmVzb3VyY2UgcHJvdmlkZXIgY2FwYWJsZSBvZiBjcmVhdGluZyBBV1MgQWNjb3VudHNcbiAqL1xuZXhwb3J0IGNsYXNzIER5bmFtb0RCVXBkYXRlVGFibGVQcm92aWRlciBleHRlbmRzIGNvcmUuTmVzdGVkU3RhY2sge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIHN0YWNrLXNpbmdsZXRvbiByZXNvdXJjZSBwcm92aWRlciBuZXN0ZWQgc3RhY2suXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGdldE9yQ3JlYXRlKHNjb3BlOiBDb25zdHJ1Y3QpIHtcbiAgICBjb25zdCBzdGFjayA9IGNvcmUuU3RhY2sub2Yoc2NvcGUpO1xuICAgIGNvbnN0IHVpZCA9ICdAYXdzLWNkay9hd3MtZHluYW1vZGIuR1NJc1VwZGF0ZVByb3ZpZGVyJztcbiAgICByZXR1cm4gKHN0YWNrLm5vZGUudHJ5RmluZENoaWxkKHVpZCkgYXMgRHluYW1vREJVcGRhdGVUYWJsZVByb3ZpZGVyKSB8fCBuZXcgRHluYW1vREJVcGRhdGVUYWJsZVByb3ZpZGVyKHN0YWNrLCB1aWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBjdXN0b20gcmVzb3VyY2UgcHJvdmlkZXIuXG4gICAqL1xuICBwdWJsaWMgcmVhZG9ubHkgcHJvdmlkZXI6IGNyLlByb3ZpZGVyO1xuXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcpIHtcbiAgICBzdXBlcihzY29wZSwgaWQpO1xuXG4gICAgY29uc3Qgb25FdmVudCA9IG5ldyBEeW5hbW9EQlVwZGF0ZVRhYmxlRnVuY3Rpb24odGhpcywgJ0R5bmFtb0RCVGFibGVVcGRhdGUnLCB7XG4gICAgICByb2xlOiBuZXcgaWFtLlJvbGUodGhpcywgJ2lkJywge1xuICAgICAgICByb2xlTmFtZTogJ2lkJyxcbiAgICAgICAgYXNzdW1lZEJ5OiBuZXcgaWFtLlNlcnZpY2VQcmluY2lwYWwoJ2xhbWJkYS5hbWF6b25hd3MuY29tJyksXG4gICAgICAgIG1hbmFnZWRQb2xpY2llczogW1xuICAgICAgICAgIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZSgnc2VydmljZS1yb2xlL0FXU0xhbWJkYUJhc2ljRXhlY3V0aW9uUm9sZScpLFxuICAgICAgICAgIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZSgnQW1hem9uRHluYW1vREJGdWxsQWNjZXNzJyksXG4gICAgICAgIF0sXG4gICAgICB9KSxcbiAgICB9KTtcblxuXG4gICAgdGhpcy5wcm92aWRlciA9IG5ldyBjci5Qcm92aWRlcih0aGlzLCAnRHluYW1vREJVcGRhdGVUYWJsZVByb3ZpZGVyJywge1xuICAgICAgb25FdmVudEhhbmRsZXI6IG9uRXZlbnQsXG4gICAgICBpc0NvbXBsZXRlSGFuZGxlcjogb25FdmVudCxcbiAgICB9KTtcbiAgfVxufVxuIl19