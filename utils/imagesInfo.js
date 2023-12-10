import lodash from "lodash"

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

    // 根据条件生成SQL，获取随机图片信息
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

    // 生成条件语句
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

    // 获取所有角色名tag
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

    // 从数据库所有图片中随机获取一张图片信息
    async getRandomImgInfo(num = 1) {
        const tableNames = await this.getTableNames()
        const sql = this.unionQuery(["author", "name", "branch", "tag", "game", "mode", "fileName"], tableNames)
        const res = await dbInfo.selData(sql)
        if (res.code === 1) {
            logger.error(res.msg)
            return false
        }
        const rdData = []
        for (let i=0; i<num; i++) {
            rdData.push(res.data[Math.floor(Math.random() * res.data.length)])
        }
        return rdData
    }

    // 获取所有表
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

    // 重置表，删除再重新创建！
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

    // 生成查询语句
    unionQuery(fields = [], tableNames = []) {
        if (tableNames.length === 0) {
            return false
        }

        if (fields?.length === 0) fields = ['*']

        const unionQuerySQL = tableNames.map((tableName, index) => {
            const separator = index === 0 ? '' : ' UNION '
            return `${separator}SELECT ${fields.join(',')} FROM ${tableName}`
        }).join('')
        return unionQuerySQL + ';'
    }

    // 格式化仓库名name，转化为合适的表名
    formatTableName(tableName) {
        return 'imgs_' + tableName.replace(/\-/g, '_')
    }

    // 获取代理前缀url
    async getPreUrl(picInfo = {}, cfg = {}, isDataUrl = false) {
        const name = picInfo?.name, author = picInfo?.author, branch = picInfo?.branch
        if (!isDataUrl && cfg?.useLocalRepos) return `file://${this._PATH}/repos/${name}`
        switch (cfg?.useProxy) {
            case 0:
                // GitHub直链
                return `${cfg.proxies[0]}/${author}/${name}/${branch}`
            case 1:
                // ghproxy代理
                return `${cfg.proxies[1]}/${cfg.proxies[0]}/${author}/${name}/${branch}`
            case 2:
                // jsdelivr代理
                return `${cfg.proxies[2]}/${author}/${name}@${branch}`
            case 3:
                // ChinaJsDelivr代理
                return `${cfg.proxies[3]}/${author}/${name}@${branch}`
            case 4:
                // moeyy代理
                return `${cfg.proxies[4]}/${cfg.proxies[0]}/${author}/${name}/${branch}`
            default:
                // 默认返回 3 
                return `${cfg.proxies[3]}/${author}/${name}@${branch}`
        }
    }

}

export default new ImagesInfo();
