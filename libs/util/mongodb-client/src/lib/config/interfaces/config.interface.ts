import { ReadPreferenceMode } from 'mongodb';

export interface ConnectionOptions {
    useUnifiedTopology?: boolean;

    useNewUrlParser?: boolean;
}

export interface SSLOptions {
    sslValidate?: boolean;

    useUnifiedTopology?: boolean;

    sslCA?: any[];

    ssl?: boolean;
}

export interface Config {
    host: string;

    port: string;

    user: string;

    pass: string;

    dbName: string;

    collections: string[];

    connectionOptions: ConnectionOptions;

    connectionName?: string;

    ssl?: string;

    sslCA?: string;

    authSource?: string;

    useNewUrlParser?: boolean;

    useUnifiedTopology?: boolean;

    useFindAndModify?: boolean;

    maxPoolSize?: number;

    connectTimeoutMS?: number;

    readPreference?: ReadPreferenceMode;

    replicaSet?: string;
}
