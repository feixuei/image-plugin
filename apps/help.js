import lodash from "lodash"

import cfg from "../models/cfg.js"
import { helpCfg, helpList } from "./help/help_cfg.js"
import Render from "../models/common/render.js"
import Version from "../models/common/version.js"


export class RandomImagesHelp extends plugin {
    constructor() {
        super({
            name: "随机图帮助",
            dsc: "随机图片帮助",
            event: "message",
            priority: cfg.config.priority || 99,
            rule: [
                {
                    reg: "^#?随机图帮助$",
                    fnc: "help",
                }, {
                    reg: "#?随机图版本",
                    fnc: "version",
                }
            ]
        })

        this._PATH = `${process.cwd().replace(/\\/g, "/")}/plugins/image-plugin`
    }

    async version(e) {
        return await Render.render("help/version-info", {
            currentVersion: Version.version,
            changelogs: Version.changelogs,
            name: "Image",
            elem: "cryo"
        }, { e, scale: 1.2 })
    }

    async help(e) {

        let helpGroup = []

        lodash.forEach(helpList, (group) => {
            if (group.auth && group.auth === "master" && !e.isMaster) {
                return true
            }
            lodash.forEach(group.list, (help) => {
                let icon = help.icon * 1
                if (!icon) {
                    help.css = "display:none"
                } else {
                    let x = (icon - 1) % 10
                    let y = (icon - x - 1) / 10
                    help.css = `background-position:-${x * 50}px -${y * 50}px`
                }
            })

            helpGroup.push(group)
        })
        let themeData = await this.getThemeData(helpCfg, helpCfg)
        return await Render.render("help/index", {
            helpCfg: helpCfg,
            helpGroup,
            ...themeData,
            element: "default"
        }, { e, scale: 1.2 })
    }

    async getThemeData(diyStyle, sysStyle) {
        let helpConfig = lodash.extend({}, sysStyle, diyStyle)
        let colCount = Math.min(5, Math.max(parseInt(helpConfig?.colCount) || 3, 2))
        let colWidth = Math.min(500, Math.max(100, parseInt(helpConfig?.colWidth) || 265))
        let width = Math.min(2500, Math.max(800, colCount * colWidth + 30))
        let resPath = `${this._PATH}/resources/help`
        let theme = {
            main: `${resPath}/main.webp`,
            bg: `${resPath}/bg.jpg`,
            // style: style
        }
        let themeStyle = helpCfg.style
        let ret = [`
        body{background-image:url(${theme.bg});width:${width}px;}
        .container{background-image:url(${theme.main});width:${width}px;}
        .help-table .td,.help-table .th{width:${100 / colCount}%}
        `]
        let css = function (sel, css, key, def, fn) {
            let val = getDef(themeStyle[key], diyStyle[key], sysStyle[key], def)
            if (fn) {
                val = fn(val)
            }
            ret.push(`${sel}{${css}:${val}}`)
        }
        css(".help-title,.help-group", "color", "fontColor", "#ceb78b")
        css(".help-title,.help-group", "text-shadow", "fontShadow", "none")
        css(".help-desc", "color", "descColor", "#eee")
        css(".cont-box", "background", "contBgColor", "rgba(43, 52, 61, 0.8)")
        css(".cont-box", "backdrop-filter", "contBgBlur", 3, (n) => diyStyle.bgBlur === false ? "none" : `blur(${n}px)`)
        css(".help-group", "background", "headerBgColor", "rgba(34, 41, 51, .4)")
        css(".help-table .tr:nth-child(odd)", "background", "rowBgColor1", "rgba(34, 41, 51, .2)")
        css(".help-table .tr:nth-child(even)", "background", "rowBgColor2", "rgba(34, 41, 51, .4)")
        return {
            style: `<style>${ret.join("\n")}</style>`,
            colCount
        }
    }

}
function getDef() {
    for (let idx in arguments) {
        if (!lodash.isUndefined(arguments[idx])) {
            return arguments[idx]
        }
    }
}
