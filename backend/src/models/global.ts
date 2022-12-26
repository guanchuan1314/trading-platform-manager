import * as fs from 'fs';
import { MPath } from './mpath';
import * as jwt from 'jsonwebtoken';

export class Global {
  public static leadingZeros(num, size): string {
    num = num.toString();
    while (num.length < size) num = '0' + num;
    return num;
  }

  public static isDev() {
    return __dirname.indexOf(process.cwd()) !== -1;
  }

  public static async getData() {
    if (!fs.existsSync(MPath.getRootPath() + '/data.json')) {
      throw new Error("File doesn't exist");
    }
    return JSON.parse(
      fs.readFileSync(MPath.getRootPath() + '/data.json', 'utf8'),
    );
  }

  public static async login(username, password) {
    const data = await Global.getData();
    const decoded = jwt.verify(data.token, data.key);
    if (decoded.username === username && decoded.password === password) {
      return jwt.sign(
        { username: username, password: password, time: Number(new Date()) },
        data.key,
        {
          algorithm: 'HS256',
        },
      );
    }
    throw new Error("Username or password doesn't match");
  }

  public static makeid(length) {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  public static async register(username, password) {
    if (fs.existsSync(MPath.getRootPath() + '/data.json')) {
      throw new Error('User has initiated.');
    }
    const key = Global.makeid(25);
    const token = jwt.sign({ username: username, password: password }, key, {
      algorithm: 'HS256',
    });
    fs.writeFileSync(
      MPath.getRootPath() + '/data.json',
      JSON.stringify({
        key: key,
        token: token,
      }),
    );
  }

  public static async checkPermission(token) {
    const data = await Global.getData();
    const decoded = jwt.verify(token, data.key);
    const storedDecoded = jwt.verify(data.token, data.key);
    if (decoded.username != storedDecoded.username) {
      throw new Error('Token mismatch');
    }
  }
}
