import * as migration_20261001_151007_initial from "./20261001_151007_initial";
import * as migration_20261001_152658_admin_security from "./20261001_152658_admin_security";
import * as migration_20261002_064614_cms_content from "./20261002_064614_cms_content";

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
    up: migration_20261002_064614_cms_content.up,
    down: migration_20261002_064614_cms_content.down,
    name: "20261002_064614_cms_content",
  },
];
