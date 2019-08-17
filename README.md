# ![](https://raw.githubusercontent.com/hoobs-org/HOOBS/master/docs/logo.png)

## Google Home Integration for HOOBS

Control your supported HOOBS accessories from any Google Home speaker or the Google Home mobile app.

## Supported Device Types

* Switch
* Outlet
* Light Bulb
    * On / Off
    * Brightness
    * Color (Hue/Saturation)
* Fan (On / Off)
* Window
* Window Coverings
* Door
* Garage Door
* Thermostat
* Lock Mechanism

*Note: Google Smart Home does not currently support "sensor" devices such as Temperature Sensors, Motion Sensors, Occupancy Sensors etc.*

## Known Issues

1. Only one HOOBS instance can be linked to an account (even across different local networks). You will experience unintended results if you try and link more than one instance to the same account.

## Credits

* [OZNU](https://github.com/oznu) - developer of the [homebridge-gsh](https://github.com/oznu/homebridge-gsh).
* [NorthernMan54](https://github.com/NorthernMan54) - developer of the [Hap-Node-Client](https://github.com/NorthernMan54/Hap-Node-Client) module which is used by this plugin.
