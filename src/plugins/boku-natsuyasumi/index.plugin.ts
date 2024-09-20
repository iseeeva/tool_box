import * as CDIMG from './cdimg/index.js'
import type * as Plugin from '@/library/plugins'

// Boku no Natsuyasumi Plugin
// by iseeeva
// ----------------------------------------------------------------

export default <Plugin.Structure.Interface>{
  Title: 'boku-natsuyasumi',
  Description: 'Boku no Natsuyasumi Plugin',
  Scripts: [
    CDIMG.Exporter,
  ],
}
