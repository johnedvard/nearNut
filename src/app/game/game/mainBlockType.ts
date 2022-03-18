// manage block names instead of index in tilemap
export enum MainBlockType {
  nw = 4,
  n = 5,
  ne = 6,
  e = 18,
  se = 30,
  s = 29,
  sw = 28,
  w = 16,
}

export const getTileFromBlock = (block: MainBlockType) => {
  switch (block) {
    case MainBlockType.nw:
      return 4;
    case MainBlockType.n:
      return 5;
    case MainBlockType.ne:
      return 6;
    case MainBlockType.e:
      return 18;
    case MainBlockType.se:
      return 30;
    case MainBlockType.s:
      return 29;
    case MainBlockType.sw:
      return 28;
    case MainBlockType.w:
      return 16;
    default:
      return -1;
  }
};

// Used to check valid neighbours of tile
export const edgeLabels = {
  [MainBlockType.nw]: { e: [MainBlockType.n], s: [MainBlockType.w] },
  [MainBlockType.n]: {
    w: [MainBlockType.nw, MainBlockType.n],
    e: [MainBlockType.ne, MainBlockType.n],
  },
  [MainBlockType.ne]: { w: [MainBlockType.n], s: [MainBlockType.e] },
  [MainBlockType.e]: {
    n: [MainBlockType.ne, MainBlockType.e],
    s: [MainBlockType.se, MainBlockType.e],
  },
  [MainBlockType.se]: { w: [MainBlockType.s], n: [MainBlockType.e] },
  [MainBlockType.s]: {
    w: [MainBlockType.sw, MainBlockType.s],
    e: [MainBlockType.se, MainBlockType.s],
  },
  [MainBlockType.sw]: { n: [MainBlockType.w], e: [MainBlockType.s] },
  [MainBlockType.w]: {
    n: [MainBlockType.nw, MainBlockType.w],
    s: [MainBlockType.sw, MainBlockType.w],
  },
};
