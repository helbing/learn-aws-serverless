#!/usr/bin/env node

import "source-map-support/register"
import * as cdk from "aws-cdk-lib"
import CDKApp from "../infra/cdk-app"

const app = new cdk.App()
new CDKApp(app, "AppStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || "ap-northeast-1",
  },
})
