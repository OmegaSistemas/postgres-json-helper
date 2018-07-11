const Sequelize = require("sequelize");
const configBD = require("../config.json");
const Ajv = require("ajv");
const merge = require("deepmerge");

function connect (db) {
    const sequelize = new Sequelize(db, configBD.postgres.user, configBD.postgres.password, {
        host: configBD.postgres.server,
        dialect: "postgres",
        operatorsAliases: false,
        pool: configBD.postgres.pool,
    });
    return sequelize;
}

// https://github.com/epoberezkin/ajv
// https://github.com/sequelize/sequelize/issues/3698
const Schema = {
    validator: schemaProp => {
        return {
            schema: obj => {
                // use defaults was not enough for nested objects
                const ajv = new Ajv();
                obj = merge.all([Schema.toPlain(schemaProp), obj]);
                var valid = ajv.validate(schemaProp, obj);
                if (!valid) {
                    throw new Error(JSON.stringify(ajv.errors));
                }
            },
        };
    },

    obj: object => {
        return {
            type: "object",
            additionalProperties: false,
            properties: object,
        };
    },

    toPlain: content => {
        const types = {};
        if (content.hasOwnProperty("type")) {
            content = content.properties;
            for (const obj in content) {
                if (content.hasOwnProperty(obj)) {
                    const row = content[obj];
                    if (row.type === "object") {
                        types[obj] = Schema.toPlain(row);
                    } else {
                        types[obj] = null;
                        if (row.hasOwnProperty("default")) {
                            types[obj] = row.default;
                        }
                    }
                } else {
                    console.error(obj, "not found");
                }
            }
        } else {
            throw new Error("Not is scheme AJV valid");
        }
        return types;
    },

    DATE: {
        instanceof: "Date",
        default: null,
    },

    STRING: {
        type: "string",
        default: "",
    },

    NUMBER: {
        type: ["number", "null"],
        default: null,
    },
};

module.exports = { connect, Sequelize, Schema };
