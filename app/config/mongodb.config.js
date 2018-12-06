"use strict";


let result = {
	mongodb: {
		HOST: process.env.CT_MONGODB_HOST || "localhost",
		PORT: parseInt(process.env.CT_MONGODB_PORT || "27017", 0),
		ROOT_USERNAME: process.env.CT_MONGODB_ROOT_USERNAME || "mdbroot",
		ROOT_PASSWORD: process.env.CT_MONGODB_ROOT_PASSWORD || "mdbroot",
		DB_USERNAME: process.env.CT_MONGODB_DB_USERNAME || "obs-trivia",
		DB_PASSWORD: process.env.CT_MONGODB_DB_PASSWORD || "obs-trivia",
		DATABASE: process.env.CT_MONGODB_DATABASE || "obs-trivia"
	}
};

if(!result.mongodb.HOST || result.mongodb.HOST === "") {
	throw new Error("CT_MONGODB_HOST not set.");
}

if (!result.mongodb.PORT || result.mongodb.PORT === "" || isNaN(result.mongodb.PORT)) {
	throw new Error("CT_MONGODB_PORT not set.");
}

if (!result.mongodb.ROOT_USERNAME || result.mongodb.ROOT_USERNAME === "") {
	throw new Error("CT_MONGODB_ROOT_USERNAME not set.");
}

if (!result.mongodb.ROOT_PASSWORD || result.mongodb.ROOT_PASSWORD === "") {
	throw new Error("CT_MONGODB_ROOT_PASSWORD not set.");
}

if (!result.mongodb.DB_USERNAME || result.mongodb.DB_USERNAME === "") {
	throw new Error("CT_MONGODB_DB_USERNAME not set.");
}

if (!result.mongodb.DB_PASSWORD || result.mongodb.DB_PASSWORD === "") {
	throw new Error("CT_MONGODB_DB_PASSWORD not set.");
}


if (!result.mongodb.DATABASE || result.mongodb.DATABASE === "") {
	throw new Error("DATABASE not set.");
}

module.exports = result;
