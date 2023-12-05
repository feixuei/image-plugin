import utils from "../utils/utils.js"

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
                    reg: '^#img更新数据$',
                    fnc: 'getImagesData'
                }
            ]
        })
        this.data = utils.getData('data')
        this._PATH = process.cwd()
        this.DATA_PATH = this._PATH + '/plugins/images/data'
        this.proxy = 'https://mirror.ghproxy.com'
        this.preUrl = 'https://raw.githubusercontent.com/feixuei/genshin-images-1/main'
    }
    async randomImage() {
        const data = utils.getData('genshin-images-1')
        let tag = this.e.msg.replace(/#|随机|图片|照片|图像/g, '')
        // logger.info(tag)
        if (tag !== '') {
            if (!(tag in data.tags)) {
                return await this.e.reply('标签不存在，暂不支持别名')
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
        this.e.reply(`data数据获取成功！`)
    }

}