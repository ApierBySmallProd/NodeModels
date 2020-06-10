import GlobalMariaModel from '../global/maria.db';
export declare const ConnectDb: () => Promise<void>;
export default class MariaModel extends GlobalMariaModel {
    static singleton: MariaModel | null;
    static GetModel: () => MariaModel;
    private constructor();
}
