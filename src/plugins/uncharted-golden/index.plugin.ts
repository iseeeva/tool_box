import * as BSP from './bsp/index.js'
import * as HG2 from './hg2/index.js'
import type * as Plugin from '@/library/plugins'

// Uncharted: Golden Abyss Plugin
// by iseeeva
// ----------------------------------------------------------------

export default <Plugin.Structure.Interface>{
  Title: 'uncharted-golden',
  Description: 'Uncharted: Golden Abyss Plugin',
  Scripts: [
    // HG2
    HG2.Exporter,
    // BSP
    BSP.Exporter,
    BSP.Builder,
  ],
}
