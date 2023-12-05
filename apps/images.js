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
                }
            ]
        })
        this.data = utils.getData('data')
    }
    async randomImage() {
        const url = 'https://github.com/feixuei/genshin-images-1/data.json'
        const data = await utils.fetchData(url)
        const keys = Object.keys(data)
        const tag = this.getRandomValue(keys)
        const mode = this.getRandomValue(['safe', 'sese'])
        const imgName = this.getRandomValue(data[tag]['images'][mode])
        const imgUrl = `https://mirror.ghproxy.com/https://raw.githubusercontent.com/feixuei/genshin-images-1/main/gs/${mode}/${imgName}`
        this.reply(segment.image(imgUrl))

    }
    getRandomValue(list) {
        return list[Math.floor(Math.random() * list.length)]
    }

}