# aws-cdk-lib/aws-dynamodb + multi GSIs update capability

_This branch bumps version compatibility of the construct to CDK 2.x while removing most dependency to projen._
_It also introduces a significant regression in test coverage (read; none) which is why it is not in a state to re-contribute to mainline development._
_If you still choose to use it in your project as is, please publish to a (private) registry of your choosing as per the instructions under the Development section._

This construct is fixing https://github.com/aws/aws-cdk/issues/12246 by simply overriding [@aws-cdk/aws-dynamodb Table addGlobalSecondaryIndex](https://github.com/aws/aws-cdk/blob/master/packages/%40aws-cdk/aws-dynamodb/lib/table.ts#L1231) which will leverage the [@aws-cdk/custom-resource Provider](https://docs.aws.amazon.com/cdk/api/v1/docs/custom-resources-readme.html) to sequentially create Global GSIs.

## Usage

Use `aws-cdk-lib/aws-dynamodb` as usual except for `Table` that needs to come from `aws-dynamodb-table-multi-gsis` :


```typescript
import { AttributeType, BillingMode } from 'aws-cdk-lib/aws-dynamodb';
import * as cdk from 'aws-cdk-lib/core';

// Import the new version of Table
import { Table as MultiGsisTable } from '<your-registry>/aws-dynamodb-table-multi-gsis';

const app = new cdk.App();

const stack = new cdk.Stack(app, 'integ-dynamodb-table');

const testTable = new MultiGsisTable(stack, 'TestTable', {
  partitionKey: { name: 'id', type: AttributeType.STRING },
  billingMode: BillingMode.PAY_PER_REQUEST,
});

testTable.addGlobalSecondaryIndex({
  indexName: 'global1',
  partitionKey: { name: 'global1', type: AttributeType.STRING },
});

testTable.addGlobalSecondaryIndex({
  indexName: 'global2',
  partitionKey: { name: 'global2', type: AttributeType.STRING },
});
```

## Potential caveat

If the existing table already has 
* 1 GSI, it will delete it and recreate it with new way of managing GSIs ...
* 2 or more GSIs, update will fail because it will try to delete those GSIs and recreate them with the new method but since it's not possible to delete more than one using the old management system the stack update will fail :( => workaround delete those GSIs from your cdk app before changing to new implementation

## Development

After installing the project dependencies (`npm ci`) you will be able to use the supplied scripts to compile and publish a package to a registry of your choosing.
Make sure to adapt the package name in the `package.json` to match your target registry and package name before publishing.
Also consider bumping the package version when making changes to the construct according to [semver](https://semver.org/).
The `0.2.x` version used on this branch indicates the pre-release state of the package and suggests CDK 2.x compatibility.
