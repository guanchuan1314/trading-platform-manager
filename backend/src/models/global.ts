export class Global {
  public static leadingZeros(num, size): string {
    num = num.toString();
    while (num.length < size) num = '0' + num;
    return num;
  }

  public static isDev() {
    return __dirname.indexOf(process.cwd()) !== -1;
  }
}
