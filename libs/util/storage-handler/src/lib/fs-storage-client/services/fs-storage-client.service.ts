import { Injectable } from '@nestjs/common';
import fs from 'fs';
import { AbstractStorageClientService } from '../../storage-client/services/abstract-storage-client.service';
import { UploadFile } from '../../interfaces/upload-file.interface';
import { UploadFileResponse } from '../../interfaces/upload-file-response.interface';

@Injectable()
export class FsStorageClientService implements AbstractStorageClientService {
    async upload(uploadFileOptions: UploadFile): Promise<UploadFileResponse> {
        await fs.writeFileSync(uploadFileOptions.fileName, uploadFileOptions.data);

        return {
            fileName: uploadFileOptions.fileName,
            contentType: uploadFileOptions.contentType,
        };
    }
}
