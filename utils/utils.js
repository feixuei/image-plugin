import fs from 'node:fs'
import YAML from 'yaml'
import fetch from 'node-fetch'


class Utils {
    constructor() {
        this._PATH = `${process.cwd().replace(/\\/g, '/')}/plugins/image-plugin`
        this.CFG_PATH = `${this._PATH}/config`
        this.DATA_PATH = `${this._PATH}/data`
    }
    getCfg(fileName) {
        let data = this.readYaml(`${this.CFG_PATH}/${fileName}.yaml`)
        if (data) return data
        return this.readYaml(`${this.CFG_PATH}/default_${fileName}.yaml`)
    }

    saveCfg(fileName, data = {}) {
        return this.saveYaml(`${this.CFG_PATH}/${fileName}.yaml`, data)
    }

    getData(fileName) {
        return this.readJson(`${this.DATA_PATH}/${fileName}.json`)
    }

    saveData(fileName, data = {}) {
        return this.saveJson(`${this.DATA_PATH}/${fileName}.json`, data)
    }

    readYaml(filePath) {
        try {
            return YAML.parse(fs.readFileSync(filePath, 'utf8'))
        } catch (err) {
            logger.error(`[Utils][readYaml] ${err}`)
        }
        return false
    }

    readJson(filePath) {
        try {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'))
        } catch (err) {
            logger.error(`[Utils][readJson] ${err}`)
        }
        return false
    }

    saveYaml(filePath, data) {
        try {
            fs.writeFileSync(filePath, YAML.stringify(data), 'utf8')
            return true
        } catch (err) {
            logger.error(`[Utils][saveYaml] ${err}`)
        }
        return false
    }

    saveJson(filePath, data) {
        try {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8')
            return true
        } catch (err) {
            logger.error(`[Utils][saveJson] ${err}`)
        }
        return false
    }

    checkFile(filePath) {
        if (fs.existsSync(filePath)) {
            return true
        } else { return false }
    }

/**
params = {
    method: "GET",
    body: JSON.stringify({
        a: "1",
        b: "2"
    }),
    headers: {
        "Content-Type": "application/json"
    }
    timeout: 60000
}

 */

    async fetchData(url, params={}) {

        let response = {}
        try {
            response = await fetch(url, params)
        } catch (err) {
            logger.error(`[utils fetchData] ${err}`)
            return false
        }

        if (!response.ok) {
            logger.error(`[utils fetchData] ${response.status} ${response.statusText}`)
            return false
        }

        let res = await response.text()
        if (res.startsWith('(')) {
            res = JSON.parse((res).replace(/\(|\)/g, ""))
        } else {
            res = JSON.parse(res)
        }
        if (!res) {
            logger.mark(`[utils fetchData]${type}接口没有返回`)
            return false
        }
        return res
    }

}
export default new Utils()
