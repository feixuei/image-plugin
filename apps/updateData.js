import utils from "../utils/utils.js"
import imagesInfo from "../utils/imagesInfo.js"
import common from "../../../lib/common/common.js"
import lodash from "lodash"
import fs from "node:fs"
import { exec } from 'child_process'

export class UpdateImagesData extends plugin {
    constructor() {
        super({
            name: '更新随机图片数据',
            dsc: '随机图片',
            event: 'message',
            priority: 100,
            rule: [
                {
                    reg: '^#随机图片数据更新$',
                    fnc: 'updateImagesData'
                }, {
                    reg: '^#随机图片(强制)?更新',
                    fnc: 'pullImagesData'
                }
            ]
        })

        this._PATH = `${process.cwd().replace(/\\/g, '/')}/plugins/image-plugin`
        this.defData = utils.readJson(`${this._PATH}/defSet/data.json`)
        this.DATA_PATH = this._PATH + '/data'
        this.cfg = utils.getCfg('config')
    }

    async updateImagesData() {
        let msgList = []
        for (let game in this.defData) {
            if (this.defData[game].length === 0) continue
            for (let repo of this.defData[game]) {
                logger.info(`开始更新 ${repo.name} 图片数据`)
                const dataUrl = await imagesInfo.getPreUrl(repo, this.cfg)
                let data = await utils.fetchData(`${dataUrl}/${repo?.data_path}`)
                if (data) {
                    utils.saveJson(`${this.DATA_PATH}/${repo.name}.json`, data)
                } else {
                    data = utils.getData(repo.name)
                }
                if (!data) {
                    msgList.push(`${repo.name} 数据获取失败！`)
                    continue
                }
                let res = await imagesInfo.refreshTable(repo.name)
                if (!res) return
                data = { ...repo, ...data }
                res = await imagesInfo.updateImageInfo(data, repo.name)
                if (res){
                    logger.info(`${repo.name} 更新成功！`)
                    msgList.push(`${repo.name} 更新成功！`)
                } else {
                    logger.error(`${repo.name} 更新失败！`)
                    msgList.push(`${repo.name} 更新失败！`)
                }
            }
        }
        msgList.push(`随机图片数据全部更新完成！`)
        const forwardMsg = await common.makeForwardMsg(this.e, msgList, "更新随机图片数据")
        await this.e.reply(forwardMsg)
    }

    async pullImagesData() {
        await this.e.reply(`开始更新随机图，请稍等~`)
        let msgList = []
        this.e._reply = this.e.reply
        this.e.reply = (msg) => { msgList.push(msg) }

        if (!this.cfg.useLocalRepos) return
        for (let game in this.defData) {
            if (this.defData[game].length === 0) continue
            for (let repo of this.defData[game]) {
                await this.updateRepos(this.e, repo)
            }
        }
        const forwardMsg = await common.makeForwardMsg(this.e, msgList, "更新随机图数据")
        await this.e._reply(forwardMsg)
    }

    async updateRepos(e, repo = {}) {
        if (!e.isMaster) { return false }
        if (lodash.isEmpty(repo)) return false

        const repoPath = `${this._PATH}/repos/${repo?.name}`

        if (fs.existsSync(repoPath)) {
            const isRepo = fs.existsSync(`${repoPath}/.git`)
            if (!isRepo) return false
            await e.reply(`开始更新随机图仓库\n${repo?.name}`)

            let command = `cd ${repoPath} &&` + await this.getUpdateType()

            let res = await this.execSync(command)

            if (res.error) {
                logger.error(`随机图仓库 ${repo.name} 更新失败！`)
                await e.reply('图片资源更新失败！\nError code: ' + res?.error?.code + '\n' + res?.error?.stack + '\n 请稍后重试。')
            } else if (/Already up to date/.test(res?.stdout) || res?.stdout.includes('最新')) {
                await e.reply('目前所有图片都已经是最新了~')
            }

            let numRet = /(\d*) files changed,/.exec(res.stdout)
            if (numRet && numRet[1]) {
                await e.reply(`报告主人，更新成功，此次更新了${repo.name}仓库的${numRet[1]}个图片~`)
            }

        } else {
            await e.reply(`开始安装随机图仓库\n${repo?.name}`)
            let command = `git clone --depth=1 ${this.preProxy + repo.repo} ${this._PATH}/repos/${repo.name}`

            let res = await this.execSync(command)

            if (res.error) {
                logger.error(`随机图仓库 ${repo.name} 安装失败！`)
                await e.reply('图片资源安装失败！\nError code: ' + res?.error?.code + '\n' + res?.error?.stack + '\n 请稍后重试。')
            } else {
                await e.reply(`随机图仓库${repo.name}安装成功！`)
            }
            
        }
        return true
    }

    async execSync(cmd) {
        return new Promise((resolve, reject) => {
            exec(cmd, { windowsHide: true }, (error, stdout, stderr) => {
                resolve({ error, stdout, stderr })
            })
        })
    }

    async getUpdateType() {
        let command = 'git pull'
        if (this.e.msg.includes('强行强制')) {
            command = 'git checkout . && git pull'
        }
        return command
    }

}