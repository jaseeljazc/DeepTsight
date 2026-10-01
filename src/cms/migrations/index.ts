import * as migration_20261001_151007_initial from "./20261001_151007_initial";

export const migrations = [
  {
    up: migration_20261001_151007_initial.up,
    down: migration_20261001_151007_initial.down,
    name: "20261001_151007_initial",
  },
];
