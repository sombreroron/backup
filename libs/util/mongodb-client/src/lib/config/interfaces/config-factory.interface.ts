import { SSLOptions } from './config.interface';

export interface ConfigFactory {
    getUri(): string;

    getSSLOptions(): SSLOptions;
}
