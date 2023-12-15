import utils from "./utils.js";

class Alias {
    constructor() {
        this._PATH = process.cwd().replace(/\\/g, '/')
        this.gsNames = utils.readYaml(`${this._PATH}/plugins/image-plugin/defSet/gsName.yaml`)
        // this.srNames = utils.readYaml(`${this._PATH}/plugins/image-plugin/defSet/srName.yaml`)
    }

    async getGsName(aName) {
        const gsName = utils.readYaml(`${this._PATH}/plugins/image-plugin/config/gsName.yaml`)
        if (!gsName) {
            gsName = utils.readYaml(`${this._PATH}/plugins/image-plugin/defSet/gsName.yaml`)
        }
        for (let id in this.gsNames) {
            if (this.gsNames[id].includes(aName)) return this.gsNames[id][0]
        }
        return aName
    }
}

export default new Alias()
