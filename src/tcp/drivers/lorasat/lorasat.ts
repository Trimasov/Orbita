import * as debug from "./debug";

export class Lorasat {

    DEFAULT_SEND_INTERVAL : number = 15;

    PACKAGE_SIZE        : number = 26;
    PACKAGE_HEADER_SIZE : number = 6;
    PACKAGE_DATA_SIZE   : number = 20;
    PACKAGE_ACK_SIZE    : number = 7;

    public binToJson(data: Array<number>) {
        return this.LoraPktFwd_ParseUpstreamData(data);
    }

    public jsonToBin(data) {
        return this.LoraPktFwd_CreateDownstreamData(data);
    }

    private parsePackageHeader(buffer) {

        // Header structure:
        //
        // struct
        // {
        //     uint32_t    id : 24;            // Уникальный ID прибора внутри версии железа.
        //     uint32_t    hw_version : 8;     // Версия железа (число от 1 до 255).
        //                                     // Суммарно оба поля - уникальный ID прибора.
        //
        //     uint8_t     package_id : 4;     // Порядковый номер пакета от 0 до 15,
        //                                     // который служит для подтверждения сервером и
        //                                     // для определения пропадания пакетов.
        //     uint8_t     package_type : 4;   // Тип структуры данных пакета (сейчас = 0),
        //                                     // который определяет структуру данных пакета.
        //                                     // В каждой версии железа может быть своя
        //                                     // нумерация типов структур данных.
        //
        //     uint8_t     fw_version;         // Версия ПО (число от 1 до 255).
        //
        // } PackageHeader;  // 6 байт
        //
        // ATTENTION. >>> operation is required here only in order to get unsigned integer value
        // otherwise there is a risk to get faulty values

        let header = null;

        if (buffer) {

            if (buffer.length >= this.PACKAGE_HEADER_SIZE) {

                header = {

                    deviceId    : ( ( (buffer[3] << 24) | (buffer[2] << 16) | (buffer[1] << 8) | buffer[0] ) >>> 0 ),

                    packageId   : ( ((buffer[4] & 0x0F)     ) >>> 0 ),
                    packageType : ( ((buffer[4] & 0xF0) >> 4) >>> 0 ),

                    hwVersion   : (buffer[3] >>> 0),
                    fwVersion   : (buffer[5] >>> 0),
                };

                debug.printPackageHeader(header);
            }
        }

        return header;
    }

