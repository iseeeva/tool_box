import fs from 'node:fs'
import path from 'node:path'
import { HexReader as Reader } from '@twisine/r_lib'
import type * as Plugin from '@/library/plugins'

// Boku no Natsuyasumi CDIMG Archive Scripts
// by iseeeva
// ----------------------------------------------------------------

export const Exporter: Plugin.Script.Interface = {
  Name: 'cdimg-exporter',
  Description: 'Exporter for CDIMG Archive',
  Parameters: ['idx'],
  Function: (Input: string) => {
    if (Input == null)
      throw new Error('File cannot be empty')
    else if (!fs.existsSync(Input))
      throw new Error('File does not exist')

    // ///////////////////////////////////////////////// //

    const IDX_MAGIC = Buffer.from('44464900', 'hex')
    const IDX_SECTOR = 0x800

    const Config = { isLittle: true, addPos: true }

    enum Events {
      File,
      Directory,
    }

    enum Position {
      Reading,
      Temporary,
    }

    // ///////////////////////////////////////////////// //

    function Event(Idx: Reader) {
      const Starting = Idx.getOffset(Position.Reading)

      const Id = Idx.read(Position.Reading, 2, { ...Config, readAs: 'integer' }) as Events
      const Entries = Idx.read(Position.Reading, 2, { ...Config, readAs: 'integer' })
      const Name = Idx.read(Position.Reading, 4, { ...Config, readAs: 'integer' }) + Starting
      const Offset = Idx.read(Position.Reading, 4, { ...Config, readAs: 'integer' }) * IDX_SECTOR
      const Length = Idx.read(Position.Reading, 4, { ...Config, readAs: 'integer' })

      Idx.setOffset(Position.Temporary, Name)
      let Value = ''

      while (Idx.read(Position.Temporary, 1, { readAs: 'integer' }) !== 0) {
        Value += Idx.read(Position.Temporary, 1, { addPos: true })
      }

      return { Offset, Id, Name, Value, Entries, Length }
    }

    // ///////////////////////////////////////////////// //

    const Base = path.join(path.dirname(Input), path.parse(Input).name)
    const Filename = {
      Img: `${Base}.img`,
      Idx: `${Base}.idx`,
    }

    for (const [key, file] of Object.entries(Filename)) {
      if (!fs.existsSync(file))
        throw new Error(`${key.toUpperCase()} file not found: ${path.basename(file)}`)
    }

    const Img = new Reader(Filename.Img)
    const Idx = new Reader(Filename.Idx)
    const End = fs.statSync(Filename.Img).size

    const Header = (() => {
      const Id: Buffer = Idx.read(Position.Reading, 4, { addPos: true })
      const Mod: number = Idx.read(Position.Reading, 4, { ...Config, readAs: 'integer' })
      Idx.setOffset(Position.Reading, Idx.getOffset(Position.Reading) + 8)

      return { Id, Mod }
    })()

    if (!Header.Id.equals(IDX_MAGIC)) {
      throw new Error('Invalid IDX file: Incorrect magic')
    }

    let Current: string = Base
    let Escape: boolean = false
    fs.mkdirSync(Current, { recursive: true })
    Idx.setOffset(Position.Reading, 32)

    while (true) {
      const { Id, Entries, Length, Name, Offset, Value } = Event(Idx)

      if (Offset > End) {
        break
      }

      switch (Id) {
        case Events.Directory:
          {
            Current = Value.startsWith('/') ? path.join(Base, Value) : path.join(Current, Value)
            fs.mkdirSync(Current, { recursive: true })

            if (Entries === 0) {
              Escape = true
            }

            console.log(`Created directory: ${path.relative(Base, Current)}`)
          } break

        case Events.File:
          {
            Img.setOffset(Position.Reading, Offset)

            const Content = Img.read(Position.Reading, Length, { addPos: true })
            const Path = path.join(Current, Value)
            fs.writeFileSync(Path, Content)

            console.log(`Extracted file: ${path.relative(Base, Path)}`)

            if (Entries === 0) {
              console.log(`End of ${path.relative(Base, Current)}`)
              Current = path.dirname(Current)

              if (Escape) {
                Escape = false
                Current = path.dirname(Current)
              }
            }
          } break

        default:
          console.warn(`Unknown Event ID: ${Id}`)
      }
    }

    console.log(`Export completed: ${path.basename(Base)}`)
  },
}
