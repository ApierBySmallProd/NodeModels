const MigrationManager = require('../../../dist/migration/migrate.js').default;
const MariaModel = require('../../../dist/dbs/exemples/maria.ex.js').default;

const model = MariaModel.GetModel();
const command = process.argv[2];
const targetMigration = process.argv[3];

(async() => {
    await model.setPool({
        user: 'make_admin',
        host: 'localhost',
        database: 'make_db',
        password: 'secret',
        port: 3306,
    });
    const manager = new MigrationManager({
        migrationPath: './migrationexemple',
        database: model,
    });
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
