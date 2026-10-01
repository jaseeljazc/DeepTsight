import * as migration_20261001_151007_initial from "./20261001_151007_initial";
import * as migration_20261001_152658_admin_security from "./20261001_152658_admin_security";
import * as migration_20261001_154832_collections from "./20261001_154832_collections";

export const migrations = [
  {
    up: migration_20261001_151007_initial.up,
    down: migration_20261001_151007_initial.down,
    name: "20261001_151007_initial",
  },
  {
    up: migration_20261001_152658_admin_security.up,
    down: migration_20261001_152658_admin_security.down,
    name: "20261001_152658_admin_security",
  },
  {
    up: migration_20261001_154832_collections.up,
    down: migration_20261001_154832_collections.down,
    name: "20261001_154832_collections",
  },
];
