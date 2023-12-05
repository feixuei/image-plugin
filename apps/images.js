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
                    reg: '^#?随机图片$',
                    fnc: 'randomImage'
                }, {
                    reg: '#?随机(.*)图片^',
                    fnc: 'randomRoleImage'
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
        const keys = Object.keys(data.tags)
        const tag = this.getRandomValue(keys)
        const mode = this.getRandomValue(['safe', 'sese'])
        const imgName = this.getRandomValue(data['tags'][tag]['images'][mode])
        logger.info(imgName)
        const imgUrl = `${this.proxy}/${this.preUrl}/gs/${mode}/${imgName}`
        this.reply(segment.image(imgUrl))
    }

    async randomRoleImage() {
        const tag = this.e.msg.replace(/#|随机|图片/g, '')
        const mode = this.getRandomValue(['safe', 'sese'])
        const imgName = this.getRandomValue(data['tags'][tag]['images'][mode])
        logger.info(imgName)
        const imgUrl = `${this.proxy}/${this.preUrl}/gs/${mode}/${imgName}`
        this.reply(segment.image(imgUrl))
    }

    getRandomValue(list) {
        return list[Math.floor(Math.random() * list.length)]
    }

    async getImagesData() {
        const url = 'https://mirror.ghproxy.com/https://raw.githubusercontent.com/feixuei/genshin-images-1/main/data.json'
        const data = await utils.fetchData(url)
        utils.saveJson(`${this.DATA_PATH}/genshin-images-1.json`, data)
        this.reply(`data数据获取成功！`)
    }

}