export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        'contracts',
        'web',
        'docs',
        'indexer',
        'workers',
        'sdk',
        'api',
        'db',
        'ui',
        'brand',
        'abi',
        'infra',
        'deps',
      ],
    ],
    'scope-empty': [1, 'never'],
  },
};
