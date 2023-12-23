import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export interface EventError {
    message: string;
    stack: string;
}

export abstract class EventDto {
    @IsNotEmpty()
    @IsString()
    static type: string;

    @IsOptional()
    @IsString()
    message?: string;

    @IsOptional()
    errors?: EventError[];
}
