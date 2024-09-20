import fs from 'node:fs'
import path from 'node:path'

// #region Types
export namespace Script {
  export interface Interface {
    Name: string
    Description: string
    Parameters: string[]
    Function: (...args: any[]) => any
  }

  export function Check(Script: Script.Interface): Script is Script.Interface {
    return (
      typeof Script === 'object'
      && (typeof Script.Name === 'string' && !Script.Name.includes(' '))
      && typeof Script.Description === 'string'
      && (Array.isArray(Script.Parameters) && Script.Parameters.every(Parameter => typeof Parameter === 'string'))
      && typeof Script.Function === 'function'
    )
  }
}

export namespace Structure {
  export interface Interface {
    Title: string
    Description: string
    Scripts: Script.Interface[]
  }

  export function Check(Plugin: Structure.Interface): Plugin is Structure.Interface {
    return (
      typeof Plugin === 'object'
      && (typeof Plugin.Title === 'string' && !Plugin.Title.includes(' '))
      && typeof Plugin.Description === 'string'
      && Array.isArray(Plugin.Scripts)
      && Plugin.Scripts.every(Current => Script.Check(Current))
    )
  }
}

class Plugin implements Structure.Interface {
  Title: string
  Description: string
  Scripts: Script.Interface[]

  constructor(Title: string, Description: string, Scripts: Script.Interface[]) {
    this.Title = Title
    this.Description = Description
    this.Scripts = Scripts
  }

  Execute(Name: string, Parameters: string[]) {
    const Script = this.Scripts.find(Script => Script.Name === Name)

    if (!Script)
      throw new Error(`Script (${Name}) not found in plugin (${this.Title})`)

    return Script.Function(...Parameters)
  }

  Help() {
    console.log(`======== ${this.Title} ========`)
    console.log(this.Description)
    console.log('========')

    this.Scripts.forEach(({ Name, Parameters, Description }) => {
      const Params = Parameters.map(Param => `<${Param}>`).join(' ')
      console.log(`${Name} ${Params} : ${Description}`)
    })

    console.log('=================================================')
  }
}
// #endregion

export async function Initialize(Directory: string, Options: { recurvise?: boolean }) {
  const Workspace = path.resolve(Directory)
  const Plugins: Plugin[] = []

  const Files = fs
    .readdirSync(Workspace, {
      encoding: 'utf8',
      recursive: Options.recurvise,
    })
    .filter((File: string) => (/\.plugin\.(ts|js)$/).test(File))
    .map((File: string) => path.relative(__dirname, path.join(Workspace, File)).replace(/\\/g, '/'))

  console.log(`==== [${Files.length} plugin found] ====`)

  for (const File of Files) {
    const Imported: Structure.Interface = (await import(File)).default

    const Check = {
      Structure: Structure.Check(Imported),
      Duplicated: {
        Plugin: !Plugins.find(Plugin => Plugin.Title === Imported.Title),
        Script: Imported.Scripts.map(Script => Script.Name).every((v, i, a) => a.indexOf(v) === i),
      },
    }

    if (!Check.Structure)
      throw new Error(`Imported plugin does not match the interface (${File})`)

    if (!Check.Duplicated.Plugin)
      throw new Error(`Duplicated plugin title (${Imported.Title}) found in "${File}"`)

    if (!Check.Duplicated.Script)
      throw new Error(`Duplicated scripts found in plugin (${Imported.Title}) "${File}"`)

    Plugins.push(new Plugin(Imported.Title, Imported.Description, Imported.Scripts))
    console.log(`[${Files.indexOf(File) + 1}] ${Imported.Title} loaded (${Imported.Scripts.length} script)`)
  }

  console.log('==== [Plugins loaded successfully] ====\n')
  return Plugins
}
