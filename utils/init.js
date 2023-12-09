import utils from "./utils.js"
import watch from "./watch.js"

import fs from "fs"

class InitPlugin {
    constructor() {
        this._PATH = `${process.cwd()}/plugins/image-plugin`
    }

    async initCfg() {
        this.initFiles()
        this.initDirs()
        watch.initWatchers()
    }

    initFiles() {
        const files = ['defSet/gsName.yaml', 'config/default/default_config.yaml']

        files.forEach(file => {
            const fileName = file.replace(/.*\/([^\/]+)$/, '$1').replace(/default_/g, '')
            const filePath = `${this._PATH}/config/${fileName}`
            if (!utils.isExists(filePath)) {
                fs.copyFileSync(`${this._PATH}/${file}`, filePath)
            } 
        })

    }

    initDirs() {
        const dirs = ['data', 'repos']
        dirs.forEach(dir => {
            utils.mkdirs(`${this._PATH}/${dir}`)
        })
    }

}

export default new InitPlugin()