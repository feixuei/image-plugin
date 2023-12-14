import cfg from "./cfg.js"
import imagesInfo from "./imagesInfo.js"

import fetch from "node-fetch"

class SpeedTester {
    constructor() {
        this.testNums = 6
    }

    async testTask() {
        if (!cfg.config.autoTestProxy || cfg.config.useLocalRepos) return
        logger.info(`[定时任务] 开始测试GitHub代理`)
        const res = await this.test(cfg.config)
        logger.info(res)
        if (!res || res.index == -1 || res.index === undefined) return
        cfg.set('useProxy', res.index)
        logger.info(`[定时任务] GitHub代理测试完成，更改代理为: ${res.index}`)
    }

    async test(config = {}) {
        
        const picsInfo = await imagesInfo.getRandomImgInfo(this.testNums)

        let result = []
        for (let i = 0; i < picsInfo.length; i++) {
            let urls = []
            for (let i = 0; i < this.testNums; i++) {
                config.useProxy = i
                const url = await imagesInfo.getPreUrl(picsInfo[i], config)
                urls.push(`${url}/${picsInfo[i].game}/${picsInfo[i].mode}/${picsInfo[i].fileName}`)
            }
            const testResult = await this.findFastestSpeed(urls)
            if (!testResult) continue
            result.push(testResult)
        }
        return await this.findFastestUrl(result, config?.proxies)

    }

    async findFastestUrl(urls = [], proxies = []) {
        const prefixCount = new Map()

        for (const url of urls) {
            for (let i = 0; i < proxies.length; i++) {
                const prefix = proxies[i]
                if (url.startsWith(prefix)) {
                    if (!prefixCount.has(prefix)) {
                        prefixCount.set(prefix, 0)
                    }
                    prefixCount.set(prefix, prefixCount.get(prefix) + 1)
                    break
                }
            }
        }
        let maxCount = 0
        let maxPrefix = ''

        prefixCount.forEach((count, prefix) => {
            if (count > maxCount) {
                maxCount = count
                maxPrefix = prefix
            }
        })
        if (maxPrefix === '0') return false
        return { index: proxies.indexOf(maxPrefix), prefix: maxPrefix, count: maxCount }
    }

    async testDownloadSpeed(url) {
        try {
            const startTime = Date.now()
            const response = await fetch(url)
            if (!response.ok) {
                return { [url]: 999999999 }
            }
            const endTime = Date.now()
            const downloadTime = endTime - startTime
            return { [url]: downloadTime }
        } catch (error) {
            return { [url]: 999999999 }
        }
    }

    async findFastestSpeed(urls = []) {
        const speedTests = await Promise.all(urls.map(url => this.testDownloadSpeed(url)))
        const minValue = Math.min(...speedTests.map(item => Object.values(item)[0]))

        const minObject = speedTests.find(item => Object.values(item)[0] === minValue)
        const fastestSpeed = Object.keys(minObject)[0]

        return fastestSpeed !== undefined ? fastestSpeed : false
    }
}

export default new SpeedTester()