    private parsePackageType_0000(header, buffer) {

        // Package structure:
        //
        // struct
        // {
        //     struct
        //     {
        //         uint32_t timestamp;
        //     } DataHeader;   // 4 байт
        //
        //     struct
        //     {
        //         uint32_t longitude;         // долгота по EGTS
        //         uint32_t latitude;          // широта по EGTS
        //         uint16_t altitude : 12;     // высота [м] (0..4096 м)
        //         uint16_t longitude_sign : 1;// флаг полушария долготы
        //         uint16_t latitude_sign : 1; // флаг полушария широты
        //         uint16_t altitude_sign : 1; // знак высоты
        //         uint16_t validity : 1;      // флаг действительности координа
        //     } position; // 10 байт
        //
        //     struct
        //     {
        //         uint16_t battery : 12;      // текущий заряд источника питания в мВ
        //         uint16_t reserv : 4;        // зарезервировано
        //         int8_t   temperature;       // температура [град] -128..127
        //     } pwr_status; // 3 байт
        //
        //     struct
        //     {
        //         uint16_t snr_min : 6;       // для отслеживаемых спутников
        //         uint16_t snr_max : 6;       // для отслеживаемых спутников
        //         uint16_t sc_lo : 4;         // количество спутников, использованных в решение
        //         uint8_t sc_hi : 2;          // количество спутников, использованных в решение
        //         uint8_t ttff : 6;           // время старта [5 сек] 1..315, 0-провал
        //     } gnss_status; // 3 байт

        // ATTENTION. >>> operation is required here only in order to get unsigned integer value
        // otherwise there is a risk to get faulty values

        let data = null;

        if (buffer) {

            if (buffer.length != this.PACKAGE_DATA_SIZE) {
                return null;
            }

            data = {

                deviceId : header.deviceId,

                timestamp   : ( ( (buffer[3]  << 24) | (buffer[2] << 16) | (buffer[1] << 8) | buffer[0] ) >>> 0 ),

                position : {

                    lon : ( ( (buffer[7]   << 24) | (buffer[6]  << 16) | (buffer[5] << 8) | buffer[4] ) >>> 0 ),
                    lat : ( ( (buffer[11]  << 24) | (buffer[10] << 16) | (buffer[9] << 8) | buffer[8] ) >>> 0 ),

                    alt : ( ( ( (buffer[13] & 0x0F) << 8) | buffer[12]) >>> 0),

                    lon_sn : ( ( (buffer[13] & 0x10) >> 4) >>> 0),
                    lat_sn : ( ( (buffer[13] & 0x20) >> 5) >>> 0),
                    alt_sn : ( ( (buffer[13] & 0x40) >> 6) >>> 0),

                    sf :     ( ( (buffer[13] & 0x80) >> 7) >>> 0),
                },

                pwr_status : {

                    battery : ( ( ( (buffer[15] & 0x0F) << 8) | buffer[14]) >>> 0),

                    temperature : buffer[16],
                },

                status : {
                    hwVersion : header.hwVersion,
                    fwVersion : header.fwVersion,
                    packageId : header.packageId,
                },

                gnss_status : {

                    snr_min : ( (buffer[17] & 0x3F) >>> 0),

                    snr_max : ( ( ((buffer[18] & 0x0F) << 2) | ((buffer[17] & 0xC0) >> 6) ) >>> 0),

                    sc :      ( ( ((buffer[19] & 0x03) << 4) | ((buffer[18] & 0xF0) >> 4) ) >>> 0),

                    ttff :    ( ((buffer[19] & 0xFC) >> 2) >>> 0),
                }
            };

            if (data.position.sf == 0) {

                data.position.lat = null;
                data.position.lon = null;
                data.position.alt = null;

            } else {

                // conver
                //      raw_x = (x_value / 90)  * 0xFFFFFFFF
                //      raw_y = (y_value / 180) * 0xFFFFFFFF

                if (data.position.lat == 0xFFFFFFFF) {
                    data.position.lat = null;
                } else {
                    data.position.lat = (data.position.lat / 0xFFFFFFFF) * 90.0;

                    // set latitude sign

                    if (data.position.lat_sn == 1) {
                        data.position.lat = -data.position.lat;
                    }
                }

                if (data.position.lon == 0xFFFFFFFF) {
                    data.position.lon = null;
                } else {
                    data.position.lon = (data.position.lon / 0xFFFFFFFF) * 180.0;

                    // set longitude sign

                    if (data.position.lon_sn == 1) {
                        data.position.lon = -data.position.lon;
                    }
                }

                // set altitude sign

                if (data.position.alt_sn == 1) {
                    data.position.alt = -data.position.alt;
                }
            }

            debug.printPackageData_Type0000(data);
        }

        return data;
    }

    private parseDataField(buffer) {

        if (buffer) {

            const raw = Buffer.from(buffer, "base64");

            if (raw.length != this.PACKAGE_SIZE) {
                return null;
            }

            const header = this.parsePackageHeader(raw);

            if (header) {
                if (header.packageType == 0) {
                    return this.parsePackageType_0000(header, raw.slice(this.PACKAGE_HEADER_SIZE));
                }
            }
        }

        return null;
    }

