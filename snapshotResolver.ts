import { SnapshotResolver, isSnapshotPath } from "jest-snapshot"

const resolver: SnapshotResolver = {
  testPathForConsistencyCheck: "some/example.test.ts",
  resolveSnapshotPath: (testPath, snapshotExtension) => testPath,
  resolveTestPath: (snapshotFilePath) => snapshotFilePath,
}

export default resolver
