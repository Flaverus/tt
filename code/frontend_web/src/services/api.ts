export interface TemperatureResponse {
  temperature: number;
  status: 'too cold' | 'too warm' | 'just right';
  message: string;
  humidity?: number | null;
  timestamp?: string | null;
  sensorId?: string | null;
}

import { API_BASE_URL } from './config';

export const API_URL = `${API_BASE_URL}/api/temperature`;

const isValidStatus = (status: unknown): status is TemperatureResponse['status'] =>
  status === 'too cold' || status === 'too warm' || status === 'just right';

type RawTemperatureResponse = {
  temperature?: unknown;
  humidity?: unknown;
  timestamp?: unknown;
  sensorId?: unknown;
  status?: unknown;
  message?: unknown;
};

export const fetchTemperatureFromBackend = async (): Promise<TemperatureResponse> => {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error(`Backend responded with status ${response.status}`);
  }

  const payload: RawTemperatureResponse = await response.json();

  const temperature = Number(payload.temperature);
  if (!Number.isFinite(temperature)) {
    throw new Error('Invalid temperature value from backend');
  }

  if (!isValidStatus(payload.status) || typeof payload.message !== 'string') {
    throw new Error('Invalid status value from backend');
  }

  let timestamp: string | null = null;
  if (payload.timestamp) {
    const parsedTimestamp = new Date(payload.timestamp as string);
    timestamp = Number.isNaN(parsedTimestamp.getTime())
      ? null
      : parsedTimestamp.toISOString();
  }

  return {
    temperature,
    humidity: typeof payload.humidity === 'number' ? payload.humidity : null,
    timestamp,
    sensorId: typeof payload.sensorId === 'string' ? payload.sensorId : null,
    status: payload.status,
    message: payload.message,
  };
};
