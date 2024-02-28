export namespace IPlugin {
  export namespace Interface {
    export interface Plugin {
      Title: string
      Description: string
      Scripts: Script[]
    }

    export interface Script {
      Name: string
      Description: string
      Paramaters: string[]
      Function: (...args: any[]) => any
    }
  }

  export function Check(Plugin: Interface.Plugin): Plugin is Interface.Plugin {
    return (
      typeof Plugin === 'object'
      && (typeof Plugin.Title === 'string' && !Plugin.Title.includes(' '))
      && typeof Plugin.Description === 'string'
      && Array.isArray(Plugin.Scripts)
      && Plugin.Scripts.every(Script => (
        typeof Script === 'object'
        && (typeof Script.Name === 'string' && !Script.Name.includes(' '))
        && typeof Script.Description === 'string'
        && (Array.isArray(Script.Paramaters) && Script.Paramaters.every(Parameter => typeof Parameter === 'string'))
        && typeof Script.Function === 'function'
      ))
    )
  }
}
