import type { IPlugin } from '../library/plugin/types/index.js'

export default <IPlugin.Interface.Plugin>{
  Title: 'test-title',
  Description: 'dummy-description',
  Scripts: [{
    Name: 'test-script',
    Description: 'dummy-script-description',
    Paramaters: ['param1', 'param2'],
    Function: Hello,
  }],
}

function Hello(p1: any, p2: any) {
  console.log(`Hello from Test Plugin [p1: ${p1} p2: ${p2}]`)
}
