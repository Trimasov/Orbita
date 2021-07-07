import config from "./config";

export function printPackageHeader(header) {

    if (config.DEBUG_PACKAGE_HEADER) {

        console.log("");
        console.log("Package Header: ");
        console.log("   Tracker ID:   " + header.deviceId    || "null" );
        console.log("   Package ID:   " + header.packageId   || "null" );
        console.log("   Package Type: " + header.packageType || "null" );
        console.log("   HW Version:   " + header.hwVersion   || "null" );
        console.log("   FW Version:   " + header.fwVersion   || "null" );
        console.log("");

    }

}

export function printPackageData_Type0000(data) {

    if (config.DEBUG_PACKAGE_TYPE_0000) {

        console.log("");
        console.log("Data (package type: 0)");
        console.log("   Timestamp (UTC): " + data.timestamp.toString());
        console.log("   Possition:");
        console.log("       Latitude:     " + (data.position.lat        || "null") );
        console.log("       Longitude:    " + (data.position.lon        || "null") );
        console.log("       Altitude (m): " + (data.position.alt        || "null") );
        console.log("       SNR min:      " + (data.gnss_status.snr_min || "null"));
        console.log("       SNR max:      " + (data.gnss_status.snr_max || "null"));
        console.log("       Satellites:   " + (data.gnss_status.sc      || "null"));
        console.log("       TTFF (sec):   " + (data.gnss_status.ttff    || "null"));
        console.log("   Device status:");
        console.log("       Battery level (mV): " + (data.pwr_status.battery     || "null"));
        console.log("       Temperature:        " + (data.pwr_status.temperature || "null"));
        console.log("");

    }

}

export function printLoraPktFwdPackageHeader(data) {

    if (config.DEBUG_LORA_PKT_FWD_PACKAGE_HEADER) {

        console.log("");
        console.log("LoraPktFwd Header:");
        console.log("    Protocol version:   " + data.prVersion   );
        console.log("    Random token:       " + data.token       );
        console.log("    Package identifier: " + data.packageType );
        console.log("    Gateway MAC addres: " + data.mac         );
        console.log("    JSON object:        " + data.json        );
        console.log("");

    }
}

export function printPackageData_TypeAck(data) {

    if (config.DEBUG_PACKAGE_TYPE_ACK) {

        console.log("");
        console.log("Data (package type: ack)");
        console.log("");

        let str = "";
        for (const byte of data) {
            str = str + byte.toString(16).padStart(2, "0") + " ";
        }

        if (str != "") {
            console.log("    " + str.toUpperCase());
        }

        console.log("");
    }
}

export function printPackageData(data) {

    if (config.DEBUG_PACKAGE) {
        console.log("");
        console.log("   Device ID:                          " + data.foreignDeviceId);
        console.log("   Timestamp (UTC):                    " + data.timestamp.toString());
        console.log("   Possition:");
        console.log("       Latitude:                       " + (data.data.position.lat || "null"));
        console.log("       Longitude:                      " + (data.data.position.lon || "null"));
        console.log("       Altitude (m):                   " + (data.data.position.alt || "null"));
        console.log("   Device Status:");
        console.log("       HW Version:                     " + (data.devstat.hwVersion   || "null"));
        console.log("       FW Version:                     " + (data.devstat.fwVersion   || "null"));
        console.log("       Battery level (mV):             " + (data.devstat.battery     || "null"));
        console.log("       Temperature:                    " + (data.devstat.temperature || "null"));
        console.log("       Package ID:                     " + (data.devstat.packageId   || "null"));
        console.log("   Network Status:");
        console.log("       LORA: ");
        console.log("           RX Frequency (MHz):         " + (data.network.lora.freq || "null"));
        console.log("           IF channel:                 " + (data.network.lora.rfch || "null"));
        console.log("           Datarate identifier:        " + (data.network.lora.datr || "null"));
        console.log("           ECC coding rate identifier: " + (data.network.lora.codr || "null"));
        console.log("           RSSI (dBm):                 " + (data.network.lora.rssi || "null"));
        console.log("           SNR (dB):                   " + (data.network.lora.snr  || "null"));
        console.log("       GNSS:");
        console.log("           SNR min:                    " + (data.network.gnss.snr_min || "null"));
        console.log("           SNR max:                    " + (data.network.gnss.snr_max || "null"));
        console.log("           Satellites:                 " + (data.network.gnss.sc      || "null"));
        console.log("");

    }
}
