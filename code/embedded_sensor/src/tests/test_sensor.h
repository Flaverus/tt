/*
 * Copyright (c) 2025, Michel Kocher
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

#ifndef _TEST_SENSOR_H_
#define _TEST_SENSOR_H_

#ifdef __cplusplus
extern "C" {
#endif

/*!
 * \brief Test the value range of the sensor measurement
 */
void TestSensor_Range_Temperature(void);
void TestSensor_Range_Humidity(void);



#ifdef __cplusplus
}  /* extern "C" */
#endif

#endif /* _TEST_SENSOR_H_ */