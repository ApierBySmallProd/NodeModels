const Migration = require('../../..').Migration;

/**
 * @param {Migration} migration
 */
const up = (migration) => {
    const newTable = migration.createTable('categories');

    newTable.addField('id', 'bigint').autoIncrement().primary();
    newTable.addField('label', 'varchar').length(50).unique();
};

/**
 * @param {Migration} migration
 */
const down = (migration) => {
    migration.dropTable('categories');
};

module.exports = {
    name: 'test-create-table-1',
    up,
    down,
};