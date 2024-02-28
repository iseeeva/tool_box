import type { IPlugin } from '../../library/plugin/types/index.js'
import * as BSP from './bsp/index.js'
import * as HG2 from './hg2/index.js'

// Uncharted: Golden Abyss Plugin
// by iseeeva
// ----------------------------------------------------------------

export default <IPlugin.Interface.Plugin>{
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
