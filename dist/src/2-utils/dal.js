"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dal = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const app_config_1 = require("./app-config");
// DAL = Data Access Layer - The only one accessing the database.
class DAL {
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!app_config_1.appConfig.mongodbConnectionString) {
                    throw new Error("MongoDB connection string is undefined.");
                }
                const db = yield mongoose_1.default.connect(app_config_1.appConfig.mongodbConnectionString);
                console.log(`We're connected to MongoDB, database: ${db.connections[0].name}`);
            }
            catch (err) {
                console.log(err);
            }
        });
    }
}
exports.dal = new DAL();
