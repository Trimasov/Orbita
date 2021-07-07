"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("geozones", {
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
            name: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            type: {
                type : Sequelize.STRING(20),
                allowNull: false
            },
            color: {
                type : Sequelize.STRING(10),
                allowNull: false
            },
            lineThickness: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defautValue: 1
            },
            data: {
                type : Sequelize.JSON,
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
        await queryInterface.dropTable("geozones");
    }
};
