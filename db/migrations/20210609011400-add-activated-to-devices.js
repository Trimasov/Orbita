"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.addColumn(
                "devices",
                "active",
                {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                    defaultValue: false
                },
            )
        ]);
    },
    down: async (queryInterface) => {
        return Promise.all([
            queryInterface.removeColumn("devices", "active")
        ]);
    }
};
