const { mount } = require('@vue/test-utils');
const sinon = require('sinon');
const TemperatureWidget = require('@/components/TemperatureWidget.vue').default;
const apiService = require('@/services/api');

// Tell Jest to mock the entire API service module
jest.mock('@/services/api', () => ({
  fetchTemperatureFromBackend: jest.fn(), // This mock function will be stubbed by Sinon
  API_URL: '/api/temperature'
}));

describe('TemperatureWidget Unit Tests (Jest + Sinon)', () => {
  let fetchStub;

  beforeEach(() => {
    // Use Sinon to stub the mock function created by Jest.
    fetchStub = sinon.stub(apiService, 'fetchTemperatureFromBackend');
  });

  afterEach(() => {
    // Restore the original stub/mock
    fetchStub.restore();
  });

  const COLD_RESPONSE = {
    temperature: 18,
    status: 'too cold',
    message: 'It is too cold, you should turn on the heater.',
  };

  const WARM_RESPONSE = {
    temperature: 25,
    status: 'too warm',
    message: 'It is too warm, you should turn off the heater.',
  };


  // Test Low temperature logic (Heater ON)
  it('should display the cold status message after a fetch', async () => {
    // Configure Sinon stub to return the cold mock data
    fetchStub.resolves(COLD_RESPONSE);

    const wrapper = mount(TemperatureWidget);
    const fetchButton = wrapper.find('[data-testid="fetch-button"]');

    // Action: Click the button
    await fetchButton.trigger('click');

    // Wait for the async component update
    await wrapper.vm.$nextTick();

    // Assertion: Verify the correct cold data is displayed
    expect(fetchStub.calledOnce).toBe(true);
    expect(wrapper.find('[data-testid="temperature-value"]').text()).toContain('18°C');
    expect(wrapper.find('[data-testid="status-message"]').text()).toBe(COLD_RESPONSE.message);
  });

  // Test High temperature logic (Heater OFF)
  it('should display the warm status message after a fetch', async () => {
    // Configure Sinon stub to return the warm mock data
    fetchStub.resolves(WARM_RESPONSE);

    const wrapper = mount(TemperatureWidget);
    const fetchButton = wrapper.find('[data-testid="fetch-button"]');

    // Action: Click the button
    await fetchButton.trigger('click');

    // Wait for the async component update
    await wrapper.vm.$nextTick();

    // Assertion: Verify the correct warm data is displayed
    expect(fetchStub.calledOnce).toBe(true);
    expect(wrapper.find('[data-testid="temperature-value"]').text()).toContain('25°C');
    expect(wrapper.find('[data-testid="status-message"]').text()).toBe(WARM_RESPONSE.message);
  });
});