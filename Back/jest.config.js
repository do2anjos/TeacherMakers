const os = require('os');
const path = require('path');

module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  clearMocks: true,
  coverageDirectory: process.env.COVERAGE_DIR || path.join(os.tmpdir(), `teachermakers-coverage-${process.pid}-${Date.now()}`),
  collectCoverageFrom: [
    'src/controllers/progressController.js',
    'src/controllers/authController.js',
    'src/controllers/contentController.js',
    'src/controllers/diagnosticController.js',
    'src/services/authService.js',
    'src/services/contentService.js',
    'src/services/diagnosticService.js',
    'src/middlewares/errorHandler.js'
  ],
  coverageThreshold: {
    'src/controllers/progressController.js': { statements: 80, branches: 70, functions: 80, lines: 80 },
    'src/controllers/authController.js': { statements: 90, branches: 80, functions: 100, lines: 90 },
    'src/controllers/contentController.js': { statements: 90, branches: 90, functions: 90, lines: 90 },
    'src/services/authService.js': { statements: 95, branches: 95, functions: 100, lines: 95 },
    'src/services/contentService.js': { statements: 90, branches: 75, functions: 85, lines: 90 }
  }
};
