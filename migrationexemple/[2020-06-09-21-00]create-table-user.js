const Migration = require('../dist/migration/migration').default; // Replace this with require('@smallprod/migration').default.migration.Migration

/**
 *
 * @param {Migration} migration
 */
const up = (migration) => {
    const userTable = migration.createTable('user');

    userTable.addField('id', 'bigint').primary().autoIncrement();
    userTable.addField('email', 'varchar').length(50).unique();
    userTable.addField('createdAt', 'datetime').default('CURDATE', true);
    userTable.addField('age', 'int').default('18').check('>=18');
};

/**
 * @param {Migration} migration
 */
const down = (migration) => {
    migration.dropTable('user');
};

module.exports = {
    name: 'create-table-user',
    up,
    down,
};
