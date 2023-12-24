import { UploadPart } from '../../interfaces/upload-part.interface';
import { UploadPartResponse } from '../../interfaces/upload-part-response.interface';

export abstract class StorageClientService {
    abstract uploadPart(uploadFileOptions: UploadPart): Promise<UploadPartResponse>;
}
