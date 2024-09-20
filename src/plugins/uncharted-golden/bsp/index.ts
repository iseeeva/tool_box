import fs from 'node:fs'
import path from 'node:path'
import { Convert, HexReader } from '@twisine/r_lib'
import type * as Plugin from '@/library/plugins'

// Uncharted: Golden Abyss BSP File - Version Vita Scripts
// by iseeeva
// ----------------------------------------------------------------

export const Exporter: Plugin.Script.Interface = {
  Name: 'bsp-exporter',
  Description: 'Exporter for BSP File',
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

    const Database: any[] = []
    const Output = path.join(path.dirname(Input), `${path.parse(Input).name}.txt`)

    /** Calculate Size Buffer */
    function Calculate() {
      if (Reader.read(0, 1, { ...Config.Reader, addPos: false }) > 128) {
        const Temp = (128 * ((Reader.read(0, 1, Config.Reader) - 128) * 2))
        return Reader.read(0, 1, Config.Reader) + Temp
      }
      else if (Reader.read(0, 1, { ...Config.Reader, addPos: false }) === 128) {
        Reader.setOffset(0, Reader.getOffset(0) + 1)
        return Reader.read(0, 1, Config.Reader)
      }
      else {
        return Reader.read(0, 1, Config.Reader)
      }
    }

    // //
    Reader.setOffset(0, 16)
    while (Reader.getOffset(0) < File.length) {
      const Container: { Size: number, Datas: { Size: number, Value: number | string }[] } = {
        Size: 0,
        Datas: [],
      }

      if (Reader.read(0, 1, Config.Reader) !== 0x4B) {
        console.log(`Offset ${Reader.getOffset(0)} does not have valid BSP Container`)
        process.exit()
      }

      Container.Size = Calculate()

      const Values: any[] = []
      for (let i = 0; i < 5; i++) {
        Reader.setOffset(0, Reader.getOffset(0) + 1)
        const Data: { Size: number, Value: number | string } = { Size: 0, Value: '' }

        Data.Size = Calculate()

        if (i === 0)
          Data.Value = Reader.read(0, Data.Size, { ...Config.Reader, isLittle: false })
        else
          Data.Value = Reader.read(0, Data.Size, { addPos: true }).toString().slice(0, -1)

        Container.Datas.push(Data)
        Values.push(Data.Value)
      }
      Database.push(Values)
    }

    fs.writeFileSync(Output, JSON.stringify(Database, null, 2))
  },
}

export const Builder: Plugin.Script.Interface = {
  Name: 'bsp-builder',
  Description: 'Builder for BSP File',
  Parameters: ['file'],
  Function: (Input: string) => {
    if (Input == null)
      throw new Error('File cannot be empty')
    else if (!fs.existsSync(Input))
      throw new Error('File does not exist')

    const File = JSON.parse(fs.readFileSync(Input, 'utf-8'))
    const Output = (() => {
      const Name = path.join(path.dirname(Input), `${path.parse(Input).name}.bsp`)

      fs.writeFileSync(Name, '')
      const Stream = fs.createWriteStream(Name, { flags: 'a' })

      return { Name, Stream }
    })()

    const Calculate = {
      Byte(Input: Buffer | string) {
        return Buffer.byteLength(Input, 'utf8')
      },
      Size(Length: number) {
        let Max = 0

        if (Length >= 128)
          Max = 128

        while (Length >= 256) {
          Max += 1
          Length -= 256
        }

        if (Max >= 128)
          return Buffer.concat([Convert.toBuffer(Max, 'int8'), Convert.toBuffer(Length, 'int8')])
        else
          return Convert.toBuffer(Length, 'int8')
      },
    }

    // //
    Output.Stream.write(Buffer.from('EAF64788B6FDF49D1C5579F1EB700F98', 'hex'))

    File.forEach((Values: [number, string, string, string, string]) => {
      const Data: any[] = []
      let Size = 0

      Values.forEach((Value, Index) => {
        Data.push(Convert.toBuffer(Index + 1, 'int8'))
        if (typeof Value === 'number') {
          Data.push(Calculate.Size(2))
          Data.push(Convert.toBuffer(Value, 'int16'))
        }
        else {
          if (Value.length > 0)
            Value += '\x00'
          Data.push(Calculate.Size(Calculate.Byte(Value)))
          Data.push(Value)
        }
      })

      Output.Stream.write(Buffer.from('4B', 'hex'))

      Data.forEach(Item => Size += Calculate.Byte(Item))
      Output.Stream.write(Calculate.Size(Size))

      Data.forEach(Item => Output.Stream.write(Item))
    })
  },
}
