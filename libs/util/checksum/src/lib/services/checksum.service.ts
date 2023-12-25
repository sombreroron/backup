import { Injectable } from '@nestjs/common';
import crypto from 'crypto';

@Injectable()
export class ChecksumService {
    calculateChecksum(data) {
        const hash = crypto.createHash('md5');

        hash.update(data);

        const checksum = hash.digest('hex');

        return checksum;

    }
}