    private LoraPktFwd_ParseRxpkObject(obj) {

        // The root object can contain an array named "rxpk":
        //
        // ``` json
        // {
        //     "rxpk":[ {...}, ...]
        // }
        // ```
        //
        // That array contains at least one JSON object, each object contain a RF packet
        // and associated metadata with the following fields:
        //
        //  Name |  Type  | Function
        // :----:|:------:|--------------------------------------------------------------
        //  time | string | UTC time of pkt RX, us precision, ISO 8601 'compact' format
        //  tmms | number | GPS time of pkt RX, number of milliseconds since 06.Jan.1980
        //  tmst | number | Internal timestamp of "RX finished" event (32b unsigned)
        //  freq | number | RX central frequency in MHz (unsigned float, Hz precision)
        //  chan | number | Concentrator "IF" channel used for RX (unsigned integer)
        //  rfch | number | Concentrator "RF chain" used for RX (unsigned integer)
        //  stat | number | CRC status: 1 = OK, -1 = fail, 0 = no CRC
        //  modu | string | Modulation identifier "LORA" or "FSK"
        //  datr | string | LoRa datarate identifier (eg. SF12BW500)
        //  datr | number | FSK datarate (unsigned, in bits per second)
        //  codr | string | LoRa ECC coding rate identifier
        //  rssi | number | RSSI in dBm (signed integer, 1 dB precision)
        //  lsnr | number | Lora SNR ratio in dB (signed float, 0.1 dB precision)
        //  size | number | RF packet payload size in bytes (unsigned integer)
        //  data | string | Base64 encoded RF packet payload, padded
        //
        // There is an example of icoming data from the Lora Base Station
        //
        // {
        //      "rxpk":[ {
        //          "tmst":249904476,
        //          "chan":4,
        //          "rfch":0,
        //          "freq":864.900000,
        //          "stat":-1,
        //          "modu":"LORA",
        //          "datr":"SF12BW125",
        //          "codr":"4/8",
        //          "lsnr":-23.0,
        //          "rssi":-27,
        //          "size":26,
        //          "data":"ZAAAAAUBM5H7FKqqqiqqqqqqLYBWDhbPKi0="
        //          }]
        //  }

        if (obj) {

            const report = [];

            for (let index = 0; index < obj.length; index++) {

                if (obj[index]["modu"] == "FSK") {
                    console.log("Incoming message has FSK modulation identifier. Message will be skipped");
                    continue;
                }

                if (obj[index]["stat"] == -1) {
                    console.log("CRC status of incoming message is \"FAIL\". Message will be skipped");
                    continue;
                }

                if (obj[index]["stat"] == 0) {
                    console.log("CRC status of incoming message is \"NO CRC\". Message will be skipped");
                    continue;
                }

                if (obj[index]["size"] != this.PACKAGE_SIZE) {
                    console.log("RF packet payload size does not match with expected value. Message will be skipped");
                    continue;
                }

                const data = this.parseDataField(obj[index]["data"]);

                const reportItem = {

                    foreignDeviceId  : data.deviceId,
                    timestamp : data.timestamp,

                    data : {

                        position : {
                            lat : data.position.lat,
                            lon : data.position.lon,
                            alt : data.position.alt,
                        }
                    },

                    devstat : {
                        battery     : data.pwr_status.battery,
                        temperature : data.pwr_status.temperature,
                        hwVersion   : data.status.hwVersion,
                        fwVersion   : data.status.fwVersion,
                        packageId   : data.status.packageId,
                    },

                    network : {

                        lora : {
                            freq : obj[index]["freq"],
                            rfch : obj[index]["rfch"],
                            datr : obj[index]["datr"],
                            codr : obj[index]["codr"],
                            rssi : obj[index]["rssi"],
                            snr  : obj[index]["lsnr"],

                            gateway : {
                                mac       : null,
                                prVersion : null,
                                lat       : null,
                                lon       : null,
                            }
                        },

                        gnss : {
                            sc :      data.gnss_status.sc,
                            snr_min : data.gnss_status.snr_min,
                            snr_max : data.gnss_status.snr_max,
                        },
                    },
                };

                debug.printPackageData(reportItem);

                report.push(reportItem);
            }

            return report;
        }

        return null;
    }

