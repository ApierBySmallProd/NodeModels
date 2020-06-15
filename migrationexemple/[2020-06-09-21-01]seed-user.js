const Migration = require('../dist/migration/migration.js').default; // Replace this with require('@smallprod/migration').default.migration.Migration
/**
 *
 * @param {Migration} migration
 */
const up = (migration) => {
    /*const seed = migration.seedTable('user');
      seed.addRow().add('email', 'toto@toto.com').add('age', 18);*/
};

/**
 *
 * @param {Migration} migration
 */
const down = (migration) => {
    migration.seedTable('user').clearTable();
};

module.exports = {
    name: 'seed-user',
    up,
    down,
};