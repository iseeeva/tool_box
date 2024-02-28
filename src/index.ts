import Plugin from './library/plugin/index.js'

globalThis.__basedir = __dirname

const Input = {
  Title: process.argv[2],
  Script: process.argv[3],
  Parameters: process.argv.slice(4, process.argv.length),
}

Promise.resolve(Plugin.Initialize()).then(() => {
  if (Input.Title == null) {
    console.log('Iseeeva\'s Tool Box v1.0')
    console.log('Usage: <Title> <Script> <Parameter> <Parameter>..')
    process.exit()
  }

  const Selected = new Plugin(Input.Title)

  if (Input.Script == null) {
    Selected.Help()
    process.exit()
  }

  Selected.Execute(Input.Script, Input.Parameters)
})
