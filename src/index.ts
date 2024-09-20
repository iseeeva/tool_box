import path from 'node:path'
import * as Plugins from '@/library/plugins'

const Input = {
  Title: process.argv[2],
  Script: process.argv[3],
  Parameters: process.argv.slice(4, process.argv.length),
}

Promise.resolve(Plugins.Initialize(path.join(__dirname, './plugins'), { recurvise: true })).then((Plugins) => {
  if (Input.Title == null) {
    console.log('Iseeeva\'s Tool Box')
    console.log('Usage: <title> <script> <parameter> <parameter>..')
    process.exit()
  }

  const Plugin = Plugins.find(Plugin => Plugin.Title === Input.Title)

  if (Plugin) {
    if (Input.Script)
      Plugin.Execute(Input.Script, Input.Parameters)
    else
      Plugin.Help()
  }
  else {
    throw new Error(`Selected plugin (${Input.Title}) not found`)
  }
})
