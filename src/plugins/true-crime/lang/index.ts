import fs from 'fs'
import path from 'path'
import type { IPlugin } from '../../../library/plugin/types/index.js'

// True Crime: New York City Language DAT Scripts
// by iseeeva
// ----------------------------------------------------------------

export const Exporter: IPlugin.Interface.Script = {
  Name: 'lang-exporter',
  Description: 'Exporter for Language DAT File',
  Paramaters: ['file'],
  Function: (Input: string) => {
    if (Input == null)
      throw new Error('File cannot be empty')
    else if (!fs.existsSync(Input))
      throw new Error('File does not exist')

    const Stream = fs.readFileSync(Input)
    const Filename = {
      Output: path.join(path.dirname(Input), `${path.parse(Input).name}.json`),
    }

    function Readable(Input: Buffer) { // Filter non-ascii characters
      return Array.from(Input).map((Byte) => {
        if (Byte < 32 || Byte > 126)
          return `\\x${Byte.toString(16).padStart(2, '0')}`
        else
          return String.fromCharCode(Byte)
      }).join('')
    }

    // //
    const Store = []
    const Header = {
      Size: Stream.readUint32LE(0) + 4, // 4 Byte + * Content Size
    }

    for (let i = 8; i < Header.Size; i += 8) {
      Store[(i / 8) - 1] = Readable(
        Stream.subarray(
          Stream.readUInt32LE(i) + Header.Size,
          Stream.indexOf(0x00, Stream.readUInt32LE(i) + Header.Size),
        ),
      )
    }

    console.log(Store)
    fs.writeFileSync(Filename.Output, JSON.stringify(Store, null, 2))
  },
}

export const Importer: IPlugin.Interface.Script = {
  Name: 'lang-importer',
  Description: 'Re-Importer for Language DAT File',
  Paramaters: ['file'],
  Function: (Input: string) => {
    if (Input == null)
      throw new Error('File cannot be empty')
    else if (!fs.existsSync(Input))
      throw new Error('File does not exist')

    const Filename = {
      Output: path.join(path.dirname(Input), `${path.basename(Input)}.dat`),
      Reference: path.join(path.dirname(Input), `${path.parse(Input).name}.dat`),
    }

    if (!fs.existsSync(Filename.Reference))
      throw new Error(`JSON files requires a reference for re-importing (${path.basename(Filename.Reference)})`)

    const Reference = fs.readFileSync(Filename.Reference)
    const Texts = JSON.parse(fs.readFileSync(Input, 'utf-8'))
    const Stream = {
      Header: Reference.subarray(0, Reference.readUInt32LE(0) + 4),
      Content: Buffer.from('', 'hex'),
    }

    function Readable(Input: string) { // Render non-ascii characters
      const Match = Input.match(/\\x([0-9a-fA-F]{2})|./g)
      if (Match) {
        return Buffer.from(Match.map((Byte) => {
          if (Byte.startsWith('\\x'))
            return parseInt(Byte.slice(2), 16)
          else
            return Byte.charCodeAt(0)
        }))
      }
      else { return Buffer.from(Input, 'utf-8') }
    }

    // //
    let Difference = 0
    for (let i = 8; i < Stream.Header.length; i += 8) {
      const Text = {
        Old: Reference.subarray(
          Stream.Header.readUInt32LE(i) + Stream.Header.length,
          Reference.indexOf(0x00, Stream.Header.readUInt32LE(i) + Stream.Header.length),
        ),
        New: Readable(Texts[(i / 8) - 1]),
      }

      Stream.Header.writeUint32LE(Stream.Header.readUInt32LE(i) + Difference, i)
      Stream.Content = Buffer.concat([Stream.Content, Text.New, Buffer.from('00', 'hex')])

      if (Text.Old.length > Text.New.length)
        Difference -= Text.Old.length - Text.New.length
      else
        Difference += Text.New.length - Text.Old.length
    }

    fs.writeFileSync(Filename.Output, Buffer.concat([Stream.Header, Stream.Content]))
  },
}
