import * as debug from "./debug";

export class Satlite {
  PACKAGE_HEADER_SIZE: number = 10;
  PACKAGE_DATA_HEADER_SIZE: number = 21;
  PACKAGE_PREAMBLE_VALUE: number = 0x8A2C;

  incomingRawData: Array<any> = [];

  public binToJson(data: Array<number>) {
    this.incomingRawData.push(Array.from(data));
    this.incomingRawData = this.incomingRawData.flat();

    const result = this.parseBinToJson(this.incomingRawData);

    if (result) {
      this.incomingRawData = [];
      return result;
    }
  }

  public jsonToBin() {
    return "";
  }

  private parseBinToJson(buffer) {
    const index = this.findPackageEntrance(buffer);

    // if it's not possible to find package entrance (basically package header) in the buffer,
    // it means the there is nothing worth in the buffer and we can drop full buffer

    if (index == undefined) {
      buffer.length = 0;
      return;
    }

    // otherwise we can drop part of the buffer in front of package header
    // and start parsing it

    buffer.splice(0, index);

    // parse header of the package

    const header = this.parsePackageHeader(buffer);

    if (header == undefined) {
      // ParsePackageHeader() has own debug output
      // nothing to print here

      return undefined;
    }

    const package_length = header.dataLength + this.PACKAGE_HEADER_SIZE;

    if (buffer.length < package_length) {
      console.log("ParseReceivedData. The buffer doesn't have full incoming message. Waiting for the rest part");
      return undefined;
    }

    // skip first 2 bytes of the package (these bytes have CRC value for whole package)
    // and check CRC for whole package

    const crc = this.crc16(buffer, 2, package_length);

    debug.printPackageCRC(crc, header.crc);

    if (crc != header.crc) {

      // remove damaged message from the buffer with corresponding output in the log

      buffer = buffer.slice(0, package_length);

      console.log(`ParseReceivedData. Received CRC doesn't match with calculated value (${header.crc} : ${crc})`);
      console.log("Icoming message is damaged and will be skipped");

      return undefined;
    }

    // parse payload

    const dataHeader = this.parseDataHeader(buffer.slice(this.PACKAGE_HEADER_SIZE));

    if (dataHeader == undefined) {

      buffer.splice(0, package_length);

      // ParseDataHeader() has own debug output
      // nothing to print here

      return undefined;
    }

    const report = {
      foreignDeviceId  : header.trackerId,
      data: {
        gsm: {
          signalStrength: null,
        },
        position: dataHeader.position,
        sensors: {
          ain1: null,
        }
      }
    };

    buffer.splice(0, package_length);

    return report;
  }

  private crc16(data, from, to) {

    let crc = 0xFFFF;

    for (let i = from; i < to; i++) {

      crc = crc ^ (data[i] << 8);

      for (let j = 0; j < 8; j++) {

        // ATTENTION. Additional operation "& 0xFFFF" is required in order to
        // ensure that the end result is still 16-bit unsigned integer value

        if (crc & 0x8000) {
          crc = ( ( (crc << 1) ^ 0x1021 ) & 0xFFFF );
        } else {
          crc = ( (crc << 1) & 0xFFFF );
        }
      }
    }

    return crc;
  }

  private findPackageEntrance(buffer) {
    const ref_1 = ((this.PACKAGE_PREAMBLE_VALUE & 0xFF00) >> 8);
    const ref_0 =  (this.PACKAGE_PREAMBLE_VALUE & 0x00FF);

    for (let i = 0; i < buffer.length - 1; i++) {
      if (buffer[i + 1] == ref_1 && buffer[i] == ref_0) {
        // the following statement guarantees that there are 2 bytes with package CRC
        // in front of preamble (see package header description)

        if ( i >= 2 ) {
          return (i - 2);
        }
      }
    }

    return undefined;
  }

  private parsePackageHeader(buffer) {
    // Header structure:
    //
    //      typeder struct {
    //          uint16_t crc;           // for whole package
    //          uint16_t preamble;
    //          uint32_t tracker_id;
    //          uint16_t data_len;
    //      } t_binary_container;
    //
    // Example:
    //
    //      8C B9 2C 8A B3 E5 01 00 7C 05
    //
    // Sat-Lite 3 and Sat-Lite 4 both have constant value for preamble

    if (buffer.length < this.PACKAGE_HEADER_SIZE) {
      console.log("ParsePackageHeader. The buffer doesn't have enough bytes to keep correct package header");
      return undefined;
    }

    // ATTENTION. >>> operation is required here only in order to get unsigned integer value
    // otherwise there is a risk to get faulty values

    const header = {
      crc         : ( ( (buffer[1] << 8)  | buffer[0] ) >>> 0 ),
      preamble    : ( ( (buffer[3] << 8)  | buffer[2] ) >>> 0 ),
      trackerId   : ( ( (buffer[7] << 24) | (buffer[6] << 16) | (buffer[5] << 8) | buffer[4] ) >>> 0 ),
      dataLength  : ( ( (buffer[9] << 8)  | buffer[8] ) >>> 0 ),
    };

    debug.printPackageHeader(header);

    return header;
  }

  private parseDataHeader(buffer) {
    // Header structure:
    //
    //      typeder struct {
    //          uint16_t crc;           // for payload only
    //          uint16_t serial_id;     // package ID
    //          uint32_t timestamp;
    //          uint16_t packet_type;
    //          uint16_t packet_len;
    //          uint32_t x_coord;
    //          uint32_t y_coord;
    //          uint8_t sf;
    //      } t_common_data_header;
    //
    // Example:
    //
    //      B7 92 AD 59 25 2E 08 60 4C 00 60 00 DE 47 C5 AA 56 0C 3A 2B 00

    if (buffer.length < this.PACKAGE_DATA_HEADER_SIZE) {
      console.log("ParseDataHeader. The buffer doesn't have enough bytes to keep correct package data header");
      return undefined;
    }

    // ATTENTION. >>> operation is required here only in order to get unsigned integer value
    // otherwise there is a risk to get faulty values

    const header = {
      crc         : ( ( (buffer[1]  << 8)  | buffer[0]  ) >>> 0 ),
      id          : ( ( (buffer[3]  << 8)  | buffer[2]  ) >>> 0 ),

      timestamp   : ( ( (buffer[7]  << 24) | (buffer[6] << 16) | (buffer[5] << 8) | buffer[4] ) >>> 0 ),

      type        : ( ( (buffer[9]  << 8)  | buffer[8]  ) >>> 0 ),
      length      : ( ( (buffer[11] << 8)  | buffer[10] ) >>> 0 ),

      position : {
        lat : ( ( (buffer[15]  << 24) | (buffer[14] << 16) | (buffer[13] << 8) | buffer[12] ) >>> 0 ),
        long : ( ( (buffer[19]  << 24) | (buffer[18] << 16) | (buffer[17] << 8) | buffer[16] ) >>> 0 ),
      },

      dataSource : (buffer[20] & 0x01),
    };

    // conver
    //      raw_x = (x_value / 90)  * 0xFFFFFFFF
    //      raw_y = (y_value / 180) * 0xFFFFFFFF

    if (header.position.lat == 0xFFFFFFFF) {
      header.position.lat = null;
    } else {
      header.position.lat = (header.position.lat / 0xFFFFFFFF) * 90.0;
    }

    if (header.position.long == 0xFFFFFFFF) {
      header.position.long = null;
    } else {
      header.position.long = (header.position.long / 0xFFFFFFFF) * 180.0;
    }

    debug.printPackageDataHeader(header);

    return header;
  }
}
