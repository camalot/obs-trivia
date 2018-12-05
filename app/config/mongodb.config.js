"use strict";


let result = {
	mongodb: {
		HOST: process.env.MONGODB_HOST || "localhost",
		PORT: parseInt(process.env.MONGODB_PORT || "27017", 0),
		USERNAME: process.env.MONGODB_USERNAME || "mdbroot",
		PASSWORD: process.env.MONGODB_PASSWORD || "mdbroot"
	}
};

if(!result.mongodb.HOST || result.mongodb.HOST === "") {
	throw new Error("MONGODB_HOST not set.");
}

if (!result.mongodb.PORT || result.mongodb.PORT === "" || isNaN(result.mongodb.PORT)) {
	throw new Error("MONGODB_PORT not set.");
}

if (!result.mongodb.USERNAME || result.mongodb.USERNAME === "") {
	throw new Error("MONGODB_USERNAME not set.");
}

if (!result.mongodb.PASSWORD || result.mongodb.PASSWORD === "") {
	throw new Error("MONGODB_PASSWORD not set.");
}

module.exports = result;
