import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StorageClientService } from '../../storage-client/services/storage-client.service';
import { UploadPart } from '../../interfaces/upload-part.interface';
import { UploadPartResponse } from '../../interfaces/upload-part-response.interface';
import { DataPart } from '../models/data-part.model';
import { ChecksumService } from '@util/checksum';

@Injectable()
export class DbStorageClientService implements StorageClientService {
    constructor(
        @InjectModel(DataPart.name) private dataPartModel: Model<DataPart>,
        private checksumService: ChecksumService,
    ) {}

    async uploadPart(uploadPartOptions: UploadPart): Promise<UploadPartResponse> {
        await this.dataPartModel.create(uploadPartOptions);

        return {
            checksum: this.checksumService.calculateChecksum(uploadPartOptions.data),
            partNumber: uploadPartOptions.partNumber,
        };
    }
}
