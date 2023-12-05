import fs from "fs"

let ret = []
let apps = {}
const files = fs.readdirSync("./plugins/images/apps").filter(file => file.endsWith(".js"))

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

    // apps[name] = ret[i].value[Object.keys(ret[i].value)[0]]
    for (let clazz of Object.keys(ret[i].value)) {
      apps[clazz] = ret[i].value[clazz]
    }
}

logger.info('----------^-^----------')
logger.info('images载入成功!')
logger.info('仓库地址 https://github.com/feixuei/images')
logger.info('插件群号: 0000000000')
logger.info('Created By feixuei')
logger.info('-----------------------')

export { apps }
