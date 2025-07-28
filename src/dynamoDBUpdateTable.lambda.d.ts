import type { IsCompleteResponse, IsCompleteRequest } from 'aws-cdk-lib/custom-resources/lib/provider-framework/types';
export declare function handler(event: any): Promise<any>;
export declare function onEventHandler(event: any): Promise<any>;
export declare function isCompleteHandler(event: IsCompleteRequest): Promise<IsCompleteResponse>;
