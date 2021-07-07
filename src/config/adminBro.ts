import AdminBroExpress from "@admin-bro/express";
import * as deviceService from "../api/v1/services/device";

const ADMIN = {
  email: process.env.ADMINBRO_LOGIN,
  password: process.env.ADMINBRO_PASSWORD,
};

export const adminRouter = (adminBro) => {
  return AdminBroExpress.buildAuthenticatedRouter(adminBro, {
    authenticate: async (email: string, password: string) => {
      if (ADMIN.password === password && ADMIN.email === email) {
        return ADMIN;
      }
      return null;
    },
    cookiePassword: process.env.ADMINBRO_COOKIE_PASS
  });
};

export const deviceDataResourceConfig = (field) => {
  return {
    actions: {
      new: {
        before: async (request) => jsonFieldPreProcess(request, field),
      },
      edit: {
        before: async (request) => jsonFieldPreProcess(request, field),
        after: (response) => {
          response.record.params = jsonFieldPostProcess(response.record.params, field);
          return response;
        }
      },
      show: {
        after: (response) => {
          response.record.params = jsonFieldPostProcess(response.record.params, field);
          return response;
        }
      },
      list: {
        after: (response) => {
          for (const deviceData of response.records) {
            deviceData.params = jsonFieldPostProcess(deviceData.params, field);
          }
          return response;
        }
      }
    }
  };
};

export const deviceResourceConfig = () => {
  return {
    properties: {
      foreignDeviceId: {
        isVisible: { list: true, filter: true, show: true, edit: true, new: true },
      }
    }
  };
};

const set = (obj, path, val) => {
  const keys = path.split(".");
  const lastKey = keys.pop();
  const lastObj = keys.reduce((obj, key) =>
      obj[key] = obj[key] || {},
    obj);
  lastObj[lastKey] = val;
};

function jsonFieldPreProcess(request, field) {
  if (request.payload[field]) {
    request.payload[field] = JSON.parse(request.payload[field]);
  } else {
    request.payload[field] = null;
  }
  return request;
}

function jsonFieldPostProcess(recordParams, jsonField) {
  const params = {};
  for (const recordField in recordParams) {
    if (!recordField.includes(`${jsonField}.`)) { continue; }
    set(params, recordField, recordParams[recordField]);
    recordParams = Object.assign(params, recordParams);
  }
  recordParams[jsonField] = JSON.stringify(recordParams[jsonField]);
  return recordParams;
}
