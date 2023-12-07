import utils from "./utils.js";

class Alias {
    constructor() {
        this._PATH = process.cwd().replace(/\\/g, '/')
        this.gsNames = utils.readYaml(`${this._PATH}/plugins/image-plugin/defSet/gsName.yaml`)
        // this.srNames = utils.readYaml(`${this._PATH}/plugins/image-plugin/defSet/srName.yaml`)
    }

    async getGsName(aName) {
        for (let id in this.gsNames) {
            if (this.gsNames[id].includes(aName)) return this.gsNames[id][0]
        }
        return false
    }
}

export default new Alias()
