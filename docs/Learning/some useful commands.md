Check Battery Health

The simplest way to get battery-related statistics is using the upower command. You can use this utility to list down all the power sources available and manage the overall power management on your system.

To display a list of all the available power sources, type:

upower -e


entry, i.e. battery_BAT0 is the laptop battery.To get detailed information related to this power source, use the -i flag with the command:

upower -i /org/freedesktop/UPower/devices/battery_BAT0

Take a look at the values next to the energy-full and energy-full-design labels. For this laptop, the current energy capacity and the design capacity are the same, which means the battery is in good health. However, if in your case the difference is significant, consider replacing the battery.