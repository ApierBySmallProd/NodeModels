import { getField } from './utils';

// tslint:disable-next-line: function-name
export function Tinyint() {
  return (target: any, key: string) => {
    const field = getField(target, key);
    field.setType('tinyint');
  };
}

// tslint:disable-next-line: function-name
export function Bool() {
  return (target: any, key: string) => {
    const field = getField(target, key);
    field.setType('boolean');
  };
}

// tslint:disable-next-line: function-name
export function SmallInt() {
  return (target: any, key: string) => {
    const field = getField(target, key);
    field.setType('smallint');
  };
}

// tslint:disable-next-line: function-name
export function MediumInt() {
  return (target: any, key: string) => {
    const field = getField(target, key);
    field.setType('mediumint');
  };
}

// tslint:disable-next-line: function-name
export function Int() {
  return (target: any, key: string) => {
    const field = getField(target, key);
    field.setType('int');
  };
}

// tslint:disable-next-line: function-name
export function BigInt() {
  return (target: any, key: string) => {
    const field = getField(target, key);
    field.setType('bigint');
  };
}

// tslint:disable-next-line: function-name
export function Decimal() {
  return (target: any, key: string) => {
    const field = getField(target, key);
    field.setType('decimal');
  };
}

// tslint:disable-next-line: function-name
export function Float() {
  return (target: any, key: string) => {
    const field = getField(target, key);
    field.setType('float');
  };
}

// tslint:disable-next-line: function-name
export function Double() {
  return (target: any, key: string) => {
    const field = getField(target, key);
    field.setType('double');
  };
}

// tslint:disable-next-line: function-name
export function Bit() {
  return (target: any, key: string) => {
    const field = getField(target, key);
    field.setType('bit');
  };
}

// tslint:disable-next-line: function-name
export function Date() {
  return (target: any, key: string) => {
    const field = getField(target, key);
    field.setType('date');
  };
}

// tslint:disable-next-line: function-name
export function Time() {
  return (target: any, key: string) => {
    const field = getField(target, key);
    field.setType('time');
  };
}

// tslint:disable-next-line: function-name
export function DateTime() {
  return (target: any, key: string) => {
    const field = getField(target, key);
    field.setType('datetime');
  };
}

// tslint:disable-next-line: function-name
export function Timestamp() {
  return (target: any, key: string) => {
    const field = getField(target, key);
    field.setType('timestamp');
  };
}

// tslint:disable-next-line: function-name
export function Year() {
  return (target: any, key: string) => {
    const field = getField(target, key);
    field.setType('year');
  };
}

// tslint:disable-next-line: function-name
export function Char() {
  return (target: any, key: string) => {
    const field = getField(target, key);
    field.setType('char');
  };
}

// tslint:disable-next-line: function-name
export function Varchar(size: number = 255) {
  return (target: any, key: string) => {
    const field = getField(target, key);
    field.setType('varchar');
    field.length(size);
  };
}

// tslint:disable-next-line: function-name
export function Binary() {
  return (target: any, key: string) => {
    const field = getField(target, key);
    field.setType('binary');
  };
}

// tslint:disable-next-line: function-name
export function VarBinary() {
  return (target: any, key: string) => {
    const field = getField(target, key);
    field.setType('varbinary');
  };
}

// tslint:disable-next-line: function-name
export function TinyBlob() {
  return (target: any, key: string) => {
    const field = getField(target, key);
    field.setType('tinyblob');
  };
}

// tslint:disable-next-line: function-name
export function Blob() {
  return (target: any, key: string) => {
    const field = getField(target, key);
    field.setType('blob');
  };
}

// tslint:disable-next-line: function-name
export function MediumBlob() {
  return (target: any, key: string) => {
    const field = getField(target, key);
    field.setType('mediumblob');
  };
}

// tslint:disable-next-line: function-name
export function LongBlob() {
  return (target: any, key: string) => {
    const field = getField(target, key);
    field.setType('longblob');
  };
}

// tslint:disable-next-line: function-name
export function TinyText() {
  return (target: any, key: string) => {
    const field = getField(target, key);
    field.setType('tinytext');
  };
}

// tslint:disable-next-line: function-name
export function Text() {
  return (target: any, key: string) => {
    const field = getField(target, key);
    field.setType('text');
  };
}

// tslint:disable-next-line: function-name
export function LongText() {
  return (target: any, key: string) => {
    const field = getField(target, key);
    field.setType('longtext');
  };
}