    private LoraPktFwd_ParseStatObject(obj) {

        // The root object can also contain an object named "stat" :
        //
        // ``` json
        // {
        //     "rxpk":[ {...}, ...],
        //     "stat":{...}
        // }
        // ```
        //
        // It is possible for a packet to contain no "rxpk" array but a "stat" object.
        //
        // ``` json
        // {
        //     "stat":{...}
        // }
        // ```
        //
        // That object contains the status of the gateway, with the following fields:
        //
        // Name |  Type  | Function
        // :----:|:------:|--------------------------------------------------------------
        // time | string | UTC 'system' time of the gateway, ISO 8601 'expanded' format
        // lati | number | GPS latitude of the gateway in degree (float, N is +)
        // long | number | GPS latitude of the gateway in degree (float, E is +)
        // alti | number | GPS altitude of the gateway in meter RX (integer)
        // rxnb | number | Number of radio packets received (unsigned integer)
        // rxok | number | Number of radio packets received with a valid PHY CRC
        // rxfw | number | Number of radio packets forwarded (unsigned integer)
        // ackr | number | Percentage of upstream datagrams that were acknowledged
        // dwnb | number | Number of downlink datagrams received (unsigned integer)
        // txnb | number | Number of packets emitted (unsigned integer)

        if (obj) {

            // at this moment we are not interested in "stat" object of the station
            // so we do nothing here

        }

        return null;
    }

    private LoraPktFwd_ParseTxAckObject(obj) {

        // The root object of TX_ACK packet must contain an object named "txpk_ack":
        //
        // ``` json
        // {
        //     "txpk_ack": {...}
        // }
        // ```
        //
        // That object contain status information concerning the associated PULL_RESP packet.
        //
        // Name |  Type  | Function
        // :----:|:------:|------------------------------------------------------------------------------
        // error | string | Indication about success or type of failure that occured for downlink request.
        //
        // The possible values of "error" field are:
        //
        // Value             | Definition
        // :-----------------:|---------------------------------------------------------------------
        // NONE              | Packet has been programmed for downlink
        // TOO_LATE          | Rejected because it was already too late to program this packet for downlink
        // TOO_EARLY         | Rejected because downlink packet timestamp is too much in advance
        // COLLISION_PACKET  | Rejected because there was already a packet programmed in requested timeframe
        // COLLISION_BEACON  | Rejected because there was already a beacon planned in requested timeframe
        // TX_FREQ           | Rejected because requested frequency is not supported by TX RF chain
        // TX_POWER          | Rejected because requested power is not supported by gateway
        // GPS_UNLOCKED      | Rejected because GPS is unlocked, so GPS timestamp cannot be used

        if (obj) {

        }

        return null;
    }

    private LoraPktFwd_ParseIncomingPacket(buffer) {

        const PUSH_PULL_PACKET_HEADER_SIZE = 12;

        // ### 3.2. PUSH_DATA packet ###
        //
        // That packet type is used by the gateway mainly to forward the RF packets
        // received, and associated metadata, to the server.
        //
        //  Bytes  | Function
        // :------:|---------------------------------------------------------------------
        //  0      | protocol version = 2
        //  1-2    | random token
        //  3      | PUSH_DATA identifier 0x00
        //  4-11   | Gateway unique identifier (MAC address)
        //  12-end | JSON object, starting with {, ending with }, see section 4

        // ### 5.2. PULL_DATA packet ###
        //
        // That packet type is used by the gateway to poll data from the server.
        //
        // Bytes  | Function
        // :------:|---------------------------------------------------------------------
        //  0      | protocol version = 2
        //  1-2    | random token
        //  3      | PULL_DATA identifier 0x02
        //  4-11   | Gateway unique identifier (MAC address)

        // ### 5.5. TX_ACK packet ###
        //
        // That packet type is used by the gateway to send a feedback to the server
        // to inform if a downlink request has been accepted or rejected by the gateway.
        //
        // Bytes  | Function
        // :------:|---------------------------------------------------------------------
        // 0      | protocol version = 2
        // 1-2    | same token as the PULL_RESP packet to acknowledge
        // 3      | TX_ACK identifier 0x05
        // 4-11   | Gateway unique identifier (MAC address)
        // 12-end | [optional] JSON object, starting with {, ending with }, see section 6

        if (buffer) {

            if (buffer.length >= PUSH_PULL_PACKET_HEADER_SIZE) {

                const header = {
                    prVersion   : buffer[0],
                    token       : ((buffer[2] << 8 | buffer[1]) >>> 0),
                    packageType : buffer[3],
                    mac         : null,
                    json        : null,
                };

                // we are creating MAC address as a string value using the following template: XX:XX:XX:XX:XX:XX:XX:XX

                header.mac = "";
                for (let i = 4; i <= 11; i++) {
                    header.mac += buffer[i].toString(16).padStart(2, "0").toUpperCase();
                    if (i != 11) {
                        header.mac += ":";
                    }
                }

                // save json object as a string value if it exists in the incoming packet

                if (buffer.length > PUSH_PULL_PACKET_HEADER_SIZE) {
                    header.json = buffer.slice(12).toString();
                }

                debug.printLoraPktFwdPackageHeader(header);

                return header;
            }
        }

        return null;
    }

