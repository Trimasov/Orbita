import { models } from "../../../models/models";

export const monitoring = async (accountId) => {
  return await models.Device.findAll({
    where: { accountId },
    include: deviceInclude()
  });
};

export const create = async (data) => {
  return await models.Device.create(data);
};

export const update = async (device, params) => {
  const deviceGeozones = params.deviceGeozones;
  delete params.deviceGeozones;

  await device.update(params);

  if (deviceGeozones) {

    for(const geozoneId of deviceGeozones) {
      const deviceGeozone = device.geozones.find(item => item.id === geozoneId);
      if (!deviceGeozone) {
        await device.addGeozone(geozoneId);
      }
    }
    for(const deviceGeozone of device.geozones) {
      const geozoneId = deviceGeozones.find(item => item === deviceGeozone.id);
      if (!geozoneId) {
        await device.removeGeozone(deviceGeozone.id);
      }
    }
    await device.reload();
  }

  return device;
};

export const getWhere = async (where) => {
  return await models.Device.findAll({ where });
};

export const find = async (id) => {
  return await models.Device.findOne({
    where: { id },
    include: deviceInclude()
  });
};

export const findWhere = async (where) => {
  return await models.Device.findOne(
    {
      where,
      include: deviceInclude()
    }
  );
};

export const destroy = async (id) => {
  return await models.Device.destroy({ where: { id } });
};

// TODO: need to undestand why this block doesnt work as constant. As variant because it init before models init
const deviceInclude = () => {
  return [{
    model: models.DeviceData,
    as: "deviceData",
    limit: 1,
    order: [[ "createdAt", "DESC" ]]
  }, {
    model: models.Geozone,
    as: 'geozones',
    attributes: ['id', 'name'],
    through: {
      attributes: []
    }
  },
  {
    model: models.Event,
    as: "events",
    limit: 1,
    where: {
      read: false
    },
    order: [[ "createdAt", "DESC" ]]
  }];
}
