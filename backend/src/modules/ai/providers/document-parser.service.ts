import { Injectable, Logger } from '@nestjs/common';
import pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';
import { cvParseSummarizeExtracted } from '../../../shared/utils/cv-parse-log.util';

@Injectable()
export class DocumentParserService {
  private readonly logger = new Logger(DocumentParserService.name);

  async parsePDF(buffer: Buffer): Promise<string> {
    try {
      const data = await pdfParse(buffer);
      const text = data.text ?? '';
      this.logger.log(
        `[CV_PARSE] pdf_extract pages=${data.numpages} ` +
          JSON.stringify({
            bufferBytes: buffer.length,
            ...cvParseSummarizeExtracted(text),
          }),
      );
      return text;
    } catch (error) {
      this.logger.error('[CV_PARSE] pdf_extract_failed', error);
      throw new Error('Failed to parse PDF file');
    }
  }

  async parseDOCX(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value ?? '';
      this.logger.log(
        `[CV_PARSE] docx_extract ` +
          JSON.stringify({
            bufferBytes: buffer.length,
            mammothMessages: result.messages?.length ?? 0,
            ...cvParseSummarizeExtracted(text),
          }),
      );
      return text;
    } catch (error) {
      this.logger.error('[CV_PARSE] docx_extract_failed', error);
      throw new Error('Failed to parse DOCX file');
    }
  }

  async extractTextFromFile(buffer: Buffer, mimeType: string): Promise<string> {
    this.logger.log(
      `[CV_PARSE] extract_start mime=${mimeType} bufferBytes=${buffer.length}`,
    );
    switch (mimeType) {
      case 'application/pdf':
        return this.parsePDF(buffer);
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return this.parseDOCX(buffer);
      default:
        throw new Error(`Unsupported file type: ${mimeType}`);
    }
  }

  validateFileType(mimeType: string): boolean {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    return allowedTypes.includes(mimeType);
  }

  validateFileSize(size: number, maxSizeMB: number = 10): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return size <= maxSizeBytes;
  }
}
