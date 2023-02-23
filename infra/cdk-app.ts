import * as cdk from "aws-cdk-lib"
import { Construct } from "constructs"
import cdkResizeImage from "./features/cdk-resize-image"

export default class CDKApp extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    cdkResizeImage(scope)
  }
}
