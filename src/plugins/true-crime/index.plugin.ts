import type { IPlugin } from '../../library/plugin/types/index.js'
import * as Language from './lang/index.js'

// True Crime: New York City Plugin
// by iseeeva
// ----------------------------------------------------------------

export default <IPlugin.Interface.Plugin>{
  Title: 'true-crime',
  Description: 'True Crime: New York City Plugin',
  Scripts: [
    Language.Exporter,
    Language.Importer,
  ],
}
