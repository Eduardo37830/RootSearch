import { Test, TestingModule } from '@nestjs/testing';
import { AudioController } from './audio.controller';
import { AudioService } from './audio.service';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as fs from 'fs';

// Mock de fs
jest.mock('fs');

describe('AudioController', () => {
  let controller: AudioController;
  let service: AudioService;

  const mockUser = {
    id: 'user123',
    email: 'test@example.com',
    roles: ['estudiante'],
  };

  const mockFile = {
    fieldname: 'audio',
    originalname: 'test.mp3',
    encoding: '7bit',
    mimetype: 'audio/mpeg',
    size: 1024000,
    path: '/tmp/test.mp3',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AudioController],
      providers: [
        {
          provide: AudioService,
          useValue: {
            transcribeAudio: jest.fn(),
            processAudioFile: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AudioController>(AudioController);
    service = module.get<AudioService>(AudioService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('transcribeAudio', () => {
    it('should successfully transcribe an audio file', async () => {
      const expectedTranscription = 'This is the transcribed text';
      jest
        .spyOn(service, 'transcribeAudio')
        .mockResolvedValue(expectedTranscription);

      // Mock fs.existsSync y fs.unlinkSync
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.unlinkSync as jest.Mock).mockImplementation(() => {});
      (fs.createReadStream as jest.Mock).mockReturnValue({});

      const result = await controller.transcribeAudio(
        mockFile as any,
        mockUser,
      );

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('transcription', expectedTranscription);
      expect(result).toHaveProperty('fileName', 'test.mp3');
      expect(result).toHaveProperty('processingTime');
      expect(service.transcribeAudio).toHaveBeenCalled();
    });

    it('should throw BadRequestException if no file is provided', async () => {
      await expect(
        controller.transcribeAudio(undefined as any, mockUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for unsupported file types', async () => {
      const invalidFile = {
        ...mockFile,
        mimetype: 'video/mp4',
      };

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.unlinkSync as jest.Mock).mockImplementation(() => {});

      await expect(
        controller.transcribeAudio(invalidFile as any, mockUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if file is too large', async () => {
      const largeFile = {
        ...mockFile,
        size: 30 * 1024 * 1024, // 30MB (exceeds 25MB limit)
      };

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.unlinkSync as jest.Mock).mockImplementation(() => {});

      await expect(
        controller.transcribeAudio(largeFile as any, mockUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle errors from AudioService', async () => {
      const serviceError = new Error('Transcription service failed');
      jest.spyOn(service, 'transcribeAudio').mockRejectedValue(serviceError);

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.unlinkSync as jest.Mock).mockImplementation(() => {});
      (fs.createReadStream as jest.Mock).mockReturnValue({});

      await expect(
        controller.transcribeAudio(mockFile as any, mockUser),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should clean up temporary files', async () => {
      jest.spyOn(service, 'transcribeAudio').mockResolvedValue('Transcription');

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      const unlinkSpy = jest.spyOn(fs, 'unlinkSync' as any);
      (fs.createReadStream as jest.Mock).mockReturnValue({});

      await controller.transcribeAudio(mockFile as any, mockUser);

      expect(unlinkSpy).toHaveBeenCalledWith(mockFile.path);
    });
  });

  describe('healthCheck', () => {
    it('should return ok status when LOCAL mode is available', async () => {
      process.env.TRANSCRIPTION_MODE = 'LOCAL';
      process.env.LOCAL_TRANSCRIPTION_ENDPOINT =
        'http://localhost:8000/api/transcribe';

      const result = await controller.healthCheck(mockUser);

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('mode', 'LOCAL');
      expect(result).toHaveProperty('local');
      expect(result).toHaveProperty('cloud');
      expect(result).toHaveProperty('timestamp');
    });

    it('should return ok status when CLOUD mode has API key configured', async () => {
      process.env.TRANSCRIPTION_MODE = 'CLOUD';
      process.env.OPENAI_API_KEY = 'sk-test-key';

      const result = await controller.healthCheck(mockUser);

      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('mode', 'CLOUD');
      expect(result.cloud.available).toBe(true);
    });

    it('should return degraded status when CLOUD mode has no API key', async () => {
      process.env.TRANSCRIPTION_MODE = 'CLOUD';
      process.env.OPENAI_API_KEY = '';

      const result = await controller.healthCheck(mockUser);

      expect(result).toHaveProperty('status', 'degraded');
      expect(result.cloud.available).toBe(false);
    });
  });

  describe('testEndpoint', () => {
    it('should return a test message', async () => {
      const result = await controller.testEndpoint();

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('timestamp');
      expect(result.message).toContain('AudioController');
    });
  });
});
