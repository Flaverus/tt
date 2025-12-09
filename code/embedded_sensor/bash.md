``` bash
cmake --preset Test
ctest --verbose --test-dir build/Test -R Led
JRun --verbose --device RP2040_M0_0 --rtt -if SWD --pc off --sp off --ip "192.168.65.254" --args "led" build/Test/TSM_PicoW_Sensor.elf
```