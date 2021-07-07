"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("users", {
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
                }
            },
            name: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            email: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            password: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            role: {
                type: Sequelize.STRING(20),
                allowNull: false
            },
            refreshToken: {
                type: Sequelize.STRING(200)
            },
            resetPasswordToken: {
                type: Sequelize.STRING(200)
            },
            resetPasswordExpiredAt: {
                type: Sequelize.DATE
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
        await queryInterface.dropTable("users");
    }
};