    private LoraPktFwd_ParseUpstreamData(buffer) {

        const PUSH_DATA_PACKET_ID = 0x00;
        const PULL_DATA_PACKET_ID = 0x02;
        const TX_ACK_PACKET_ID    = 0x05;

        if (buffer) {

            const header = this.LoraPktFwd_ParseIncomingPacket(buffer);

            if (header) {

                if (header.packageType == PUSH_DATA_PACKET_ID) {

                    if (header.json == null)
                        return null;

                    const jsonObj = JSON.parse(header.json);

                    const rxpk = this.LoraPktFwd_ParseRxpkObject(jsonObj["rxpk"]);
                    const stat = this.LoraPktFwd_ParseStatObject(jsonObj["stat"]);

                    if (stat) {
                        // do nothing here just for now
                    }

                    // here we should return data which has been received from the device
                    // plus some service data in order to send ACK package to the gateway

                    const ret = {

                        data : rxpk,

                        meta : {
                            token      : header.token,
                            packetType : header.packageType,
                        }
                    };

                    return ret;

                } else if (header.packageType == PULL_DATA_PACKET_ID) {

                    // if we receive PULL_DATA packet, than it means we don't have data from the device
                    // and we just need to return some service in order to send ACK package to the gateway

                    const ret = {

                        data : null,

                        meta : {
                            token      : header.token,
                            packetType : header.packageType,
                        }
                    };

                    return ret;

                } else if (header.packageType == TX_ACK_PACKET_ID) {

                    if (header.json == null)
                        return null;

                    const jsonObj = JSON.parse(header.json);

                    const txack = this.LoraPktFwd_ParseTxAckObject(jsonObj["txpk_ack"]);

                    if (txack) {
                        // do nothing here just for now
                    }

                }
            }
        }

        return null;
    }

    private createPackageType_Ack(data) {

        // пакет подтверждения приема со стороны сервера
        //
        // typedef struct
        // {
        //     // обязательный заголовок, который не должен менять никогда
        //
        //     struct
        //     {
        //         uint32_t 	id : 24;            // уникальный ID прибора
        //         uint32_t 	hw_version : 8;    	// версия железа (число от 1 до 255)
        //         uint8_t  	package_id : 4;    	// порядковый номер пакета от 0 до 15,
        //                                          // служит для подтверждения сервером и
        //                                          // для определения пропадания пакетов
        //         uint8_t  	package_type : 4;  	// тип структуры данных пакета (сейчас = 0)
        //
        //     } PackageHeader;  // 5 байт
        //
        //     // далее идет опциональная часть, которая может меняться в зависимости
        //     // от версии ПО/железа/протокола
        //
        //     struct
        //     {
        //         uint16_t 	sendInterval;      // желаемый интервал отправки данных [мин] .
        //     } Config_type0;
        //
        // } PackageAck; // 7 байт

        if (data) {

            const buffer = new Array(this.PACKAGE_ACK_SIZE);

            buffer.fill(0);

            if (data.deviceId) {
                buffer[0] = ((data.deviceId & 0x000000FF) >> 0);
                buffer[1] = ((data.deviceId & 0x0000FF00) >> 8);
                buffer[2] = ((data.deviceId & 0x00FF0000) >> 16);
                buffer[3] = ((data.deviceId & 0xFF000000) >> 24);
            }

            if (data.devstat) {
                if (data.devstat.packageId) {
                    buffer[4] = /* (package type << 4) | */ (data.devstat.packageId & 0x0F);
                }
            }

            let sendInterval = this.DEFAULT_SEND_INTERVAL;

            if (data.devcfg) {
                if (data.devcfg.sendInterval) {
                    sendInterval = data.devcfg.sendInterval;
                }
            }

            buffer[5] = ((sendInterval & 0x00FF) >> 0);
            buffer[6] = ((sendInterval & 0xFF00) >> 8);

            debug.printPackageData_TypeAck(buffer);

            return buffer;
        }

        return null;
    }

