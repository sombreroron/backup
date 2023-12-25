import { Module } from '@nestjs/common';
import { DbModule } from '@data-access/db';
import { SiteModule } from '@data-access/site';
import { Provider } from './enum/provider.enum';
import { DbProvider } from './providers/db.provider';
import { SiteProvider } from './providers/site.provider';

@Module({
    imports: [DbModule, SiteModule],
    providers: [
        { provide: Provider.Db, useClass: DbProvider },
        { provide: Provider.Site, useClass: SiteProvider },
    ],
    exports: [Provider.Db, Provider.Site],
})
export class ProviderModule {}
