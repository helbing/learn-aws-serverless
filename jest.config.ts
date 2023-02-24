import type { Config } from "jest"
import { defaults } from "jest-config"

const config: Config = {
  moduleFileExtensions: [...defaults.moduleFileExtensions, "mts"],
  preset: "ts-jest",
  collectCoverage: true,
  clearMocks: true,
  passWithNoTests: true,
  globals: {
    "ts-jest": {
      isolatedModules: true,
    },
  },
  transform: {
    "^.+\\.tsx?$/": "ts-jest",
  },
}

export default config
