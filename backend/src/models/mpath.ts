import * as path from 'path';
import { Global } from './global';

export class MPath {
  public static getRootPath(): string {
    return Global.isDev()
      ? path.resolve(__dirname.split('backend')[0])
      : path.resolve(process.cwd());
  }
  
  public static getTmpPath(tmp): string {
    return path.resolve(this.getRootPath() + '/tmp/' + tmp);
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
