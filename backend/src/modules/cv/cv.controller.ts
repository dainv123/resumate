import { 
  Controller, 
  Post, 
  Get, 
  Put, 
  Delete,
  Body, 
  Param, 
  UseGuards, 
  UseInterceptors, 
  UploadedFile,
  Query,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CvService } from './cv.service';
import { ExportService } from '../../shared/services/export.service';
import { UpdateCvDto, TailorCvDto } from './dto/cv.dto';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('cv')
@UseGuards(JwtAuthGuard)
export class CvController {
  constructor(
    private cvService: CvService,
    private exportService: ExportService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCv(
    @GetUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.cvService.uploadCv(userId, file);
  }

  @Get()
  async getUserCvs(@GetUser('id') userId: string) {
    return this.cvService.getUserCvs(userId);
  }

  @Get(':id')
  async getCv(
    @Param('id') id: string, 
    @GetUser('id') userId: string,
  ) {
    return this.cvService.getCvById(id, userId);
  }

  @Get(':id/with-relations')
  async getCvWithRelations(
    @Param('id') id: string, 
    @GetUser('id') userId: string,
  ) {
    return this.cvService.getCvWithRelations(id, userId);
  }

  @Put(':id')
  async updateCv(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() updateCvDto: UpdateCvDto,
  ) {
    return this.cvService.updateCv(id, userId, updateCvDto);
  }


  @Get(':id/suggestions')
  async getSuggestions(
    @Param('id') id: string,
    @GetUser('id') userId: string,
  ) {
    return this.cvService.getSuggestions(id, userId);
  }

  @Get(':id/versions')
  async getCvVersions(
    @Param('id') id: string,
    @GetUser('id') userId: string,
  ) {
    return this.cvService.getCvVersions(id, userId);
  }

  @Get(':id/export/pdf')
  async exportToPDF(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Res() res: Response,
  ) {
    const cv = await this.cvService.getCvById(id, userId);
    const pdfBuffer = await this.exportService.exportToPDF(cv.parsedData);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${cv.originalFileName.replace(/\.[^/.]+$/, '')}.pdf"`,
    });
    
    res.send(pdfBuffer);
  }

  @Get(':id/export/word')
  async exportToWord(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Res() res: Response,
  ) {
    const cv = await this.cvService.getCvById(id, userId);
    const wordBuffer = await this.exportService.exportToWord(cv.parsedData);
    
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${cv.originalFileName.replace(/\.[^/.]+$/, '')}.docx"`,
    });
    
    res.send(wordBuffer);
  }

  @Get(':id/export/ats')
  async exportToATS(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Res() res: Response,
  ) {
    const cv = await this.cvService.getCvById(id, userId);
    const atsBuffer = await this.exportService.exportToATS(cv.parsedData);
    
    res.set({
      'Content-Type': 'text/plain',
      'Content-Disposition': `attachment; filename="${cv.originalFileName.replace(/\.[^/.]+$/, '')}_ats.txt"`,
    });
    
    res.send(atsBuffer);
  }

  @Delete(':id')
  async deleteCv(
    @Param('id') id: string,
    @GetUser('id') userId: string,
  ) {
    await this.cvService.deleteCv(id, userId);
    return { message: 'CV deleted successfully' };
  }

  @Post(':id/duplicate')
  async duplicateCv(
    @Param('id') id: string,
    @GetUser('id') userId: string,
  ) {
    const duplicatedCv = await this.cvService.duplicateCv(id, userId);
    return duplicatedCv;
  }

  @Post(':id/tailor')
  async tailorCv(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() tailorCvDto: TailorCvDto,
  ) {
    const tailoredCv = await this.cvService.tailorCv(id, userId, tailorCvDto.jobDescription);
    return tailoredCv;
  }
}