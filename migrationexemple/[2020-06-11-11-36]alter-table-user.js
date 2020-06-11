const Migration = require('../dist/migration/migration.js').default; // Replace this with require('@smallprod/migration').default.migration.Migration
/**
 *
 * @param {Migration} migration
 */
const up = (migration) => {
  const alter = migration.alterTable('user');
  alter.addField('firstname', 'varchar').length(255).allowNull();
  // alter.removeField('age'); // ! TODO fix this
};

/**
 *
 * @param {Migration} migration
 */
const down = (migration) => {
  migration.seedTable('user').clearTable();
};

module.exports = {
  name: 'alter-table-user',
  up,
  down,
};
