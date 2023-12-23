import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateJobDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: '65869bcf5be2bbd94c54a5bb' })
    userId: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: '658683afc91423af04d82153' })
    siteId: string;
}
