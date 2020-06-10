"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GlobalModel {
    constructor(debug = undefined) {
        GlobalModel.debug = debug;
        if (debug === undefined) {
            GlobalModel.debug =
                process.env.DEBUG_DB && process.env.DEBUG_DB === 'true' ? true : false;
        }
    }
}
exports.default = GlobalModel;
