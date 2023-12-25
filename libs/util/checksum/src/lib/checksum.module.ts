import { Module } from '@nestjs/common';
import { ChecksumService } from './services/checksum.service';

@Module({
    providers: [ChecksumService],
    exports: [ChecksumService],
})
export class ChecksumModule {}
