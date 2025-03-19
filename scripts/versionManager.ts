// # 每次运行都会自动升级 patch 版本 (0.7.2 → 0.7.3 → 0.7.4)
// npm run build

// 升级 minor 版本 (0.7.2 → 0.8.0)
// VERSION_BUMP_TYPE=minor npm run build

// 升级 major 版本 (0.7.2 → 1.0.0)
// VERSION_BUMP_TYPE=major npm run build

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const VERSION_FILE = join(__dirname, "../version.store");
const PUBLIC_DIR = join(__dirname, "../public");
const DEV_VERSION = "0.0.0-dev"; // 开发环境固定版本

interface VersionData {
  readonly major: number;
  readonly minor: number;
  readonly patch: number;
}

enum VersionBumpType {
  MAJOR = "major",
  MINOR = "minor",
  PATCH = "patch",
}

const VERSION_LIMITS = {
  MINOR_MAX: 9,
  PATCH_MAX: 9,
} as const;

export class VersionManager {
  private currentVersion: VersionData;
  private isProduction: boolean;

  constructor(isProduction: boolean) {
    this.isProduction = isProduction;
    this.currentVersion = this.initializeVersion();
  }

  private parseVersion(versionString: string): VersionData {
    const [major, minor, patch] = versionString.split(".").map((num) => {
      const parsed = Number(num);
      return isNaN(parsed) ? undefined : parsed;
    });
    if (major === undefined || minor === undefined || patch === undefined) {
      throw new Error(`Invalid version format: ${versionString}`);
    }
    return { major, minor, patch };
  }

  private initializeVersion(): VersionData {
    // 生产环境必须读取存储文件
    if (this.isProduction) {
      try {
        const stored = readFileSync(VERSION_FILE, "utf-8").trim();
        return this.parseVersion(stored);
      } catch (error) {
        throw new Error("Production build requires valid version.store file");
      }
    }

    // 开发环境优先使用存储文件，不存在则使用开发版本
    try {
      const stored = readFileSync(VERSION_FILE, "utf-8").trim();
      return this.parseVersion(stored);
    } catch {
      return this.parseVersion(DEV_VERSION);
    }
  }

  private incrementMajor(version: VersionData): VersionData {
    return {
      major: version.major + 1,
      minor: 0,
      patch: 0,
    };
  }

  private incrementMinor(version: VersionData): VersionData {
    if (version.minor === VERSION_LIMITS.MINOR_MAX) {
      return this.incrementMajor(version);
    }
    return {
      ...version,
      minor: version.minor + 1,
      patch: 0,
    };
  }

  private incrementPatch(version: VersionData): VersionData {
    if (version.patch === VERSION_LIMITS.PATCH_MAX) {
      return this.incrementMinor(version);
    }
    return {
      ...version,
      patch: version.patch + 1,
    };
  }

  private saveVersion(): void {
    writeFileSync(VERSION_FILE, this.versionString);
  }

  public bumpVersion(type: VersionBumpType = VersionBumpType.PATCH): void {
    if (!this.isProduction) {
      console.warn("Version bump is disabled in development mode");
      return;
    }

    switch (type) {
      case VersionBumpType.MAJOR:
        this.currentVersion = this.incrementMajor(this.currentVersion);
        break;
      case VersionBumpType.MINOR:
        this.currentVersion = this.incrementMinor(this.currentVersion);
        break;
      case VersionBumpType.PATCH:
        this.currentVersion = this.incrementPatch(this.currentVersion);
        break;
    }

    this.saveVersion();
  }

  public generateVersionFile(): void {
    if (!this.isProduction) {
      if (!existsSync(join(PUBLIC_DIR, "version.json"))) {
        writeFileSync(
          join(PUBLIC_DIR, "version.json"),
          JSON.stringify({ version: DEV_VERSION }, null, 2)
        );
      }
      return;
    }

    writeFileSync(
      join(PUBLIC_DIR, "version.json"),
      JSON.stringify({ version: this.versionString }, null, 2)
    );
  }

  get versionString(): string {
    return `${this.currentVersion.major}.${this.currentVersion.minor}.${this.currentVersion.patch}`;
  }
}
