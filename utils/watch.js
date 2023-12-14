import chokidar from 'chokidar'
import fs from 'fs'
import cfg from './cfg.js'

class FileWatcher {
    constructor(directories) {
        this.directories = directories
        this.watchers = {}
    }

    async initWatchers() {
        this.directories.forEach(directory => {
            this.watchers[directory] = chokidar.watch(directory, {
                ignoreInitial: true,
            })

            this.watchers[directory].on('all', async (event, filePath) => {
                // logger.info(`[${event}] ${filePath.spllt('/').pop()}`)

                if (event === 'change') {
                    cfg.update()
                }
            })
        })
    }

    getJsFiles(directory) {
        return fs.readdirSync(directory).filter(file => file.endsWith('.js'))
    }

}

export default new FileWatcher(["./plugins/image-plugin/config"])