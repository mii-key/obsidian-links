import { Loc, Pos, TFile, Vault } from "obsidian";

export function createPos(start: Loc, end: Loc): Pos {
  return { start, end }
}
export function createLoc(line = 0, col = 0, offset = 0): Loc {
  return { line, col, offset };
}

export function createTFile(path: string): TFile {
  return {
    stat: {
      ctime: 0, mtime: 0, size: 0
    },
    vault: {} as Vault,
    //TODO:
    basename: path,
    extension: '',
    path,
    name: path,
    parent: null
  };
}