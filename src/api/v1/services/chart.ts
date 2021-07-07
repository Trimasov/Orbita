import { models } from "../../../models/models";

const getCountDeviceOnlineByDay = () => {
  const query =
    `SELECT *
    FROM devices
    WHERE accountId = '1'`

      return models.sequelize.query(query, { type: models.sequelize.QueryTypes.SELECT })

}


module.exports = {
  getCountDeviceOnlineByDay
}
