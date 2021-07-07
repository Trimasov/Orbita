"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("devices_geozones", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            deviceId: {
                type: Sequelize.INTEGER,
                references: {
                    model: "devices",
                    key: "id"
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            geozoneId: {
                type: Sequelize.INTEGER,
                references: {
                    model: "geozones",
                    key: "id"
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    down: async (queryInterface) => {
        await queryInterface.dropTable("devices_geozones");
    }
};
