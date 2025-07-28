"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCompleteHandler = exports.onEventHandler = exports.handler = void 0;
const aws_sdk_1 = require("aws-sdk"); // eslint-disable-line import/no-extraneous-dependencies
async function handler(event) {
    if (event.data) {
        return isCompleteHandler(event);
    }
    else {
        return onEventHandler(event);
    }
}
exports.handler = handler;
async function onEventHandler(event) {
    console.log('Event: %j', event);
    const dynamodb = new aws_sdk_1.DynamoDB();
    const tableName = event.ResourceProperties.TableName;
    const capitalizedAttributeDefinitions = event.ResourceProperties.AttributeDefinitions;
    const capitalizedKeySchema = event.ResourceProperties.KeySchema;
    const indexName = event.ResourceProperties.IndexName;
    const capitalizedProjection = event.ResourceProperties.Projection;
    let updateTableAction;
    updateTableAction = event.RequestType;
    const params = {
        TableName: tableName,
        AttributeDefinitions: capitalizedAttributeDefinitions,
        GlobalSecondaryIndexUpdates: [
            {
                [updateTableAction]: {
                    IndexName: indexName,
                    KeySchema: updateTableAction != 'Delete' ? capitalizedKeySchema : undefined,
                    Projection: updateTableAction != 'Delete' ? capitalizedProjection : undefined,
                },
            },
        ],
    };
    console.log(`Updating table ${tableName} with params ${JSON.stringify(params)}`);
    const data = await dynamodb
        .updateTable(params)
        .promise();
    console.log('Update table: %j', data);
    return { PhysicalResourceId: `${indexName}`, data: { fwdToIsComplete: true } };
}
exports.onEventHandler = onEventHandler;
async function isCompleteHandler(event) {
    var _a, _b, _c;
    console.log('Event: %j', event);
    const dynamodb = new aws_sdk_1.DynamoDB();
    const data = await dynamodb
        .describeTable({
        TableName: event.ResourceProperties.TableName,
    })
        .promise();
    console.log('Describe table: %j', data);
    const tableActive = ((_a = data.Table) === null || _a === void 0 ? void 0 : _a.TableStatus) === 'ACTIVE';
    const indexes = (_c = (_b = data.Table) === null || _b === void 0 ? void 0 : _b.GlobalSecondaryIndexes) !== null && _c !== void 0 ? _c : [];
    const index = indexes.find((r) => r.IndexName === event.ResourceProperties.IndexName);
    const indexActive = (index === null || index === void 0 ? void 0 : index.IndexStatus) === 'ACTIVE';
    const skipIndextionCompletedWait = event.ResourceProperties.SkipIndextionCompletedWait === 'true';
    switch (event.RequestType) {
        case 'Create':
        case 'Update':
            // Complete when index is reported as ACTIVE
            return { IsComplete: tableActive && (indexActive || skipIndextionCompletedWait) };
        case 'Delete':
            // Complete when index is gone
            return { IsComplete: tableActive && index === undefined };
    }
}
exports.isCompleteHandler = isCompleteHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHluYW1vREJVcGRhdGVUYWJsZS5sYW1iZGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkeW5hbW9EQlVwZGF0ZVRhYmxlLmxhbWJkYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFLQSxxQ0FBbUMsQ0FBQyx3REFBd0Q7QUFFckYsS0FBSyxVQUFVLE9BQU8sQ0FBQyxLQUFVO0lBQ3RDLElBQUksS0FBSyxDQUFDLElBQUksRUFBRTtRQUNkLE9BQU8saUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDakM7U0FBTTtRQUNMLE9BQU8sY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQzlCO0FBQ0gsQ0FBQztBQU5ELDBCQU1DO0FBRU0sS0FBSyxVQUFVLGNBQWMsQ0FBQyxLQUFVO0lBQzdDLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBRWhDLE1BQU0sUUFBUSxHQUFHLElBQUksa0JBQVEsRUFBRSxDQUFDO0lBRWhDLE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUM7SUFDckQsTUFBTSwrQkFBK0IsR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUMsb0JBQW9CLENBQUM7SUFDdEYsTUFBTSxvQkFBb0IsR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDO0lBQ2hFLE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUM7SUFDckQsTUFBTSxxQkFBcUIsR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDO0lBQ2xFLElBQUksaUJBQWlELENBQUM7SUFDdEQsaUJBQWlCLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQztJQUN0QyxNQUFNLE1BQU0sR0FBOEI7UUFDeEMsU0FBUyxFQUFFLFNBQVM7UUFDcEIsb0JBQW9CLEVBQUUsK0JBQStCO1FBQ3JELDJCQUEyQixFQUFFO1lBQzNCO2dCQUNFLENBQUMsaUJBQWlCLENBQUMsRUFBRTtvQkFDbkIsU0FBUyxFQUFFLFNBQVM7b0JBQ3BCLFNBQVMsRUFBRSxpQkFBaUIsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxTQUFTO29CQUMzRSxVQUFVLEVBQUUsaUJBQWlCLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsU0FBUztpQkFDOUU7YUFDRjtTQUNGO0tBQ0YsQ0FBQztJQUNGLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLFNBQVMsZ0JBQWdCLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2pGLE1BQU0sSUFBSSxHQUFHLE1BQU0sUUFBUTtTQUN4QixXQUFXLENBQUMsTUFBTSxDQUFDO1NBQ25CLE9BQU8sRUFBRSxDQUFDO0lBQ2IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUV0QyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsR0FBRyxTQUFTLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxlQUFlLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQztBQUNqRixDQUFDO0FBaENELHdDQWdDQztBQUVNLEtBQUssVUFBVSxpQkFBaUIsQ0FBQyxLQUF3Qjs7SUFDOUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFFaEMsTUFBTSxRQUFRLEdBQUcsSUFBSSxrQkFBUSxFQUFFLENBQUM7SUFFaEMsTUFBTSxJQUFJLEdBQUcsTUFBTSxRQUFRO1NBQ3hCLGFBQWEsQ0FBQztRQUNiLFNBQVMsRUFBRSxLQUFLLENBQUMsa0JBQWtCLENBQUMsU0FBUztLQUM5QyxDQUFDO1NBQ0QsT0FBTyxFQUFFLENBQUM7SUFDYixPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQixFQUFFLElBQUksQ0FBQyxDQUFDO0lBRXhDLE1BQU0sV0FBVyxHQUFHLENBQUEsTUFBQSxJQUFJLENBQUMsS0FBSywwQ0FBRSxXQUFXLE1BQUssUUFBUSxDQUFDO0lBQ3pELE1BQU0sT0FBTyxHQUFHLE1BQUEsTUFBQSxJQUFJLENBQUMsS0FBSywwQ0FBRSxzQkFBc0IsbUNBQUksRUFBRSxDQUFDO0lBQ3pELE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLEtBQUssS0FBSyxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3RGLE1BQU0sV0FBVyxHQUFHLENBQUEsS0FBSyxhQUFMLEtBQUssdUJBQUwsS0FBSyxDQUFFLFdBQVcsTUFBSyxRQUFRLENBQUM7SUFDcEQsTUFBTSwwQkFBMEIsR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUMsMEJBQTBCLEtBQUssTUFBTSxDQUFDO0lBRWxHLFFBQVEsS0FBSyxDQUFDLFdBQVcsRUFBRTtRQUN6QixLQUFLLFFBQVEsQ0FBQztRQUNkLEtBQUssUUFBUTtZQUNYLDRDQUE0QztZQUM1QyxPQUFPLEVBQUUsVUFBVSxFQUFFLFdBQVcsSUFBSSxDQUFDLFdBQVcsSUFBSSwwQkFBMEIsQ0FBQyxFQUFFLENBQUM7UUFDcEYsS0FBSyxRQUFRO1lBQ1gsOEJBQThCO1lBQzlCLE9BQU8sRUFBRSxVQUFVLEVBQUUsV0FBVyxJQUFJLEtBQUssS0FBSyxTQUFTLEVBQUUsQ0FBQztLQUM3RDtBQUNILENBQUM7QUEzQkQsOENBMkJDIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuaW1wb3J0IHR5cGUge1xuICBJc0NvbXBsZXRlUmVzcG9uc2UsXG4gIElzQ29tcGxldGVSZXF1ZXN0LFxufSBmcm9tICdhd3MtY2RrLWxpYi9jdXN0b20tcmVzb3VyY2VzL2xpYi9wcm92aWRlci1mcmFtZXdvcmsvdHlwZXMnO1xuaW1wb3J0IHsgRHluYW1vREIgfSBmcm9tICdhd3Mtc2RrJzsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBpbXBvcnQvbm8tZXh0cmFuZW91cy1kZXBlbmRlbmNpZXNcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIoZXZlbnQ6IGFueSk6IFByb21pc2U8YW55PiB7XG4gIGlmIChldmVudC5kYXRhKSB7XG4gICAgcmV0dXJuIGlzQ29tcGxldGVIYW5kbGVyKGV2ZW50KTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gb25FdmVudEhhbmRsZXIoZXZlbnQpO1xuICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBvbkV2ZW50SGFuZGxlcihldmVudDogYW55KTogUHJvbWlzZTxhbnk+IHtcbiAgY29uc29sZS5sb2coJ0V2ZW50OiAlaicsIGV2ZW50KTtcblxuICBjb25zdCBkeW5hbW9kYiA9IG5ldyBEeW5hbW9EQigpO1xuXG4gIGNvbnN0IHRhYmxlTmFtZSA9IGV2ZW50LlJlc291cmNlUHJvcGVydGllcy5UYWJsZU5hbWU7XG4gIGNvbnN0IGNhcGl0YWxpemVkQXR0cmlidXRlRGVmaW5pdGlvbnMgPSBldmVudC5SZXNvdXJjZVByb3BlcnRpZXMuQXR0cmlidXRlRGVmaW5pdGlvbnM7XG4gIGNvbnN0IGNhcGl0YWxpemVkS2V5U2NoZW1hID0gZXZlbnQuUmVzb3VyY2VQcm9wZXJ0aWVzLktleVNjaGVtYTtcbiAgY29uc3QgaW5kZXhOYW1lID0gZXZlbnQuUmVzb3VyY2VQcm9wZXJ0aWVzLkluZGV4TmFtZTtcbiAgY29uc3QgY2FwaXRhbGl6ZWRQcm9qZWN0aW9uID0gZXZlbnQuUmVzb3VyY2VQcm9wZXJ0aWVzLlByb2plY3Rpb247XG4gIGxldCB1cGRhdGVUYWJsZUFjdGlvbjogJ0NyZWF0ZScgfCAnVXBkYXRlJyB8ICdEZWxldGUnO1xuICB1cGRhdGVUYWJsZUFjdGlvbiA9IGV2ZW50LlJlcXVlc3RUeXBlO1xuICBjb25zdCBwYXJhbXM6IER5bmFtb0RCLlVwZGF0ZVRhYmxlSW5wdXQgPSB7XG4gICAgVGFibGVOYW1lOiB0YWJsZU5hbWUsXG4gICAgQXR0cmlidXRlRGVmaW5pdGlvbnM6IGNhcGl0YWxpemVkQXR0cmlidXRlRGVmaW5pdGlvbnMsXG4gICAgR2xvYmFsU2Vjb25kYXJ5SW5kZXhVcGRhdGVzOiBbXG4gICAgICB7XG4gICAgICAgIFt1cGRhdGVUYWJsZUFjdGlvbl06IHtcbiAgICAgICAgICBJbmRleE5hbWU6IGluZGV4TmFtZSxcbiAgICAgICAgICBLZXlTY2hlbWE6IHVwZGF0ZVRhYmxlQWN0aW9uICE9ICdEZWxldGUnID8gY2FwaXRhbGl6ZWRLZXlTY2hlbWEgOiB1bmRlZmluZWQsXG4gICAgICAgICAgUHJvamVjdGlvbjogdXBkYXRlVGFibGVBY3Rpb24gIT0gJ0RlbGV0ZScgPyBjYXBpdGFsaXplZFByb2plY3Rpb24gOiB1bmRlZmluZWQsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIF0sXG4gIH07XG4gIGNvbnNvbGUubG9nKGBVcGRhdGluZyB0YWJsZSAke3RhYmxlTmFtZX0gd2l0aCBwYXJhbXMgJHtKU09OLnN0cmluZ2lmeShwYXJhbXMpfWApO1xuICBjb25zdCBkYXRhID0gYXdhaXQgZHluYW1vZGJcbiAgICAudXBkYXRlVGFibGUocGFyYW1zKVxuICAgIC5wcm9taXNlKCk7XG4gIGNvbnNvbGUubG9nKCdVcGRhdGUgdGFibGU6ICVqJywgZGF0YSk7XG5cbiAgcmV0dXJuIHsgUGh5c2ljYWxSZXNvdXJjZUlkOiBgJHtpbmRleE5hbWV9YCwgZGF0YTogeyBmd2RUb0lzQ29tcGxldGU6IHRydWUgfSB9O1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaXNDb21wbGV0ZUhhbmRsZXIoZXZlbnQ6IElzQ29tcGxldGVSZXF1ZXN0KTogUHJvbWlzZTxJc0NvbXBsZXRlUmVzcG9uc2U+IHtcbiAgY29uc29sZS5sb2coJ0V2ZW50OiAlaicsIGV2ZW50KTtcblxuICBjb25zdCBkeW5hbW9kYiA9IG5ldyBEeW5hbW9EQigpO1xuXG4gIGNvbnN0IGRhdGEgPSBhd2FpdCBkeW5hbW9kYlxuICAgIC5kZXNjcmliZVRhYmxlKHtcbiAgICAgIFRhYmxlTmFtZTogZXZlbnQuUmVzb3VyY2VQcm9wZXJ0aWVzLlRhYmxlTmFtZSxcbiAgICB9KVxuICAgIC5wcm9taXNlKCk7XG4gIGNvbnNvbGUubG9nKCdEZXNjcmliZSB0YWJsZTogJWonLCBkYXRhKTtcblxuICBjb25zdCB0YWJsZUFjdGl2ZSA9IGRhdGEuVGFibGU/LlRhYmxlU3RhdHVzID09PSAnQUNUSVZFJztcbiAgY29uc3QgaW5kZXhlcyA9IGRhdGEuVGFibGU/Lkdsb2JhbFNlY29uZGFyeUluZGV4ZXMgPz8gW107XG4gIGNvbnN0IGluZGV4ID0gaW5kZXhlcy5maW5kKChyKSA9PiByLkluZGV4TmFtZSA9PT0gZXZlbnQuUmVzb3VyY2VQcm9wZXJ0aWVzLkluZGV4TmFtZSk7XG4gIGNvbnN0IGluZGV4QWN0aXZlID0gaW5kZXg/LkluZGV4U3RhdHVzID09PSAnQUNUSVZFJztcbiAgY29uc3Qgc2tpcEluZGV4dGlvbkNvbXBsZXRlZFdhaXQgPSBldmVudC5SZXNvdXJjZVByb3BlcnRpZXMuU2tpcEluZGV4dGlvbkNvbXBsZXRlZFdhaXQgPT09ICd0cnVlJztcblxuICBzd2l0Y2ggKGV2ZW50LlJlcXVlc3RUeXBlKSB7XG4gICAgY2FzZSAnQ3JlYXRlJzpcbiAgICBjYXNlICdVcGRhdGUnOlxuICAgICAgLy8gQ29tcGxldGUgd2hlbiBpbmRleCBpcyByZXBvcnRlZCBhcyBBQ1RJVkVcbiAgICAgIHJldHVybiB7IElzQ29tcGxldGU6IHRhYmxlQWN0aXZlICYmIChpbmRleEFjdGl2ZSB8fCBza2lwSW5kZXh0aW9uQ29tcGxldGVkV2FpdCkgfTtcbiAgICBjYXNlICdEZWxldGUnOlxuICAgICAgLy8gQ29tcGxldGUgd2hlbiBpbmRleCBpcyBnb25lXG4gICAgICByZXR1cm4geyBJc0NvbXBsZXRlOiB0YWJsZUFjdGl2ZSAmJiBpbmRleCA9PT0gdW5kZWZpbmVkIH07XG4gIH1cbn1cbiJdfQ==