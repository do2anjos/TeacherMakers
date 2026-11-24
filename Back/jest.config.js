const os = require('os');
const path = require('path');

module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  clearMocks: true,
  coverageDirectory: process.env.COVERAGE_DIR || path.join(os.tmpdir(), `teachermakers-coverage-${process.pid}-${Date.now()}`),
  collectCoverageFrom: [
    'src/controllers/progressController.js',
    'src/controllers/diagnosticController.js',
    'src/services/diagnosticService.js',
    'src/middlewares/errorHandler.js'
  ],
  coverageThreshold: {
    'src/controllers/progressController.js': { statements: 80, branches: 70, functions: 80, lines: 80 }
  }
};
