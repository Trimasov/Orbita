import { Satlite } from "./satlite";
import { Lorasat } from "./lorasat";
import { Test } from "./test";

const driverByPort = {
  "8001": Satlite,
  "8002": Test,
  "8003": Lorasat
};

export function getDriverClass(port: number) {
  return driverByPort[port];
}
