"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("devices", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            accountId: {
                type: Sequelize.INTEGER,
                references: {
                    model: "accounts",
                    key: "id"
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            foreignDeviceId: {
                type : Sequelize.INTEGER,
                unique: true,
                allowNull: false
            },
            name: {
                type : Sequelize.STRING(100),
                allowNull: false
            },
            port: {
                type : Sequelize.INTEGER,
                allowNull: false
            },
            version: {
                type : Sequelize.STRING(20),
                allowNull: false
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
        await queryInterface.dropTable("devices");
    }
};
