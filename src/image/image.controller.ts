import {
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName, imageFileFilter } from 'src/common/utils';
import { ImageService } from './image.service';
import { createReadStream } from 'fs';
import path, { join } from 'path';
import { Response } from 'express';

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('/singleFileUpload/:id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: 'src/files',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  uploadFile(@UploadedFile() file, @Param('id') id: string) {
    const response = {
      originalname: file.originalname,
      filename: file.filename,
    };
    this.imageService.create(+id, { path: response.filename });
    return response;
  }

  @Post('/multipleFilesUpload/:id')
  @UseInterceptors(
    FilesInterceptor('images', 20, {
      storage: diskStorage({
        destination: 'src/files',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  uploadFiles(@UploadedFiles() files, @Param('id') id: string) {
    const response = [];
    files.forEach((file) => {
      const fileReponse = {
        originalname: file.originalname,
        filename: file.filename,
      };
      this.imageService.create(+id, { path: fileReponse.filename });
      response.push(fileReponse);
    });
    return response;
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const image = await this.imageService.findOne(+id);
    const file = createReadStream(
      join(process.cwd(), `/src/files/${image.path}`),
    );
    res.set({
      'Content-Type': 'image/*',
      'Content-Disposition': `attachment; filename="${image.path}"`,
    });
    return new StreamableFile(file);
    // const data = createReadStream(
    //   path.join(__dirname, `/src/files/${image.path}`),
    // );
    // data.pipe(response);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.imageService.remove(+id);
  }
}
