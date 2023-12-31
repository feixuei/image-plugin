import fs from 'node:fs'
import YAML from 'yaml'
import fetch from 'node-fetch'

class Utils {
    constructor() {}

    readYaml(filePath) {
        try {
            return YAML.parse(fs.readFileSync(filePath, 'utf8'))
        } catch (err) {
            // logger.error(`[Utils][readYaml] ${err}`)
            return false
        }
    }

    readJson(filePath) {
        try {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'))
        } catch (err) {
            // logger.error(`[Utils][readJson] ${err}`)
            return false
        }
    }

    saveYaml(filePath, data) {
        try {
            fs.writeFileSync(filePath, YAML.stringify(data), 'utf8')
            return true
        } catch (err) {
            // logger.error(`[Utils][saveYaml] ${err}`)
            return false
        }
    }

    saveJson(filePath, data) {
        try {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8')
            return true
        } catch (err) {
            // logger.error(`[Utils][saveJson] ${err}`)
            return false
        }
    }

    isExists(filePath) {
        if (fs.existsSync(filePath)) {
            return true
        } else { return false }
    }

    mkdirs(dirPath) {
        if (fs.existsSync(dirPath)) {
            return true
        } else {
            fs.mkdirSync(dirPath)
            return true
        }
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

    async fetchData(url, params = {}) {

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
