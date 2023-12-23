import { Body, Controller, Get, Logger, Param, Post } from '@nestjs/common';
import { JobService } from '../services/job.service';
import { CreateJobDto } from '../dtos/create-job.dto';
import { Job } from '../models/job.model';
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

@Controller('backup')
export class BackupController {
    constructor(
        private logger: Logger,
        private jobService: JobService,
    ) {}

    @Get(':id')
    @ApiOkResponse({ type: Job })
    @ApiOperation({ operationId: 'getBackupJob' })
    async getBackupJob(@Param('id') id: string): Promise<Job> {
        try {
            const job = await this.jobService.getJob(id);

            return job;
        } catch (e) {
            this.logger.error(`Failed getting backup job with error: ${e.message}`, { id });
        }
    }

    @Post()
    @ApiOkResponse({ type: Job })
    @ApiBody({ required: false, type: CreateJobDto })
    @ApiOperation({ operationId: 'createBackupJob' })
    async createBackupJob(@Body() job: CreateJobDto): Promise<Job> {
        try {
            const result = await this.jobService.createJob(job);

            return result;
        } catch (e) {
            this.logger.error(`Failed creating backup job with error: ${e.message}`);
        }
    }
}
