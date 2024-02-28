import fs from 'fs'
import path from 'path'
import { HexReader } from '@twisine/r_lib'
import type { IPlugin } from '../../../library/plugin/types/index.js'

// Multimedia Builder MBD Archive - Version 2.7 Scripts
// by iseeeva
// ----------------------------------------------------------------

export const Exporter: IPlugin.Interface.Script = {
  Name: 'mbd-exporter',
  Description: 'Exporter for MBD Files',
  Paramaters: ['file'],
  Function: (Input: string) => {
    if (Input == null)
      throw new Error('File cannot be empty')
    else if (!fs.existsSync(Input))
      throw new Error('File does not exist')

    const File = fs.readFileSync(Input)
    const Reader = new HexReader(Input)

    const Config = {
      Reader: { isLittle: true, readAs: 'integer', addPos: true } as const,
    }

    // //
    let i = 0

    const Posses = [Buffer.from('00000000c0270900', 'hex'), Buffer.from('01000000c0270900', 'hex')]
    const Indexs = [File.indexOf(Posses[0]), File.indexOf(Posses[1])]

    while (i < Indexs.length) {
      if (Indexs[i] === -1) { i++; continue }

      Reader.setOffset(0, Indexs[i] + 8)

      console.log(
        `[File]: ${Indexs[i]}.jpg`,
        '[Height]:', Reader.read(0, 4, { ...Config.Reader }),
        '[Width]:', Reader.read(0, 4, { ...Config.Reader }),
      )

      if (Reader.read(0, 4, { ...Config.Reader, addPos: false }) < 5)
        Reader.setOffset(0, Reader.getOffset(0) + 4)

      if (Reader.read(0, 4, { ...Config.Reader, addPos: false }) === 4000000000)
        Reader.setOffset(0, Reader.getOffset(0) + 4)

      const Length = Reader.read(0, 4, { ...Config.Reader })
      fs.writeFileSync(path.join(path.dirname(Input), `${Indexs[i]}.jpg`), Reader.read(0, Length))

      Indexs[i] = File.indexOf(Posses[i], Indexs[i] + 1)
    }
  },
}
