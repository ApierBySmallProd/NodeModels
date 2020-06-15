const Migration = require('@smallprod/models').Migration;

 /**
 *
 * @param {Migration} migration
 */
const up = (migration) => {
    const alter = migration.alterTable('article');

   alter.removeField('category_id');
};

/*
 * @param {Migration} migration
 */
const down = (migration) => {
    migration.dropTable('article');
};

module.exports = {
   name: 'alter-table-article-19',
    up,
   down,
};