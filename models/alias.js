import utils from "./utils.js";

class Alias {
    constructor() {
        this._PATH = `${process.cwd().replace(/\\/g, '/')}/plugins/image-plugin`
    }

    async getName(aName) {
        let name = await this.getGsName(aName)
        if (name === aName) {
            name = await this.getSrName(aName)
        }
        return name
    }

    async getGsName(aName) {
        const names = utils.readYaml(`${this._PATH}/config/gsName.yaml`)
        if (!names) {
            names = utils.readYaml(`${this._PATH}/defSet/gsName.yaml`)
        }
        for (let id in names) {
            if (names[id].includes(aName)) return names[id][0]
        }
        return aName
    }
    async getSrName(aName) {
        const names = utils.readYaml(`${this._PATH}/config/srName.yaml`)
        if (!names) {
            names = utils.readYaml(`${this._PATH}/defSet/srName.yaml`)
        }
        for (let id in names) {
            if (names[id].includes(aName)) return names[id][0]
        }
        return aName
    }
}

export default new Alias()
