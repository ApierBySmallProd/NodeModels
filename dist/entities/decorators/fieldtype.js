"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
function Tinyint() {
    return (target, key) => {
        const field = utils_1.getField(target, key);
        field.setType('tinyint');
    };
}
exports.Tinyint = Tinyint;
function Bool() {
    return (target, key) => {
        const field = utils_1.getField(target, key);
        field.setType('boolean');
    };
}
exports.Bool = Bool;
function SmallInt() {
    return (target, key) => {
        const field = utils_1.getField(target, key);
        field.setType('smallint');
    };
}
exports.SmallInt = SmallInt;
function MediumInt() {
    return (target, key) => {
        const field = utils_1.getField(target, key);
        field.setType('mediumint');
    };
}
exports.MediumInt = MediumInt;
function Int() {
    return (target, key) => {
        const field = utils_1.getField(target, key);
        field.setType('int');
    };
}
exports.Int = Int;
function BigInt() {
    return (target, key) => {
        const field = utils_1.getField(target, key);
        field.setType('bigint');
    };
}
exports.BigInt = BigInt;
function Decimal() {
    return (target, key) => {
        const field = utils_1.getField(target, key);
        field.setType('decimal');
    };
}
exports.Decimal = Decimal;
function Float() {
    return (target, key) => {
        const field = utils_1.getField(target, key);
        field.setType('float');
    };
}
exports.Float = Float;
function Double() {
    return (target, key) => {
        const field = utils_1.getField(target, key);
        field.setType('double');
    };
}
exports.Double = Double;
function Bit() {
    return (target, key) => {
        const field = utils_1.getField(target, key);
        field.setType('bit');
    };
}
exports.Bit = Bit;
function Date() {
    return (target, key) => {
        const field = utils_1.getField(target, key);
        field.setType('date');
    };
}
exports.Date = Date;
function Time() {
    return (target, key) => {
        const field = utils_1.getField(target, key);
        field.setType('time');
    };
}
exports.Time = Time;
function DateTime() {
    return (target, key) => {
        const field = utils_1.getField(target, key);
        field.setType('datetime');
    };
}
exports.DateTime = DateTime;
function Timestamp() {
    return (target, key) => {
        const field = utils_1.getField(target, key);
        field.setType('timestamp');
    };
}
exports.Timestamp = Timestamp;
function Year() {
    return (target, key) => {
        const field = utils_1.getField(target, key);
        field.setType('year');
    };
}
exports.Year = Year;
function Char() {
    return (target, key) => {
        const field = utils_1.getField(target, key);
        field.setType('char');
    };
}
exports.Char = Char;
function Varchar(size = 255) {
    return (target, key) => {
        const field = utils_1.getField(target, key);
        field.setType('varchar');
        field.length(size);
    };
}
exports.Varchar = Varchar;
function Binary() {
    return (target, key) => {
        const field = utils_1.getField(target, key);
        field.setType('binary');
    };
}
exports.Binary = Binary;
function VarBinary() {
    return (target, key) => {
        const field = utils_1.getField(target, key);
        field.setType('varbinary');
    };
}
exports.VarBinary = VarBinary;
function TinyBlob() {
    return (target, key) => {
        const field = utils_1.getField(target, key);
        field.setType('tinyblob');
    };
}
exports.TinyBlob = TinyBlob;
function Blob() {
    return (target, key) => {
        const field = utils_1.getField(target, key);
        field.setType('blob');
    };
}
exports.Blob = Blob;
function MediumBlob() {
    return (target, key) => {
        const field = utils_1.getField(target, key);
        field.setType('mediumblob');
    };
}
exports.MediumBlob = MediumBlob;
function LongBlob() {
    return (target, key) => {
        const field = utils_1.getField(target, key);
        field.setType('longblob');
    };
}
exports.LongBlob = LongBlob;
function TinyText() {
    return (target, key) => {
        const field = utils_1.getField(target, key);
        field.setType('tinytext');
    };
}
exports.TinyText = TinyText;
function Text() {
    return (target, key) => {
        const field = utils_1.getField(target, key);
        field.setType('text');
    };
}
exports.Text = Text;
function LongText() {
    return (target, key) => {
        const field = utils_1.getField(target, key);
        field.setType('longtext');
    };
}
exports.LongText = LongText;
