const child_process = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')
const Config = require('./config')

const genConfig = (index, debugging, tmpPath, n3hPath) => {

  const adminPort = 3000 + index
  const instancePort = 4000 + index

  const config = `
persistence_dir = "${tmpPath}"
expose_trace_signals = true
agents = []
dnas = []
instances = []

[[interfaces]]
admin = true
id = "${Config.adminInterfaceId}"
instances = []
    [interfaces.driver]
    type = "websocket"
    port = ${adminPort}

[[interfaces]]
admin = true
id = "${Config.dnaInterfaceId}"
instances = []
    [interfaces.driver]
    type = "websocket"
    port = ${instancePort}

[logger]
type = "debug"
${debugging ? '' : '[[logger.rules.rules]]'}
${debugging ? '' : 'exclude = true'}
${debugging ? '': 'pattern = "^debug"'}

[network]
n3h_log_level = "${debugging ? 'i' : 'e'}"
bootstrap_nodes = []
n3h_mode = "REAL"
n3h_persistence_path = "${n3hPath}"
    `

  return { config, adminPort, instancePort }
}

const holochainBin = process.env.EMULATION_HOLOCHAIN_BIN_PATH

const spawnConductor = (i, debugging) => {
  const tmpPath = fs.mkdtempSync(path.join(os.tmpdir(), 'n3h-test-conductors-'))
  const n3hPath = path.join(tmpPath, 'n3h-storage')
  fs.mkdirSync(n3hPath)
  const configPath = path.join(tmpPath, `empty-conductor-${i}.toml`)

  const { config, adminPort, instancePort } = genConfig(i, debugging, tmpPath, n3hPath)

  fs.writeFileSync(configPath, config)

  console.info(`Spawning conductor${i} process...`)
  const handle = child_process.spawn(holochainBin, ['-c', configPath])

  handle.stdout.on('data', data => console.log(`[C${i}]`, data.toString('utf8')))
  handle.stderr.on('data', data => console.error(`!C${i}!`, data.toString('utf8')))
  handle.on('close', code => console.log(`conductor ${i} exited with code`, code))

  console.info(`Conductor${i} process spawning successful`)

  return new Promise((resolve) => {
    handle.stdout.on('data', data => {
      // wait for the logs to convey that the interfaces have started
      // because the consumer of this function needs those interfaces
      // to be started so that it can initiate, and form,
      // the websocket connections
      if (data.toString('utf8').indexOf('Starting interfaces...') >= 0) {
        resolve({
          adminPort,
          instancePort,
          handle
        })
      }
    })
  })
}


const spawnConductors = async (numberOfConductors, debugging) => {
  const promises = []

  // start the first conductor and
  // wait for it, because it sets up n3h
  const firstConductor = await spawnConductor(0, debugging)
  promises.push(firstConductor)

  for (let i = 1; i < numberOfConductors; i++) {
    promises.push(spawnConductor(i, debugging))
  }
  return Promise.all(promises)
}
module.exports.spawnConductors = spawnConductors
