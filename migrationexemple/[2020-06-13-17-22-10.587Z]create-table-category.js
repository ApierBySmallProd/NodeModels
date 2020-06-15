const Migration = require('@smallprod/models').Migration;

 /**
 *
 * @param {Migration} migration
 */
const up = (migration) => {
    const newTable = migration.createTable('category');

   newTable.addField('id', 'bigint').autoIncrement().primary();
   newTable.addField('label', 'varchar').length(50).unique();
};

/*
 * @param {Migration} migration
 */
const down = (migration) => {
    migration.dropTable('category');
};

module.exports = {
   name: 'create-table-category-4',
    up,
   down,
};