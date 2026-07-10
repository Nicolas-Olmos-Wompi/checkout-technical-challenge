module.exports = {
  preset: 'ts-jest',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: '.e2e-spec.ts$',
  setupFiles: ['reflect-metadata'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  transformIgnorePatterns: ['<rootDir>/../node_modules/(?!uuid|jose)/'],
  modulePaths: ['<rootDir>/..'],
  coverageDirectory: '../coverage-e2e',
};
