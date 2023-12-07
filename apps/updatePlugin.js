import { update } from "../../other/update.js"

export class UpdateRadImage extends plugin {
    constructor() {
        super({
            name: '随机图插件更新',
            dsc: 'image-plugin插件更新',
            event: 'message',
            priority: 100,
            rule: [
                {
                    reg: '^#随机图插件(强制)?更新$',
                    permission: 'master',
                    fnc: 'updateImgPlug'
                },
                {
                    reg: '^#随机图插件更新日志$',
                    fnc: 'updateImgPlugLog'
                }
            ]
        })
        this.typeName = 'image-plugin'
    }

    async updateImgPlug() {
        let up = new update()
        up.typeName = this.typeName
        up.e = this.e
        up.e.msg = this.e.msg.replace(/随机图|插件/g, '') + 'image-plugin'
        up.update()
    }

    async updateImgPlugLog() {
        let up = new update()
        up.typeName = this.typeName
        up.e = this.e
        up.e.msg = '#更新日志image-plugin'
        up.updateLog() 
    }

}