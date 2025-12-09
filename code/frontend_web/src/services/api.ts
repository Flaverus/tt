export interface TemperatureResponse {
  temperature: number;
  status: 'too cold' | 'too warm' | 'just right';
  message: string;
}

export const API_URL = '/api/temperature';

const THRESHOLD = 18; // The LLM will later tell us if it is too warm or too cold. For now, we ise 18 degrees as threshold

/**
 * Fakes an asynchronous call to the backend to get the temperature and status.
 */
export const fetchTemperatureFromBackend = async (): Promise<TemperatureResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const randomTemp = Math.floor(Math.random() * 21) + 10; // Random Temperature between 10 and 30 degrees

      let status: TemperatureResponse['status'];
      let message: string;

      if (randomTemp < THRESHOLD) {
        status = 'too cold';
        message = 'It is too cold, you should turn on the heater.';
      } else if (randomTemp > THRESHOLD) {
        status = 'too warm';
        message = 'It is too warm, you should turn off the heater.';
      } else {
        status = 'just right';
        message = 'Temperature is just right.';
      }

      resolve({
        temperature: randomTemp,
        status: status,
        message: message,
      });
    }, 500);
  });
};