export class Test {
  public binToJson() {
    return {
      deviceId: 1,
      data: {
        gsm: {
          signalStrength: 123,
        },
        position: 123,
        sensors: {
          ain1: 123,
        }
      }
    };
  }

  public jsonToBin() {
    return "";
  }
}
