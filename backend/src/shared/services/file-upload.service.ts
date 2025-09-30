import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { randomUUID } from 'crypto';

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);
  private s3: AWS.S3;

  constructor(private configService: ConfigService) {
    this.s3 = new AWS.S3({
      accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get<string>('AWS_REGION'),
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
  ): Promise<string> {
    try {
      const bucketName = this.configService.get<string>('AWS_S3_BUCKET');
      if (!bucketName) {
        throw new Error('AWS_S3_BUCKET is not configured');
      }

      const fileExtension = this.getFileExtension(file.originalname);
      const fileName = `${folder}/${randomUUID()}${fileExtension}`;

      const uploadParams = {
        Bucket: bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'private' as const,
      };

      const result = await this.s3.upload(uploadParams).promise();
      this.logger.log(`File uploaded successfully: ${result.Location}`);

      return result.Location;
    } catch (error) {
      this.logger.error('Error uploading file to S3:', error);
      throw new Error('Failed to upload file to S3');
    }
  }

  async uploadPublicFile(
    file: Express.Multer.File,
    folder: string = 'public',
  ): Promise<string> {
    try {
      const bucketName = this.configService.get<string>('AWS_S3_BUCKET');
      if (!bucketName) {
        throw new Error('AWS_S3_BUCKET is not configured');
      }

      const fileExtension = this.getFileExtension(file.originalname);
      const fileName = `${folder}/${randomUUID()}${fileExtension}`;

      const uploadParams = {
        Bucket: bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read' as const,
      };

      const result = await this.s3.upload(uploadParams).promise();
      this.logger.log(`Public file uploaded successfully: ${result.Location}`);

      return result.Location;
    } catch (error) {
      this.logger.error('Error uploading public file to S3:', error);
      throw new Error('Failed to upload public file to S3');
    }
  }

  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      const bucketName = this.configService.get<string>('AWS_S3_BUCKET');
      if (!bucketName) {
        throw new Error('AWS_S3_BUCKET is not configured');
      }

      const key = this.extractKeyFromUrl(fileUrl);

      if (!key) {
        this.logger.warn(`Invalid S3 URL: ${fileUrl}`);
        return false;
      }

      const deleteParams = {
        Bucket: bucketName,
        Key: key,
      };

      await this.s3.deleteObject(deleteParams).promise();
      this.logger.log(`File deleted successfully: ${key}`);

      return true;
    } catch (error) {
      this.logger.error('Error deleting file from S3:', error);
      return false;
    }
  }

  async generateSignedUrl(
    fileUrl: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    try {
      const bucketName = this.configService.get<string>('AWS_S3_BUCKET');
      if (!bucketName) {
        throw new Error('AWS_S3_BUCKET is not configured');
      }

      const key = this.extractKeyFromUrl(fileUrl);

      if (!key) {
        throw new Error('Invalid S3 URL');
      }

      const signedUrl = this.s3.getSignedUrl('getObject', {
        Bucket: bucketName,
        Key: key,
        Expires: expiresIn,
      });

      return signedUrl;
    } catch (error) {
      this.logger.error('Error generating signed URL:', error);
      throw new Error('Failed to generate signed URL');
    }
  }

  private getFileExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.');
    return lastDotIndex !== -1 ? filename.substring(lastDotIndex) : '';
  }

  private extractKeyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      return pathParts.slice(1).join('/');
    } catch {
      return null;
    }
  }

  async getFileInfo(fileUrl: string): Promise<any> {
    try {
      const bucketName = this.configService.get<string>('AWS_S3_BUCKET');
      if (!bucketName) {
        throw new Error('AWS_S3_BUCKET is not configured');
      }

      const key = this.extractKeyFromUrl(fileUrl);

      if (!key) {
        throw new Error('Invalid S3 URL');
      }

      const result = await this.s3
        .headObject({
          Bucket: bucketName,
          Key: key,
        })
        .promise();

      return {
        size: result.ContentLength,
        lastModified: result.LastModified,
        contentType: result.ContentType,
        etag: result.ETag,
      };
    } catch (error) {
      this.logger.error('Error getting file info:', error);
      throw new Error('Failed to get file info');
    }
  }
}