const Migration = require('@smallprod/models').Migration;

 /**
 *
 * @param {Migration} migration
 */
const up = (migration) => {
    const alter = migration.alterTable('user');

   alter.removeField('firstname');
   alter.removeField('createdAt');
   alter.removeField('age');
   alter.addField('firstname', 'varchar').length(50);
   alter.addField('lastname', 'varchar').length(50);
   alter.addField('birthDate', 'date').allowNull();
};

/*
 * @param {Migration} migration
 */
const down = (migration) => {
    migration.dropTable('user');
};

module.exports = {
   name: 'alter-table-user-3',
    up,
   down,
};