import fs from 'node:fs'
import path from 'node:path'
import { HexReader } from '@twisine/r_lib'
import type * as Plugin from '@/library/plugins'

// Renderware DAT Archive - Version FFFF0218 Scripts
// by iseeeva
// ----------------------------------------------------------------

export const Exporter: Plugin.Script.Interface = {
  Name: 'ffff0218',
  Description: 'Exporter for FFFF0218 Archive',
  Parameters: ['file'],
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
    if (Reader.read(0, 3).toString() === 'Z01') {
      console.log('The file is compressed with ZLIB, please unzip the archive first. (offzip or another tools)')
      process.exit()
    }

    const Magic = Buffer.from('16070000', 'hex')
    let Poss = File.indexOf(Magic) // Container Search

    while (Poss !== -1) {
      Reader.setOffset(0, Poss + 4)

      const Container = {
        Offset: Reader.getOffset(0),
        Size: Reader.read(0, 4, Config.Reader),
        Version: Reader.read(0, 4, { addPos: true }),
        Header: {
          Offset: Reader.getOffset(0),
          Size: Reader.read(0, 4, Config.Reader),
          File: (() => {
            const Clear = (Input: Buffer) => Input.subarray(0, Input.indexOf(0x00))
            const Name = Clear(Reader.read(0, Reader.read(0, 4, Config.Reader), { addPos: true })).toString()
            Reader.setOffset(0, Reader.getOffset(0) + 16)
            const Type = Clear(Reader.read(0, Reader.read(0, 4, Config.Reader), { addPos: true })).toString()
            const Path = Clear(Reader.read(0, Reader.read(0, 4, Config.Reader), { addPos: true })).toString()
            return { Type, Path, Name }
          })(),
        },
      }

      if (!Container.Version.equals(Buffer.from('FFFF0218', 'hex'))) {
        console.log(`Container include unknown renderware version at ${Reader.getOffset(0)}.`)
        Poss = File.indexOf(Magic, Poss + 1)
        continue
      }

      Reader.setOffset(0, Container.Header.Offset + 4)
      Reader.setOffset(0, Reader.getOffset(0) + Container.Header.Size)

      const Output = path.join(path.dirname(Input), Container.Header.File.Path.substring(3, Container.Header.File.Path.length))
      fs.mkdirSync(path.dirname(Output), { recursive: true })
      fs.writeFileSync(
        Output,
        Reader.read(0, Reader.read(0, 4, Config.Reader), { addPos: true }),
      )

      console.log(Container.Header.File.Path, 'exported')
      Poss = File.indexOf(Magic, Poss + 1)
    }
  },
}
