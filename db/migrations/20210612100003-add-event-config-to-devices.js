"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.addColumn(
                "devices",
                "eventConfig",
                {
                    type: Sequelize.JSON
                },
            )
        ]);
    },
    down: async (queryInterface) => {
        return Promise.all([
            queryInterface.removeColumn("devices", "eventConfig")
        ]);
    }
};
