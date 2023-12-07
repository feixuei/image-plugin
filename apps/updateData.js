import utils from "../utils/utils.js"
import imagesInfo from "../utils/imagesInfo.js"
import common from "../../../lib/common/common.js"

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
                    fnc: 'getImagesData'
                }
            ]
        })
        
        this._PATH = `${process.cwd().replace(/\\/g, '/')}/plugins/image-plugin`
        this.defData = utils.readJson(`${this._PATH}/defSet/data.json`)
        this.DATA_PATH = this._PATH + '/data'
        this.cfg = utils.getCfg('config')
        this.preProxy = this.cfg.usePreProxy ? this.cfg.preProxy : ''
    }

    async getImagesData() {
        let msgList = []
        let res = await imagesInfo.refreshTable()
        if (!res) return
        for (let game in this.defData) {
            if (this.defData[game].length === 0) continue
            for (let repo of this.defData[game]) {
                logger.info(`开始更新 ${repo.name} 图片数据`)
                let data = await utils.fetchData(`${this.preProxy}${repo.data_url}`)
                if (data) {
                    utils.saveJson(`${this.DATA_PATH}/${repo.name}.json`, data)
                } else {
                    data = utils.getData(repo.name)
                }
                if (!data) {
                    msgList.push(`${repo.name} 数据获取失败！`)
                    continue
                }
                data = { ...repo, ...data }
                await imagesInfo.updateImageInfo(data)
                msgList.push(`${repo.name} 更新成功！`)
            }
        }
        msgList.push(`随机图片数据全部更新成功！`)
        const forwardMsg = await common.makeForwardMsg(this.e, msgList, "更新随机图片数据")
        await this.e.reply(forwardMsg)
    }

}