import * as FFFF0218 from './psp/ffff0218.js'
import type * as Plugin from '@/library/plugins'

// Renderware Plugin
// by iseeeva
// ----------------------------------------------------------------

export default <Plugin.Structure.Interface>{
  Title: 'renderware',
  Description: 'Renderware Plugin',
  Scripts: [
    FFFF0218.Exporter,
  ],
}
