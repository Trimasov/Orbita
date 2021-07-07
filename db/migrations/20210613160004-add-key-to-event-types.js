"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.addColumn(
                "event_types",
                "key",
                {
                    type : Sequelize.STRING(50),
                    allowNull: false
                },
            )
        ]);
    },
    down: async (queryInterface) => {
        return Promise.all([
            queryInterface.removeColumn("event_types", "key")
        ]);
    }
};
