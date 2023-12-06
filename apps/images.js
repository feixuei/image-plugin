import utils from "../utils/utils.js"
import alias from "../utils/alias.js"

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
                }, {
                    reg: '^#随机图片数据更新$',
                    fnc: 'getImagesData'
                }
            ]
        })
        
        this._PATH = process.cwd()
        this.defData = utils.readJson(`${this._PATH}/plugins/image-plugin/defSet/data.json`)
        this.DATA_PATH = this._PATH + '/plugins/image-plugin/data'
        this.proxy = 'https://mirror.ghproxy.com'
        this.preUrl = 'https://raw.githubusercontent.com/feixuei/genshin-images-1/main'
    }
    async randomImage() {
        const data = utils.getData('genshin-images-1')
        let tag = this.e.msg.replace(/#|随机|图片|照片|图像/g, '')
        if (tag !== '') {
            tag = await alias.getGsName(tag)
            if (!tag) return false
            if (!(tag in data.tags)) {
                return await this.e.reply('暂无该角色图片！')
            }
        }else {
            const keys = Object.keys(data.tags)
            tag = this.getRandomValue(keys)
        }
        let mode = this.getRandomValue(['safe', 'sese'])
        if (!(mode in data['tags'][tag]['images'])) {
            mode = this.getRandomValue(['safe', 'sese'].filter(item => item !== mode))
        }
        const imgName = this.getRandomValue(data['tags'][tag]['images'][mode])
        logger.info(imgName)
        const imgUrl = `${this.proxy}/${this.preUrl}/gs/${mode}/${imgName}`
        await this.e.reply(segment.image(imgUrl))
    }

    getRandomValue(list) {
        return list[Math.floor(Math.random() * list.length)]
    }

    async getImagesData() {
        const url = 'https://mirror.ghproxy.com/https://raw.githubusercontent.com/feixuei/genshin-images-1/main/data.json'
        const data = await utils.fetchData(url)
        utils.saveJson(`${this.DATA_PATH}/genshin-images-1.json`, data)
        this.e.reply(`随机图片数据获取成功！`)
    }

}