import fs from 'fs'
import path from 'path'
import { HexReader } from '@twisine/r_lib'
import type { IPlugin } from '../../../library/plugin/types/index.js'

// Uncharted: Golden Abyss HG2 Archive - Version Vita Scripts
// by iseeeva

// Implemented from https://github.com/mhvuze/UGAdata
// ----------------------------------------------------------------

export const Exporter: IPlugin.Interface.Script = {
  Name: 'hg2-exporter',
  Description: 'Exporter for HG2 Archive',
  Paramaters: ['file'],
  Function: (Input: string) => {
    if (Input == null)
      throw new Error('File cannot be empty')
    else if (!fs.existsSync(Input))
      throw new Error('File does not exist')

    const Reader = new HexReader(Input)
    const Config = {
      Reader: { isLittle: true, readAs: 'integer', addPos: true } as const,
    }

    // //
    if (Reader.read(0, 4, Config.Reader) !== 0x00324748) { // HG2
      console.log('The file is not a valid HG2 Archive')
      process.exit()
    }

    const Pointer = (() => {
      Reader.setOffset(0, Reader.getOffset(0) + 0x1C)
      const Count = Reader.read(0, 4, Config.Reader)

      Reader.setOffset(0, Reader.getOffset(0) + 0x08)
      const Offset = Reader.read(0, 4, Config.Reader)

      return { Count, Offset }
    })()

    for (let i = 0; i < Pointer.Count; i++) {
      const File = {
        ID: Reader.read(0, 4, Config.Reader),
        Size: Reader.read(0, 4, Config.Reader),
        Offset: Reader.read(0, 4, Config.Reader),
        Name: (() => {
          Reader.setOffset(0, Pointer.Offset + (i * 4))
          const Offset = Reader.read(0, 4, Config.Reader)

          Reader.setOffset(0, Offset)
          let String = ''

          while (Reader.read(0, 1, { readAs: 'integer' }) !== 0x00)
            String += Reader.read(0, 1, { addPos: true }).toString()

          return { Offset, String }
        })(),
      }

      Reader.setOffset(0, File.Offset)

      const Output = path.join(path.dirname(Input), File.Name.String)
      fs.mkdirSync(path.dirname(Output), { recursive: true })
      fs.writeFileSync(
        Output,
        Reader.read(0, File.Size, { addPos: true }),
      )

      console.log(File.Name.String, 'exported')
      Reader.setOffset(0, 0x30 + ((i + 1) * 0x0C))
    }
  },
}
