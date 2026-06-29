module.exports = {
  forbidden: [
    {
      name: 'no-db-in-domain',
      comment: 'Domain layer must not depend on persistence layer',
      from: { path: '^src/domain' },
      to: { path: '^src/persistence' },
    },
    {
      name: 'no-sqlite-in-tests',
      comment: 'Tests must not use sqlite',
      severity: 'error',
      from: { path: '^spec' },
      to: { path: 'sqlite3' }
    },
  ],
};