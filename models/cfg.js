import fs from "fs"
import Yaml from "yaml"
import lodash from "lodash"
import utils from "./utils.js"

class Cfg {
    constructor() {
        this._PATH = `${process.cwd()}/plugins/image-plugin`
        this.cfgPath = `${this._PATH}/config/config.yaml`
        this.defCfgPath = `${this._PATH}/config/default/default_config.yaml`
        this.defDataPath = `${this._PATH}/defSet/data.json`
        this.init()
    }

    init() {
        this.parse()
        this.check()
        this.config = this.data()
        this.defData = utils.readJson(this.defDataPath)
    }

    update() {
        this.parse()
        this.config = this.data()
        this.defData = utils.readJson(this.defDataPath)
        logger.info(`[image-plugin] 配置已更新`)
    }

    /** 解析yaml */
    parse() {
        if (utils.isExists(this.cfgPath)) {
            this.document = Yaml.parseDocument(fs.readFileSync(this.cfgPath, "utf8"))
        } else {
            fs.copyFileSync(this.defCfgPath, this.cfgPath)
            this.document = Yaml.parseDocument(fs.readFileSync(this.cfgPath, "utf8"))
        }
    }

    /** 获取对象 */
    data() {
        return this.document.toJSON()
    }

    /* 检查指定键是否存在 */
    hasIn(key) {
        return this.document.hasIn([key])
    }

    /** 获取指定键的值 */
    get(key) {
        return lodash.get(this.data(), key)
    }

    /* 修改键值 */
    set(key, value) {
        this.document.setIn([key], value)
        this.save()
    }

    /** 添加新的键值 不能是已有的键 */
    addIn(key, value) {
        this.document.addIn([key], value)
        this.save()
    }

    /* 删除指定的键 */
    del(key) {
        this.document.deleteIn([key])
        this.save()
    }

    /** 给指定的键添加新的键值、值 */
    addVal(key, val) {
        let value = this.get(key)
        if (Array.isArray(value)) {
            value.push(val)
        }
        else if (value && typeof value === "object") {
            value = { ...value, val, }
        } else {
            value = [val]
        }

        this.set(key, value)
    }

    /** 更新Ymal */
    save() {
        try {
            fs.writeFileSync(this.cfgPath, this.document.toString(), 'utf8')
            this.config = this.data()
            // logger.info(`更新Yaml成功：${this.cfgPath}`)
        } catch (err) {
            logger.error(`更新Yaml失败:${err?.message}`)
        }
    }

    /** 检查 */
    check() {
        const defaultDocument = Yaml.parseDocument(fs.readFileSync(this.defCfgPath, "utf8"))
        const document = Yaml.parseDocument(fs.readFileSync(this.cfgPath, "utf8"))
        const data = document.toJSON()
        Object.keys(data).forEach(key => {
            if (defaultDocument.has(key)) {
                defaultDocument.setIn([key], data[key])
            } else {
                defaultDocument.addIn([key], data[key])
            }
        })
        fs.writeFileSync(this.cfgPath, defaultDocument.toString(), 'utf8')
        // this.init()
    }

}

export default new Cfg()