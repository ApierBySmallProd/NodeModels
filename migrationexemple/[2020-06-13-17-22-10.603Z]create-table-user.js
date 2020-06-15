const Migration = require('@smallprod/models').Migration;

 /**
 *
 * @param {Migration} migration
 */
const up = (migration) => {
    const newTable = migration.createTable('user');

   newTable.addField('id', 'bigint').autoIncrement().primary();
   newTable.addField('firstname', 'varchar').length(50);
   newTable.addField('lastname', 'varchar').length(50);
   newTable.addField('email', 'varchar').length(50).unique();
   newTable.addField('birthDate', 'date').allowNull();
};

/*
 * @param {Migration} migration
 */
const down = (migration) => {
    migration.dropTable('user');
};

module.exports = {
   name: 'create-table-user-7',
    up,
   down,
};