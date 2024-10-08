import * as MBD from './mbd/index.js'
import type * as Plugin from '@/library/plugins'

// Multimedia Builder Plugin
// by iseeeva
// ----------------------------------------------------------------

export default <Plugin.Structure.Interface>{
  Title: 'multimedia-builder',
  Description: 'Multimedia Builder Plugin',
  Scripts: [
    MBD.Exporter,
  ],
}
