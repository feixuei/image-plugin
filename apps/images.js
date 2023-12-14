import cfg from "../utils/cfg.js"
import alias from "../utils/alias.js"
import imagesInfo from "../utils/imagesInfo.js"

export class RandomImages extends plugin {
    constructor() {
        super({
            name: '随机图片',
            dsc: '随机图片',
            event: 'message',
            priority: cfg.config.priority || 99,
            rule: [
                {
                    reg: '^#喵喵WIKI$',
                    fnc: 'fuckMiao',
                    log: false,
                }, {
                    reg: '^#?(随机)?(.*)(图片|照片|图像)$',
                    fnc: 'randomImage'
                }
            ]
        })
        
        this._PATH = `${process.cwd().replace(/\\/g, '/')}/plugins/image-plugin`
    }

    async randomImage() {
        // if (!(await this.fuckMiao()))  return false
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

        const preUrl = cfg.config.useLocalRepos ? `file://${this._PATH}/repos/${pic.name}` : await imagesInfo.getPreUrl(pic, cfg.config)
        const imgUrl = preUrl + `/${pic.game}/${pic.mode}/${pic.fileName}`
        logger.info(imgUrl)

        return await this.e.reply(segment.image(imgUrl))
    }

    getRandomValue(list) {
        return list[Math.floor(Math.random() * list.length)]
    }

    async fuckMiao() {
        if (!cfg.config?.coverMiaoImgs) return false
        if (!this.e.original_msg.test(/图片|照片|图像|写真/)) return false
        this.e.msg = this.e.original_msg
        return false
    }

}