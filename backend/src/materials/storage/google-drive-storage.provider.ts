import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IFileStorage, StoreFileResult } from './file-storage.interface';
import { google } from 'googleapis';
import { Express } from 'express';
import { Readable } from 'stream';
import * as path from 'path';

@Injectable()
export class GoogleDriveStorageProvider implements IFileStorage {
  private readonly logger = new Logger(GoogleDriveStorageProvider.name);
  private readonly folderId = '1jBwYBk9kxmzMxiBD7xtfSgDs_ZP-gU7n';
  private driveClient;

  constructor(private configService: ConfigService) {
    this.initializeClient();
  }

  private async initializeClient() {
    try {
      const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
      const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
      const refreshToken = this.configService.get<string>('GOOGLE_REFRESH_TOKEN');
      const redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI') || 'https://developers.google.com/oauthplayground';

      if (clientId && clientSecret && refreshToken) {
        this.logger.log('Initializing Google Drive with OAuth2 (User Credentials)...');
        const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
        oauth2Client.setCredentials({ refresh_token: refreshToken });
        this.driveClient = google.drive({ version: 'v3', auth: oauth2Client });
        this.logger.log('Google Drive Client initialized with OAuth2 successfully');
      } else {
        this.logger.log('Initializing Google Drive with Service Account...');
        const auth = new google.auth.GoogleAuth({
          scopes: ['https://www.googleapis.com/auth/drive'],
        });
        const client = await auth.getClient();
        const projectId = await auth.getProjectId();
        this.logger.log(`Google Auth successful. Project ID: ${projectId}`);
        this.driveClient = google.drive({ version: 'v3', auth });
      }
    } catch (error) {
      this.logger.error('Failed to initialize Google Drive client', error);
    }
  }

  async store(file: Express.Multer.File): Promise<StoreFileResult> {
    if (!this.driveClient) {
      await this.initializeClient();
    }

    const bufferStream = new Readable();
    bufferStream.push(file.buffer);
    bufferStream.push(null);

    const uniqueName = `${path.parse(file.originalname).name}_${Date.now()}${path.extname(file.originalname)}`;

    try {
      const response = await this.driveClient.files.create({
        requestBody: {
          name: uniqueName,
          parents: [this.folderId],
        },
        media: {
          mimeType: file.mimetype,
          body: bufferStream,
        },
        fields: 'id, name, webViewLink, webContentLink, size',
        supportsAllDrives: true,
      });

      const { id, webViewLink, size } = response.data;

      // Hacemos el archivo público o accesible según configuración del drive.
      // Si la carpeta ya es pública/compartida, el archivo hereda permisos generalmente.
      // Si necesitas forzar permisos públicos:
      /*
      await this.driveClient.permissions.create({
        fileId: id,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });
      */

      return {
        provider: 'GOOGLE_DRIVE',
        ref: webViewLink, // Guardamos el link directo
        mime: file.mimetype,
        size: Number(size) || file.size,
        originalName: file.originalname,
        filename: uniqueName,
      };
    } catch (error) {
      this.logger.error(`Error uploading to Google Drive: ${error.message}`, error);
      throw new Error('Failed to upload file to Google Drive');
    }
  }

  getAccessUrl(ref: string): string {
    // En este caso, 'ref' ya es el webViewLink
    return ref;
  }
}
