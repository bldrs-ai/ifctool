module.exports = {
  verbose: false,
  projects: [
    {
      displayName: 'ifclib',
      testMatch: ['<rootDir>/lib/src/**/*.test.js'],
      testEnvironment: 'node',
      testPathIgnorePatterns: [],
      transform: {
        '\\.js?$': 'babel-jest',
      },
      transformIgnorePatterns: [
        '/node_modules/(?!(web-ifc)/)',
      ],
      moduleNameMapper: {},
      setupFilesAfterEnv: [
        '<rootDir>/setupTests.js',
      ],
    },
  ],
}
