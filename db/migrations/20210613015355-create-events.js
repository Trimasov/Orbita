"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("events", {
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
            eventTypeId: {
                type: Sequelize.INTEGER,
                references: {
                    model: "event_types",
                    key: "id"
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            read: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
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
        await queryInterface.dropTable("events");
    }
};
