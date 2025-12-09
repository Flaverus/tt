<script setup lang="ts">
import { ref, computed } from 'vue';
import { fetchTemperatureFromBackend, type TemperatureResponse } from '@/services/api';

const response = ref<TemperatureResponse | null>(null);
const isLoading = ref(false);
const threshold = 18; // Use the same threshold as the faked api to change colors

const statusMessage = computed<string>(() => {
  if (isLoading.value) {
    return 'Fetching data...';
  }
  if (!response.value) {
    return 'Press the button to get the current temperature.';
  }
  return response.value.message;
});

// Get temperature values
const getTemperature = async () => {
  isLoading.value = true;
  response.value = null;

  try {
    const apiResponse = await fetchTemperatureFromBackend();
    response.value = apiResponse;

  } catch (error) {
    // Basic error handling
    response.value = { temperature: NaN, status: 'too cold', message: 'Error fetching temperature.' };
    console.error(error);

  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="temperature-widget">
    <h2>Temperature:
      <span
          v-if="response"
          :class="{ cold: response.temperature < threshold, warm: response.temperature > threshold }"
          data-testid="temperature-value"
      >
        {{ response.temperature }}°C
      </span>
      <span v-else>--°C</span>
    </h2>

    <p data-testid="status-message">
      {{ statusMessage }}
    </p>

    <button @click="getTemperature" :disabled="isLoading" data-testid="fetch-button">
      {{ isLoading ? 'Loading...' : 'Check Temperature' }}
    </button>
  </div>
</template>

<style scoped>

.temperature-widget {
  padding: 1.5rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  max-width: 400px;
  margin: 2rem auto;
  text-align: center;
}

h2 {
  margin-bottom: 1rem;
}

p {
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
}

.cold {
  color: #1e90ff;
  font-weight: bold;
}

.warm {
  color: #ff4500;
  font-weight: bold;
}

button {
  padding: 0.75rem 1.5rem;
  background-color: var(--vt-c-black-soft);
  color: var(--vt-c-white-soft);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover:not(:disabled) {
  background-color: var(--vt-c-indigo);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>