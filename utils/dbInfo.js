import sqlite3 from "sqlite3"

const FIELDS = [
    { name: "id", type: "INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT" },
    { name: "author", type: "VARCHAR NOT NULL" },
    { name: "tag", type: "VARCHAR NOT NULL" },
    { name: "game", type: "VARCHAR NOT NULL" },
    { name: "mode", type: "VARCHAR NOT NULL" },
    { name: "name", type: "VARCHAR NOT NULL" },
    { name: "preUrl", type: "VARCHAR NOT NULL" },
    { name: "fileName", type: "VARCHAR NOT NULL" },
    { name: "createdAt", type: "DATETIME NOT NULL" },
]

class DB {
    constructor() {
        this.table = 'images'
        this.dbPath = `${process.cwd()}/plugins/image-plugin/data/images.db`
        this.createTable(this.table, FIELDS)
    }

    async runQuery(sql, params = []) {
        return new Promise((resolve) => {
            const db = new sqlite3.Database(this.dbPath);
            db.run(sql, params, function (err) {
                if (err) {
                    resolve({ "code": 1, "msg": String(err), "data": "" });
                } else { resolve({ "code": 0, "msg": "true", "data": "" }) }
            });
            db.close();
        });
    }
    
    async selData(sql) {
        return new Promise((resolve) => {
            const db = new sqlite3.Database(this.dbPath);
            db.all(sql, [], (err, rows) => {
                if (err) {
                    resolve({ "code": 1, "msg": String(err), "data": "" });
                } else { resolve({ "code": 0, "msg": "true", "data": rows }) }
            });
            db.close();
        });
    }

    async createTable(tableName, columns) {
        const columnDefinitions = columns.map((column) => `${column.name} ${column.type}`).join(', ');
        const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefinitions});`;
        try {
            return await this.runQuery(sql);
        } catch (error) {
            logger.error(`Error creating table: ${error}`)
            return false;
        }

    }

}

export default new DB()
