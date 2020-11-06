const Migration = require('../../..').Migration;

/**
 * @param {Migration} migration
 */
const up = (migration) => {
    const alteredTable = migration.alterTable('articles');

    // Not working for now
    // alteredTable.removeField('category_id');
    // alteredTable.renameField('category_id', 'cat_id');
    // alteredTable.changeField('category_id').removeConstraint('allow_null');
    // alteredTable.changeField('category_id').default('1');
    // alteredTable.changeField('nb_pages').setType('bigint');

    alteredTable.removeField('published_at');
    alteredTable.addField('likes', 'bigint').default(0);
};

/**
 * @param {Migration} migration
 */
const down = (migration) => {
    const alteredTable = migration.alterTable('articles');
    alteredTable.addField('published_at', 'date').allowNull();
    alteredTable.removeField('likes');
};

module.exports = {
    name: 'test-alter-table-1',
    up,
    down,
};