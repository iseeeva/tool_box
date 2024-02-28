import type { IPlugin } from '../../library/plugin/types/index.js'
import * as FFFF0218 from './psp/ffff0218.js'

// Renderware Plugin
// by iseeeva
// ----------------------------------------------------------------

export default <IPlugin.Interface.Plugin>{
  Title: 'renderware',
  Description: 'Renderware Plugin',
  Scripts: [
    FFFF0218.Exporter,
  ],
}
