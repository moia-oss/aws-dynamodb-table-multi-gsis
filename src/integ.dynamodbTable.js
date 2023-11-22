#!/usr/bin/env node
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
const aws_dynamodb_1 = require("aws-cdk-lib/aws-dynamodb");
const cdk = __importStar(require("aws-cdk-lib"));
const _1 = require("./");
const app = new cdk.App();
const stack = new cdk.Stack(app, 'integ-dynamodb-table');
const testTable = new _1.Table(stack, 'TestTable', {
    partitionKey: { name: 'id', type: aws_dynamodb_1.AttributeType.STRING },
    billingMode: aws_dynamodb_1.BillingMode.PAY_PER_REQUEST,
});
testTable.addGlobalSecondaryIndex({
    indexName: 'global1',
    partitionKey: { name: 'global1', type: aws_dynamodb_1.AttributeType.STRING },
});
testTable.addGlobalSecondaryIndex({
    indexName: 'global2',
    partitionKey: { name: 'global2', type: aws_dynamodb_1.AttributeType.STRING },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZWcuZHluYW1vZGJUYWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImludGVnLmR5bmFtb2RiVGFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSwyREFBc0U7QUFDdEUsaURBQW1DO0FBQ25DLHlCQUEyQjtBQUUzQixNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUUxQixNQUFNLEtBQUssR0FBRyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLHNCQUFzQixDQUFDLENBQUM7QUFFekQsTUFBTSxTQUFTLEdBQUcsSUFBSSxRQUFLLENBQUMsS0FBSyxFQUFFLFdBQVcsRUFBRTtJQUM5QyxZQUFZLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSw0QkFBYSxDQUFDLE1BQU0sRUFBRTtJQUN4RCxXQUFXLEVBQUUsMEJBQVcsQ0FBQyxlQUFlO0NBQ3pDLENBQUMsQ0FBQztBQUVILFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQztJQUNoQyxTQUFTLEVBQUUsU0FBUztJQUNwQixZQUFZLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSw0QkFBYSxDQUFDLE1BQU0sRUFBRTtDQUM5RCxDQUFDLENBQUM7QUFFSCxTQUFTLENBQUMsdUJBQXVCLENBQUM7SUFDaEMsU0FBUyxFQUFFLFNBQVM7SUFDcEIsWUFBWSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsNEJBQWEsQ0FBQyxNQUFNLEVBQUU7Q0FDOUQsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuaW1wb3J0IHsgQXR0cmlidXRlVHlwZSwgQmlsbGluZ01vZGUgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZHluYW1vZGInO1xuaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IFRhYmxlIH0gZnJvbSAnLi8nO1xuXG5jb25zdCBhcHAgPSBuZXcgY2RrLkFwcCgpO1xuXG5jb25zdCBzdGFjayA9IG5ldyBjZGsuU3RhY2soYXBwLCAnaW50ZWctZHluYW1vZGItdGFibGUnKTtcblxuY29uc3QgdGVzdFRhYmxlID0gbmV3IFRhYmxlKHN0YWNrLCAnVGVzdFRhYmxlJywge1xuICBwYXJ0aXRpb25LZXk6IHsgbmFtZTogJ2lkJywgdHlwZTogQXR0cmlidXRlVHlwZS5TVFJJTkcgfSxcbiAgYmlsbGluZ01vZGU6IEJpbGxpbmdNb2RlLlBBWV9QRVJfUkVRVUVTVCxcbn0pO1xuXG50ZXN0VGFibGUuYWRkR2xvYmFsU2Vjb25kYXJ5SW5kZXgoe1xuICBpbmRleE5hbWU6ICdnbG9iYWwxJyxcbiAgcGFydGl0aW9uS2V5OiB7IG5hbWU6ICdnbG9iYWwxJywgdHlwZTogQXR0cmlidXRlVHlwZS5TVFJJTkcgfSxcbn0pO1xuXG50ZXN0VGFibGUuYWRkR2xvYmFsU2Vjb25kYXJ5SW5kZXgoe1xuICBpbmRleE5hbWU6ICdnbG9iYWwyJyxcbiAgcGFydGl0aW9uS2V5OiB7IG5hbWU6ICdnbG9iYWwyJywgdHlwZTogQXR0cmlidXRlVHlwZS5TVFJJTkcgfSxcbn0pO1xuIl19