import utils from "../utils/utils.js"
import alias from "../utils/alias.js"
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
                    reg: '^#?(随机)?(.*)(图片|照片|图像)$',
                    fnc: 'randomImage'
                }
            ]
        })
        
        this._PATH = `${process.cwd().replace(/\\/g, '/')}/plugins/image-plugin`
        this.defData = utils.readJson(`${this._PATH}/defSet/data.json`)
        this.DATA_PATH = this._PATH + '/data'
        this.cfg = utils.getCfg('config')
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
        const pics = await imagesInfo.getImages({tag})
        if (!pics) return false

        const pic = this.getRandomValue(pics)

        const preUrl = this.cfg?.useLocalRepos ? `file://${this._PATH}/repos/${pic.name}` : await imagesInfo.getPreUrl(pic, this.cfg)
        const imgUrl = preUrl + `/${pic.game}/${pic.mode}/${pic.fileName}`
        logger.info(imgUrl)

        return await this.e.reply(segment.image(imgUrl))
    }

    getRandomValue(list) {
        return list[Math.floor(Math.random() * list.length)]
    }

}