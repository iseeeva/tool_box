import fs from 'fs'
import path from 'path'
import { IPlugin } from './types/index.js'

const Plugins: IPlugin.Interface.Plugin[] = []

/** Initialize Before Using! */
export default class Plugin {
  private Plugin: IPlugin.Interface.Plugin

  constructor(Title: string) {
    const Plugin = Plugins.find(Plugin => Plugin.Title === Title)
    if (Plugin != null)
      this.Plugin = Plugin
    else
      throw new Error('Plugin is not found')
  }

  static async Initialize() {
    const Settings = {
      Plugin: { Folder: path.join(globalThis.__basedir, './plugins') },
    }

    const Files = fs
      .readdirSync(Settings.Plugin.Folder, {
        encoding: 'utf8',
        recursive: true,
      })
      .filter((File: string) => (/\.plugin\.(ts|js)$/).test(File))
      .map((File: string) => path.relative(__dirname, path.join(Settings.Plugin.Folder, File)).replace(/\\/g, '/'))

    for (const File of Files) {
      await import(File).then((_) => {
        const Imported: IPlugin.Interface.Plugin = _.default
        const Check = {
          Interface: IPlugin.Check(Imported),
          Duplicated: {
            Plugin: Plugins.find(Plugin => Plugin.Title === Imported.Title),
            Script: Imported.Scripts.map(Script => Script.Name).find((e, i, a) => a.indexOf(e) !== i),
          },
        }

        if (!Check.Interface)
          throw new Error(`Imported plugin is not equal with IPlugin.Interface (${File})`)

        if (Check.Duplicated.Plugin != null)
          throw new Error(`Same title loaded already "${Imported.Title}" (${File})`)

        if (Check.Duplicated.Script != null)
          throw new Error(`Same script loaded already "${Check.Duplicated.Script}" (${File})`)

        Plugins.push(Imported)
        console.log(`${Imported.Title} loaded`)
      })
    }

    console.log('Plugins loaded successfully\n')
  }

  Execute(Name: string, Parameters: string[]) {
    const Script = this.Plugin.Scripts.find(Script => Script.Name === Name)
    if (Script != null)
      return Script.Function(...Parameters)
    else
      throw new Error('Script is not found')
  }

  Help() {
    console.log(`======== ${this.Plugin.Title} ========`)
    console.log(this.Plugin.Description)
    console.log('========')

    this.Plugin.Scripts.forEach((Script) => {
      const Parameters = Script.Paramaters.map(param => `<${param}>`).join(' ')
      console.log(`${Script.Name} ${Parameters} : ${Script.Description}`)
    })

    console.log('=================================================')
  }
}
