import { IsNotEmpty, IsString, IsOptional, IsIn, IsBoolean, IsNumber } from 'class-validator';
import { AccessControlEnum } from '../enum/access-control.enum';
import { ContentEncoding } from '../enum/content-encoding.enum';

export class UploadFile {
    @IsNotEmpty()
    data: any;

    @IsString()
    @IsNotEmpty()
    fileName: string;

    @IsOptional()
    @IsIn(Object.keys(AccessControlEnum).map(key => AccessControlEnum[key]).filter(k => (parseInt(k) >= 0)))
    accessLevel?: AccessControlEnum;

    @IsOptional()
    @IsNumber()
    cacheTime?: number;

    @IsOptional()
    @IsString()
    contentType?: string;

    @IsOptional()
    @IsString()
    contentEncoding?: ContentEncoding;

    @IsOptional()
    @IsBoolean()
    noGzip?: boolean;
}
