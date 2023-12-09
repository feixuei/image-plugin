import lodash from "lodash"

import utils from "./utils.js"
import dbInfo from './dbInfo.js';

class ImagesInfo {
    constructor() {
        this._PATH = `${process.cwd().replace(/\\/g, '/')}/plugins/image-plugin`
    }

    async updateImageInfo(data = {}, tableName) {
        if (lodash.isEmpty(data)) return false
        tableName = this.formatTableName(tableName)
        for (let tag in data.tags) {
            for (let mode in data.tags[tag].images) {
                for (let pic of data.tags[tag].images[mode]) {
                    let sql = `INSERT INTO ${tableName} (author, name, branch, tag, game, mode, fileName, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP);`
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

    async getImages(wheres = {}) {
        const fields = [ "id", "author", "name", "branch", "tag", "game", "mode", "fileName" ]
        const tableNames = await this.getTableNames()
        const whereClause = this.generateWhereClause(wheres)

        const sql = tableNames.map((tableName, index) => {
            const separator = index === 0 ? '' : ' UNION '
            return `${separator}SELECT ${fields.join(',')} FROM ${tableName}${whereClause}`
        }).join('') + ';'

        const res = await dbInfo.selData(sql)
        if (res.code === 1) return false
        return res.data
    }

    generateWhereClause(fields = {}) {
        if (Object.keys(fields).length === 0) {
            return ''
        }

        const whereClause = Object.entries(fields).map(([key, value], index) => {
            const separator = index === 0 ? '' : ' AND '
            return `${separator}${key}="${value}"`
        }).join('')

        return ` WHERE ${whereClause}`
    }

    async getTags() {
        const tableNames = await this.getTableNames()
        const unionSQL = this.unionQuery(["tag"], tableNames)
        const res = await dbInfo.selData(unionSQL)
        if (res.code === 1) {
            logger.error(res.msg)
            return false
        }
        return res.data.map(item => item.tag)
    }

    async getTableNames() {
        const sql = "SELECT name FROM sqlite_master WHERE type='table';"
        let res = await dbInfo.selData(sql)
        if (res?.code != 0) return false

        const tables = []
        for (let item of res.data) {
            if (!item.name.startsWith("imgs_")) continue
            tables.push(item.name)
        }
        return tables
    }

    async refreshTable(tableName) {
        if (tableName === '') return false
        tableName = this.formatTableName(tableName)
        let res = await dbInfo.dropTable(tableName)
        if (res.code === 1) {
            logger.error(`[删表] ${res.msg}`)
            return false
        }
        res = await dbInfo.createTable(tableName)
        if (res.code === 1) {
            logger.error(`[建表] ${res.msg}`)
            return false
        }
        logger.info(`${tableName}表 已重置！`)
        return true
    }

    unionQuery(fields = [], tableNames = []) {
        if (tableNames.length === 0) {
            return false
        }

        const unionQuerySQL = tableNames.map((tableName, index) => {
            const separator = index === 0 ? '' : ' UNION '
            return `${separator}SELECT ${fields.join(',')} FROM ${tableName}`
        }).join('')
        return unionQuerySQL + ';'
    }

    formatTableName(tableName) {
        return 'imgs_' + tableName.replace(/\-/g, '_')
    }

    async getPreUrl(picInfo = {}, cfg = {}) {
        const name = picInfo?.name, author = picInfo?.author, branch = picInfo?.branch
        if (cfg?.useLocalRepos) return `file://${this._PATH}/repos/${name}`
        switch (cfg?.useProxy) {
            case 0:
                // GitHub直链
                return `${cfg?.rawUrl}/${author}/${name}/${branch}`
            case 1:
                // ghproxy代理
                return `${cfg?.ghUrl}/${cfg?.rawUrl}/${author}/${name}/${branch}`
            case 2:
                // jsdelivr代理
                return `${cfg?.jsdUrl}/${author}/${name}@${branch}`
            case 3:
                // ChinaJsDelivr代理
                return `${cfg?.cjsdUrl}/${author}/${name}@${branch}`
            case 4:
                // moeyy代理
                return `${cfg?.moeyyUrl}/${cfg?.rawUrl}/${author}/${name}/${branch}`
            default:
                return `${cfg?.jdUrl}/${author}/${name}@${branch}`
        }
    }

}

export default new ImagesInfo();