    private LoraPktFwd_CreateDownstreamData(data) {

        // The root object of PULL_RESP packet must contain an object named "txpk":
        //
        // ``` json
        // {
        //     "txpk": {...}
        // }
        // ```
        //
        // That object contain a RF packet to be emitted and associated metadata with the following fields:
        //
        //  Name |  Type  | Function
        // :----:|:------:|--------------------------------------------------------------
        //  imme | bool   | Send packet immediately (will ignore tmst & time)
        //  tmst | number | Send packet on a certain timestamp value (will ignore time)
        //  tmms | number | Send packet at a certain GPS time (GPS synchronization required)
        //  freq | number | TX central frequency in MHz (unsigned float, Hz precision)
        //  rfch | number | Concentrator "RF chain" used for TX (unsigned integer)
        //  powe | number | TX output power in dBm (unsigned integer, dBm precision)
        //  modu | string | Modulation identifier "LORA" or "FSK"
        //  datr | string | LoRa datarate identifier (eg. SF12BW500)
        //  datr | number | FSK datarate (unsigned, in bits per second)
        //  codr | string | LoRa ECC coding rate identifier
        //  fdev | number | FSK frequency deviation (unsigned integer, in Hz)
        //  ipol | bool   | Lora modulation polarization inversion
        //  prea | number | RF preamble size (unsigned integer)
        //  size | number | RF packet payload size in bytes (unsigned integer)
        //  data | string | Base64 encoded RF packet payload, padding optional
        //  ncrc | bool   | If true, disable the CRC of the physical layer (optional)
        //
        // Most fields are optional.
        // If a field is omitted, default parameters will be used.

        // Data parameter must be an JSON object with the following structure
        //
        // {
        //     deviceId :
        //
        //     devstat : {
        //         packageId :
        //     },
        //
        //     network : {
        //         lora : {
        //             freq :
        //             datr :
        //             codr :
        //           },
        //     },
        //
        //     devcfg : {
        //         sendInterval :
        //     },
        // }
        //
        // Basically this object has almost the same fields, which you may get from LoraPktFwd_ParseRxpkObject() function

        const payload = this.createPackageType_Ack(data);

        if (payload) {

            if (data.network == null) {
                return null;
            }

            if (data.network.lora == null) {
                return null;
            }

            if (data.network.lora.freq == null) {
                return null;
            }

            if (data.network.lora.datr == null) {
                return null;
            }

            if (data.network.lora.codr == null) {
                return null;
            }

            const obj = {
                "txpk" : {
                    "imme" : true,                      // we send packet immediately
                    "freq" : data.network.lora.freq,
                    "powe" : 12,                        // using max TX power
                    "modu" : "LORA",                    // and LORA modulation
                    "datr" : data.network.lora.datr,
                    "codr" : data.network.lora.codr,
                    "size" : payload.length,
                    "data" : Buffer.from(payload).toString("base64"),
                }
            };

            return JSON.stringify(obj);
        }

        return null;
    }

}