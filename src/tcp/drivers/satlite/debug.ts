import config from "./config";

export function printPackageHeader(header) {
  if (config.DEBUG_PACKAGE_HEADER) {
    console.log("");
    console.log("Package Header: ");
    console.log("   CRC :         " + header.crc.toString(16).padStart(2, "0").toUpperCase()      );
    console.log("   Preamble :    " + header.preamble.toString(16).padStart(2, "0").toUpperCase() );
    console.log("   Tracker ID :  " + header.trackerId.toString()  );
    console.log("   Data Length : " + header.dataLength.toString() );
    console.log("");
  }
}

export function printPackageDataHeader(header) {
  if (config.DEBUG_PACKAGE_DATA_HEADER) {
    console.log("");
    console.log("Package Data Header: ");
    console.log("   CRC :             " + header.crc.toString(16).padStart(2, "0").toUpperCase()        );
    console.log("   Package ID :      " + header.id.toString()                                          );
    console.log("   Timestamp (UTC) : " + header.timestamp.toString()                                   );
    console.log("   Package Type :    " + header.type.toString(16).padStart(2, "0").toUpperCase()       );
    console.log("   Data Length :     " + header.length.toString()                                      );

    const x = header.position.lat;
    const y = header.position.long;

    console.log("   X :               " + (x || "null")                 );
    console.log("   Y :               " + (y || "null")                 );

    console.log("   Data Source :     " + header.dataSource.toString(16).padStart(2, "0").toUpperCase() );
    console.log("");
  }
}

export function printPackageCRC(crc, crc_ref) {
  if (config.DEBUG_PACKAGE_CRC) {
    console.log("");
    console.log("Received CRC :   " + crc_ref.toString(16).padStart(2, "0").toUpperCase());
    console.log("Calculated CRC : " +     crc.toString(16).padStart(2, "0").toUpperCase());
    console.log("");
  }
}
