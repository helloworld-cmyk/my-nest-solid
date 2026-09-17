export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      1,
      'always',
      [
        'auth',
        'profile',
        'category',
        'product',
        'payment',
        'address',
        // hạ tầng & cross-cutting
        'prisma',
        'db',
        'config',
        'swagger',
        'socket',
        'docker',
        'ci',
        'deps',
        'docs',
        'repo',
      ],
    ],
  },
};
