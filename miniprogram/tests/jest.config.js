module.exports = {
  // 测试环境
  testEnvironment: 'node',
  
  // 测试文件匹配模式
  testMatch: [
    '**/tests/**/*.test.ts',
    '**/tests/**/*.test.js'
  ],
  
  // 模块文件扩展名
  moduleFileExtensions: ['ts', 'js', 'json'],
  
  // TypeScript 转换配置
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  
  // 模块路径映射
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@utils/(.*)$': '<rootDir>/utils/$1'
  },
  
  // 覆盖率配置
  collectCoverage: true,
  collectCoverageFrom: [
    'utils/**/*.ts',
    '!utils/**/*.d.ts',
    '!utils/**/*.config.ts'
  ],
  coverageDirectory: 'tests/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  
  // 覆盖率阈值
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // 设置文件
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  
  // 清除模拟
  clearMocks: true,
  
  // 详细输出
  verbose: true,
  
  // 全局变量
  globals: {
    'ts-jest': {
      tsconfig: {
        compilerOptions: {
          target: 'es2017',
          module: 'commonjs',
          lib: ['es2017'],
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true
        }
      }
    }
  },
  
  // 忽略的路径
  testPathIgnorePatterns: [
    '/node_modules/',
    '/miniprogram_npm/'
  ],
  
  // 模拟模块
  moduleNameMapping: {
    '^tdesign-miniprogram/(.*)$': '<rootDir>/tests/mocks/tdesign-miniprogram.js'
  }
};