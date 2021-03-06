const MigrationManager = require('@smallprod/models').MigrationManager;
const DbManager = require('@smallprod/models').DbManager;

const command = process.argv[2];
const targetMigration = process.argv[3];

(async() => {
    const dbManager = DbManager.get();
    dbManager.setConfig({ migrationPath: './migrationexemple' });
    await dbManager.add(
        'mariadb',
        'localhost',
        3306,
        'make_admin',
        'secret',
        'make_db',
        '',
        true,
    );

    const manager = new MigrationManager();
    switch (command) {
        case 'migrate':
            {
                await manager.migrate(targetMigration);
                break;
            }
        case 'reset':
            {
                await manager.reset(targetMigration);
                break;
            }
        default:
            {
                console.error('Invalid command');
            }
    }
    process.exit(0);
})();