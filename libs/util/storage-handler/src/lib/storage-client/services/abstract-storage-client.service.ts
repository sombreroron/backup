import { UploadFile } from '../../interfaces/upload-file.interface';
import { UploadFileResponse } from '../../interfaces/upload-file-response.interface';

export abstract class AbstractStorageClientService {
    abstract upload(uploadFileOptions: UploadFile): Promise<UploadFileResponse>;
}
