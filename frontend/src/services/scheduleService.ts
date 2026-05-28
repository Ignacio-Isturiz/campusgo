const DEFAULT_API_URL = 'https://campusgo-jjzy.onrender.com';

interface ClassBlock {
  id: string;
  subject: string;
  color: string;
  day: string;
  startHour: number;
  endHour: number;
}

interface ScheduleData {
  blocks: ClassBlock[];
  message?: string;
}

async function request<T>(path: string, method = 'GET', token?: string, body?: any): Promise<T> {
  const API_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL;
  
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...(body && { body: JSON.stringify(body) }),
  });

  const text = await response.text();
  let data;

  try {
    data = JSON.parse(text);
  } catch (error) {
    throw new Error(`Respuesta inválida del servidor: ${text}`);
  }

  if (!response.ok) {
    throw new Error(data?.message || 'Error en la solicitud');
  }

  return data as T;
}

export function getSchedule(token: string) {
  return request<ScheduleData>('/api/schedule', 'GET', token);
}

export function saveSchedule(blocks: ClassBlock[], token: string) {
  return request<any>('/api/schedule', 'POST', token, { blocks });
}

export function deleteBlock(blockId: string, token: string) {
  return request<any>(`/api/schedule/${blockId}`, 'DELETE', token);
}
