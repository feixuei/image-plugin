import fs from "fs"
import init from "./utils/init.js"

let ret = []
let apps = {}
const files = fs.readdirSync("./plugins/image-plugin/apps").filter(file => file.endsWith(".js"))

files.forEach((file) => {
    ret.push(import(`./apps/${file}`))
})
ret = await Promise.allSettled(ret)

for (let i in files) {
    let name = files[i].replace(".js", "")
    if (ret[i].status != "fulfilled") {
        logger.error(`载入插件错误：${logger.red(name)}`)
        logger.error(ret[i].reason)
        continue
    }

    for (let clazz of Object.keys(ret[i].value)) {
      apps[clazz] = ret[i].value[clazz]
    }
}

await init.initCfg()

logger.info('----------^-^----------')
logger.info('image-plugin载入成功!')
logger.info('仓库地址 https://github.com/feixuei/image-plugin')
logger.info('闲聊群: 611735069')
logger.info('-----------------------')

export { apps }
