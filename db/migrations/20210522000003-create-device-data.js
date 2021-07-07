"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("device_data", {
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
            deviceType: {
                type: Sequelize.STRING(20)
            },
            hardwareVersion: {
                type: Sequelize.STRING(100)
            },
            firmwareVersion: {
                type: Sequelize.STRING(100)
            },
            protocolVersion: {
                type: Sequelize.STRING(100)
            },
            data: {
                type: Sequelize.JSON
            },
            // deletedAt: {
            //     type: Sequelize.DATE
            // },
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
        await queryInterface.dropTable("device_data");
    }
};
