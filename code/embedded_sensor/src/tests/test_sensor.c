/*
 * Copyright (c) 2025, Michel Kocher
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

#include "platform.h"
#if PL_CONFIG_USE_UNIT_TESTS
#include "test_sensor.h"
#include "McuRTOS.h"
#include "sensor.h"
#include "unity/unity.h"

void TestSensor_Range_Temperature(void) {
  float temp = Sensor_GetTemperature();
  TEST_ASSERT_MESSAGE((temp >= -40.0f) && (temp <= 125.0f), "Temperature out of range");
}

void TestSensor_Range_Humidity(void) {
  float humidity = Sensor_GetHumidity();
  TEST_ASSERT_MESSAGE((humidity >= 0.0f) && (humidity <= 100.0f), "Humidity out of range");
}


#endif /* PL_CONFIG_USE_UNIT_TESTS */