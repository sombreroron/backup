import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UploadPart {
    @IsNotEmpty()
    data: Buffer;

    @IsString()
    @IsNotEmpty()
    key: string;

    @IsNumber()
    @IsNotEmpty()
    partNumber: number;

    @IsString()
    @IsNotEmpty()
    uploadId: string;
}
