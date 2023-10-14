module.exports = {
    "roots": ["<rootDir>","."],
    "transform": { "^.+\\.tsx?$": "ts-jest" },
    transformIgnorePatterns: [
        '<rootDir>/node_modules/'
    ],
    "moduleFileExtensions": ['ts', 'js', 'mjs', 'cjs', 'jsx', 'tsx', 'json', 'node'],
    "verbose": true,
    "collectCoverage": false,
    "collectCoverageFrom": ['**/*.{ts,jsx}'],
    "coveragePathIgnorePatterns": ["/node_modules/", "/commands/.+Mock.ts", "/commands/ObsidianProxy.ts", "main.ts"]
}
