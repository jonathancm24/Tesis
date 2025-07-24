// src/mocks/student/messaging.ts
import { delay } from '../utils';

export interface Message {
  id: number;
  from: string;
  to: string;
  content: string;
  timestamp: string;
}

let msgs: Message[] = [];

/** Obtiene los mensajes entre el usuario y otro contacto. */
export async function fetchMessagesMock(withUser: string): Promise<Message[]> {
  await delay();
  return msgs
    .filter(m => m.from === withUser || m.to === withUser)
    .map(m => ({ ...m }));
}

/** Envía un nuevo mensaje. */
export async function sendMessageMock(
  m: Omit<Message, 'id' | 'timestamp'>
): Promise<void> {
  await delay();
  const next = msgs.length ? Math.max(...msgs.map(x => x.id)) + 1 : 1;
  msgs.push({ id: next, ...m, timestamp: new Date().toISOString() });
}
