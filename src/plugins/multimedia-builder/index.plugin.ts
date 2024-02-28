import type { IPlugin } from '../../library/plugin/types/index.js'
import * as MBD from './mbd/index.js'

// Multimedia Builder Plugin
// by iseeeva
// ----------------------------------------------------------------

export default <IPlugin.Interface.Plugin>{
  Title: 'multimedia-builder',
  Description: 'Multimedia Builder Plugin',
  Scripts: [
    MBD.Exporter,
  ],
}
