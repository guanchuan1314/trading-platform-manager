import * as path from 'path';

export class MPath {
  public static getRootPath(): string {
    return path.resolve(__dirname.split('backend')[0]);
  }

  public static getConfigPath(config): string {
    return path.resolve(this.getRootPath() + '/configs/' + config);
  }

  public static getPlatformPath(platform): string {
    return path.resolve(this.getRootPath() + '/platforms/' + platform);
  }

  public static getResourcePath(resource): string {
    return path.resolve(this.getRootPath() + '/resources/' + resource);
  }
}
