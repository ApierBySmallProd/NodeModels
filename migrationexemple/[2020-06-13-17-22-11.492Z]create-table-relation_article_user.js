const Migration = require('@smallprod/models').Migration;

 /**
 *
 * @param {Migration} migration
 */
const up = (migration) => {
    const newTable = migration.createTable('relation_article_user');

   newTable.addField('user_id', 'bigint').foreign('user', 'id');
   newTable.addField('article_id', 'bigint').foreign('article', 'id');
};

/*
 * @param {Migration} migration
 */
const down = (migration) => {
    migration.dropTable('relation_article_user');
};

module.exports = {
   name: 'create-table-relation_article_user-10',
    up,
   down,
};