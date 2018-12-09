"use strict";


let result = {
	mongodb: {
		HOST: process.env.CT_MONGODB_HOST || "localhost",
		PORT: parseInt(process.env.CT_MONGODB_PORT || "27017", 0),
		USERNAME: process.env.CT_MONGODB_USERNAME || "mdbroot",
		PASSWORD: process.env.CT_MONGODB_PASSWORD || "mdbroot",
		AUTHDB: process.env.CT_MONGODB_AUTHDB || "admin",
		CONNECT_ARGS: process.env.CT_MONGODB_ARGS || "",
		DATABASE: process.env.CT_MONGODB_DATABASE || "obs-trivia"
	}
};

if(!result.mongodb.HOST || result.mongodb.HOST === "") {
	throw new Error("CT_MONGODB_HOST not set.");
}

if (!result.mongodb.PORT || result.mongodb.PORT === "" || isNaN(result.mongodb.PORT)) {
	throw new Error("CT_MONGODB_PORT not set.");
}

if (!result.mongodb.USERNAME || result.mongodb.USERNAME === "") {
	throw new Error("CT_MONGODB_ROOT_USERNAME not set.");
}

if (!result.mongodb.PASSWORD || result.mongodb.PASSWORD === "") {
	throw new Error("CT_MONGODB_PASSWORD not set.");
}


if (!result.mongodb.DATABASE || result.mongodb.DATABASE === "") {
	throw new Error("DATABASE not set.");
}

module.exports = result;
