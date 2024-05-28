export const TileId = {
  // placeholder tiles
  PlaceHolderStairs: 1,
  PlaceHolderStairsAndFloor: 2,
  PlaceHolderFloor: 3,

  // actual tiles
  Floor: 4,
  FloorStairsNoUp: 5,
  FloorStairsNoDown: 6,
  FloorInBetween: 7,
  StairsAndFloor: 8,

  Cpu: 11,
  Player: 12,
  Pickup: 13,
  Plate: 14,
  BossCpu: 15,

  Burger1: 21,
  Burger2: 22,
  Burger3: 23,
  Burger4: 24,
  Burger5: 25,
  Burger6: 26,
  Burger7: 27,
  Burger8: 28,
  Burger9: 29,
  Burger10: 30,
  Burger11: 31,
  Burger12: 32,

  isStairs(id: number): boolean {
    return id === TileId.PlaceHolderStairs
  },
  isStairsAndFloor(id: number): boolean {
    return id === TileId.PlaceHolderStairsAndFloor
  },
  isFloor(id: number): boolean {
    return id === TileId.PlaceHolderFloor
  },

  hasFloor(id: number): boolean {
    return TileId.isFloor(id) || TileId.isStairsAndFloor(id)
  },
  hasStairs(id: number): boolean {
    return TileId.isStairs(id) || TileId.isStairsAndFloor(id)
  },
  isBurger(id: number): boolean {
    return id >= TileId.Burger1 && id <= TileId.Burger12
  }
}
