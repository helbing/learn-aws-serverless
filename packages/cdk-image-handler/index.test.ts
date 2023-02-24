test("adds 1 + 2 to equal 3", () => {
  // Arrange
  const x = 1,
    y = 2
  const expected = 3

  // Act
  const actual: number = x + y
  // Assert
  expect(actual).toBe(expected)
})
