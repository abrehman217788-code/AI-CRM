import { Controller, Post, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadsService } from './uploads.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Uploads')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('uploads')
export class UploadsController {
  constructor(private uploadsService: UploadsService) {}

  @Post('csv')
  @ApiOperation({ summary: 'Import leads from CSV file' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async importCsv(@UploadedFile() file: Express.Multer.File, @CurrentUser('id') userId: string) {
    return this.uploadsService.importCsvBuffer(file.buffer.toString('utf-8'), userId);
  }
}
