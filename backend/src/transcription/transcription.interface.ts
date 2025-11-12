import { ReadStream } from 'fs';

// El token que usaremos para inyectar el servicio
export const TRANSCRIPTOR_SERVICE = 'ITranscriptor';

// La interfaz que ambos adaptadores (local y cloud) deben implementar
export interface ITranscriptor {
  transcribir(audioInput: ReadStream | string, lang: string): Promise<string>;
}
