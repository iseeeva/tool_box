import type * as Plugin from '../library/plugins'

export default <Plugin.Structure.Interface>{
  Title: 'test-title',
  Description: 'dummy-description',
  Scripts: [{
    Name: 'test-script',
    Description: 'dummy-script-description',
    Parameters: ['param1', 'param2'],
    Function: Hello,
  }],
}

function Hello(p1: any, p2: any) {
  console.log(`Hello from Test Plugin [p1: ${p1} p2: ${p2}]`)
}
