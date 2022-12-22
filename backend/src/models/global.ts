import * as path from 'path';

export class Global {
  public static leadingZeros(num, size): string {
    num = num.toString();
    while (num.length < size) num = '0' + num;
    return num;
  }
}
