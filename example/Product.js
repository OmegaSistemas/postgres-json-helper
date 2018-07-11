const { connect, Sequelize, Schema } = require("../Postgres");

const db = connect("mydatabase");

const schemaContent = Schema.obj({
    name: Schema.STRING,
    date: Schema.DATE,
    balance: Schema.NUMBER,
    data: Schema.obj({
        manufacturer: Schema.STRING,
        name: Schema.STRING,
        prerelease: Schema.STRING,
        version: Schema.STRING,
        especify: Schema.obj({
            architecture: Schema.NUMBER,
            family: Schema.STRING,
            version: Schema.STRING,
        }),
    }),
});

module.exports = db.define("product", {
    id: {
        primaryKey: true,
        type: Sequelize.BIGINT,
        autoIncrement: true,
    },
    content: {
        type: Sequelize.JSONB,
        allowNull: false,
        validate: Schema.validator(
            schemaContent
        ),
    },
});

 