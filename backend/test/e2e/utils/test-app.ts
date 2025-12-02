import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AppModule } from '../../../src/app.module';

// Tipos base para overrides
type ModelOverride = {
  token: string | symbol;
  useValue: any;
};

export interface CreateTestAppOptions {
  overrides?: ModelOverride[]; // Ej: [{ token: getModelToken(User.name), useValue: mockUserModel }]
  globalPipes?: boolean;       // Aplica ValidationPipe si true
}

// Utilidad: crea la app Nest para E2E con overrides y pipes comunes
export async function createTestApp(options: CreateTestAppOptions = {}): Promise<{
  app: INestApplication;
  module: TestingModule;
}> {
  const moduleBuilder = Test.createTestingModule({ imports: [AppModule] });

  // Aplicar overrides de modelos/servicios si se proveen
  if (options.overrides) {
    for (const o of options.overrides) {
      moduleBuilder.overrideProvider(o.token).useValue(o.useValue);
    }
  }

  const module = await moduleBuilder.compile();
  const app = module.createNestApplication();

  if (options.globalPipes) {
    app.useGlobalPipes(new ValidationPipe());
  }

  await app.init();
  return { app, module };
}

// Helper para crear mocks chainables típicos de Mongoose en e2e
export function chainable<T = any>(result: T) {
  const chain: any = {
    exec: jest.fn().mockResolvedValue(result),
    populate: jest.fn(),
    select: jest.fn(),
  };
  chain.populate.mockImplementation(() => chain);
  chain.select.mockImplementation(() => chain);
  return chain;
}
