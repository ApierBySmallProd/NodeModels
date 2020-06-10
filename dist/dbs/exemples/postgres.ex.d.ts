import GlobalPostgreModel from '../global/postgres.db';
export declare const ConnectDb: () => Promise<void>;
export default class PostgreModel extends GlobalPostgreModel {
    static singleton: PostgreModel | null;
    static GetModel: () => PostgreModel;
    private constructor();
}
