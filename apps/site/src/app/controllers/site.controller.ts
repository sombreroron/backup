import { Controller, Get, Param, Query, Res, StreamableFile } from '@nestjs/common';
import path from 'path';
import fs from 'fs';
import type { Response } from 'express';
import { ApiOkResponse, ApiOperation, ApiProduces } from '@nestjs/swagger';

@Controller()
export class SiteController {
    @Get('/:id/export')
    @ApiOkResponse({
        schema: {
            type: 'string',
            format: 'binary',
        },
    })
    @ApiProduces('application/zip')
    @ApiOperation({ operationId: 'exportSite' })
    generateFile(@Res({ passthrough: true }) res: Response, @Param('id') id: string, @Query('chunkSize') chunkSize = 10): StreamableFile {
        const filePath = path.resolve(process.cwd(), 'apps/site/src/app/files', `${id}.zip`);
        const fileStream = fs.createReadStream(filePath, { highWaterMark: chunkSize });

        res.set({
            'Content-Type': 'application/zip',
            'Content-Disposition': 'attachment; filename="site.zip"',
        });

        return new StreamableFile(fileStream);
    }

}
