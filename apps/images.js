import utils from "../utils/utils.js"
import alias from "../utils/alias.js"
import common from "../../../lib/common/common.js"
import imagesInfo from "../utils/imagesInfo.js"

export class RandomImages extends plugin {
    constructor() {
        super({
            name: '随机图片',
            dsc: '随机图片',
            event: 'message',
            priority: 100,
            rule: [
                {
                    reg: '^#?随机(.*)(图片|照片|图像)$',
                    fnc: 'randomImage'
                }
            ]
        })
        
        this._PATH = `${process.cwd().replace(/\\/g, '/')}/plugins/image-plugin`
        this.defData = utils.readJson(`${this._PATH}/defSet/data.json`)
        this.DATA_PATH = this._PATH + '/data'
        this.cfg = utils.getCfg('config')
        this.preProxy = this.cfg.usePreProxy ? this.cfg.preProxy : ''
        this.preUrl = this.cfg.useLocalRepos ? '' : 
        this.preUrl = 'https://raw.githubusercontent.com/feixuei/genshin-images-1/main'
    }
    async randomImage() {
        const tags = await imagesInfo.getTags()

        let tag = this.e.msg.replace(/#|随机|图片|照片|图像/g, '')

        if (tag !== '') {
            tag = await alias.getGsName(tag)
            if (!tags.includes(tag)) {
                return await this.e.reply('暂无该角色图片！')
            }
        }else {
            tag = this.getRandomValue(tags)
        }

        const pic = this.getRandomValue(await imagesInfo.getImages(tag))

        const preUrl = this.cfg.useLocalRepos ? `file://${this._PATH}/repos/${pic.name}` : pic.preUrl
        const imgUrl = preUrl + `/${pic.game}/${pic.mode}/${pic.fileName}`
        logger.info(imgUrl)

        return await this.e.reply(segment.image(imgUrl))
    }

    getRandomValue(list) {
        return list[Math.floor(Math.random() * list.length)]
    }

    async getImagesData() {
        let msgList = []
        for (let game in this.defData) {
            if (this.defData[game].length === 0) continue
            for (let repo of this.defData[game]) {
                logger.info(this.preProxy)
                logger.info(repo.data_url)
                let data = await utils.fetchData(`${this.preProxy}${repo.data_url}`)
                utils.saveJson(`${this.DATA_PATH}/${repo.name}.json`, data)
                msgList.push(`${repo.name} 更新成功！`)
            }
        }
        msgList.push(`随机图片数据全部更新成功！`)
        const forwardMsg = await common.makeForwardMsg(this.e, msgList, "更新随机图片数据")
        await this.e.reply(forwardMsg)
    }

}