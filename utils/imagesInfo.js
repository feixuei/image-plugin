// import fs from 'node:fs'
import sqlite3 from "sqlite3"
import lodash from "lodash"

import utils from "./utils.js"
import dbInfo from './dbInfo.js';

class ImagesInfo {
    constructor() {
        this.table = 'images'
        this._PATH = `${process.cwd().replace(/\\/g, '/')}/plugins/image-plugin`
        this.dbPath = `${this._PATH}/data/images.db`
        this.defData = utils.readJson(`${this._PATH}/defSet/data.json`)
    }

    async updateImageInfo(data = {}) {
        if (lodash.isEmpty(data)) return false
        for (let tag in data.tags) {
            for (let mode in data.tags[tag].images) {
                for (let pic of data.tags[tag].images[mode]) {
                    let sql = `INSERT INTO ${this.table} (author, name, branch, tag, game, mode, fileName, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP);`
                    let res = await dbInfo.runQuery(sql, [data?.author, data?.name, data?.branch, tag, data?.game, mode, pic])
                    if (res?.code === 1) {
                        logger.error(res?.msg)
                        return false
                    }
                }
            }
        }
        return true
    }

    async getImages(tag = '', game = 'gs', mode = 'safe') {
        let sql = `SELECT id, author, name, branch, tag, game, mode, fileName FROM ${this.table} WHERE tag="${tag}" AND game="${game}" AND mode="${mode}"`
        const res = await dbInfo.selData(sql)
        if (res.code === 1) return false
        return res.data
    }

    async getTags() {
        let sql = `SELECT DISTINCT tag FROM ${this.table};`
        const res = await dbInfo.selData(sql)
        if (res.code === 1) return false
        return res.data.map(obj => Object.values(obj)[0])
    }

    async refreshTable(tableName = this.table) {
        if (tableName === '') return false
        let res = await dbInfo.runQuery(`DELETE FROM ${tableName};`)
        if (res.code === 1) {
            logger.error(res.msg)
            return false
        }
        res = await dbInfo.runQuery(`VACUUM;`)
        if (res.code === 1) {
            logger.error(res.msg)
            return false
        }
        return true
    }

    async getData(sql) {
        /* SQL查表 */
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    logger.error(`[查表失败] ${sql}: ${err}`)
                    reject(err)
                    return false
                }
                db.all(sql, [], (err, rows) => {
                    if (err) {
                        logger.error(`[查表失败] ${sql}: ${err}`)
                        reject(err)
                        return false
                    }
                    resolve(rows)
                })
            })
            db.close()
        })

    }

    async getPreUrl(pic = {}, cfg= {}) {
        const name = pic?.name, author =pic?.author, branch = pic?.branch
        if (cfg?.useLocalRepos) return `file://${this._PATH}/repos/${name}`
        switch (cfg?.useProxy) {
            case 0:
                return `${cfg?.rawUrl}/${author}/${name}/${branch}`
            case 1:
                return `${cfg?.ghUrl}/${cfg?.rawUrl}/${author}/${name}/${branch}`
            case 2:
                return `${cfg?.jdUrl}/${author}/${name}@${branch}`
            default:
                return `${cfg?.jdUrl}/${author}/${name}@${branch}`
        }
    }

}

export default new ImagesInfo();
