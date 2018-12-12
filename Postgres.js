const Sequelize = require("sequelize");
const configBD = require("../config.json");
const Ajv = require("ajv");
const merge = require("lodash.merge");

function connect(db) {
    const sequelize = new Sequelize(
        db,
        configBD.postgres.user,
        configBD.postgres.password,
        {
            host: configBD.postgres.server,
            dialect: "postgres",
            port: configBD.postgres.port,
            operatorsAliases: false,
            pool: configBD.postgres.pool,
            logging: configBD.postgres.logging,
            timezone: "America/Sao_Paulo"
        }
    );
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
                obj = Schema.applyDefaultValues(obj, schemaProp);
                var valid = ajv.validate(schemaProp, obj);
                if (!valid) {
                    console.log(obj);
                    throw new Error(JSON.stringify(ajv.errors));
                }
            }
        };
    },

    obj: object => {
        Object.keys(object).forEach(key => {
            if (typeof object[key] === "function") {
                object[key] = object[key].call(this);
            }
        });
        return {
            type: "object",
            additionalProperties: false,
            properties: object
        };
    },

    array: items => {
        if (typeof items === "function") {
            items = items.call(this);
        }
        return {
            type: ["array", "null"],
            additionalItems: false,
            items: items,
            default: []
        };
    },

    toPlain: content => {
        const types = {};
        if (content.hasOwnProperty("type")) {
            content = content.properties;
            for (const obj in content) {
                if (content.hasOwnProperty(obj)) {
                    let row = content[obj];
                    if (typeof row == "function") {
                        row = row.call(this);
                    }
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
        return JSON.parse(JSON.stringify(types));
    },

    applyDefaultValues: (obj, schemaProp) => {
        return merge(Schema.toPlain(schemaProp), obj);
    },

    DATE: {
        instanceof: "Date",
        default: null
    },

    STRING: (def = "") => {
        return {
            type: ["string", "null"],
            default: def
        };
    },

    NUMBER: {
        type: ["number", "null"],
        default: null
    },

    ARRAY: {
        type: ["array", "null"],
        default: []
    },

    OBJECT: {
        type: ["object", "null"],
        additionalProperties: true,
        default: {}
    },

    BOOLEAN: {
        type: "boolean",
        default: false
    }
};

module.exports = { connect, Sequelize, Schema };
