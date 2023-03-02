import { typeMatch } from "./index"

describe("Check image type", () => {
  test("Expect match success", () => {
    expect(typeMatch(["png"], "xxx.png")).toBeTruthy()
  })

  test("Expect match failed", () => {
    expect(typeMatch(["jpg"], "xxx.png")).toBeFalsy()
  })
})
