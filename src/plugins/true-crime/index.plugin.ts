import * as Language from './lang/index.js'
import type * as Plugin from '@/library/plugins'

// True Crime: New York City Plugin
// by iseeeva
// ----------------------------------------------------------------

export default <Plugin.Structure.Interface>{
  Title: 'true-crime',
  Description: 'True Crime: New York City Plugin',
  Scripts: [
    Language.Exporter,
    Language.Importer,
  ],
}
