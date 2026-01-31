from dataclasses import dataclass
from math import gcd


@dataclass(frozen=True)
class DevicePreset:
    name: str
    width: int
    height: int
    category: str

    @property
    def resolution_str(self) -> str:
        return f"{self.width}x{self.height}"

    @property
    def aspect_ratio(self) -> tuple[int, int]:
        d = gcd(self.width, self.height)
        return (self.width // d, self.height // d)


# All device presets organized by category
DEVICE_PRESETS: dict[str, list[DevicePreset]] = {
    "Mobile": [
        DevicePreset("iPhone 14 Pro Max", 1290, 2796, "Mobile"),
        DevicePreset("iPhone 14 Pro", 1179, 2556, "Mobile"),
        DevicePreset("iPhone 14", 1170, 2532, "Mobile"),
        DevicePreset("iPhone SE", 750, 1334, "Mobile"),
        DevicePreset("Samsung Galaxy S23 Ultra", 1440, 3088, "Mobile"),
    ],
    "Tablet": [
        DevicePreset("iPad Pro 12.9\"", 2732, 2048, "Tablet"),
        DevicePreset("iPad Pro 11\"", 2388, 1668, "Tablet"),
        DevicePreset("iPad Air", 2360, 1640, "Tablet"),
    ],
    "Laptop/Desktop": [
        DevicePreset("13\" MacBook Pro", 2560, 1600, "Laptop/Desktop"),
        DevicePreset("14\" MacBook Pro", 3024, 1964, "Laptop/Desktop"),
        DevicePreset("16\" MacBook Pro", 3456, 2234, "Laptop/Desktop"),
        DevicePreset("1080p (Full HD)", 1920, 1080, "Laptop/Desktop"),
        DevicePreset("1440p (2K)", 2560, 1440, "Laptop/Desktop"),
        DevicePreset("4K (UHD)", 3840, 2160, "Laptop/Desktop"),
        DevicePreset("5K", 5120, 2880, "Laptop/Desktop"),
        DevicePreset("Dual 1440p", 5120, 1440, "Laptop/Desktop"),
    ],
}


def get_all_presets() -> list[DevicePreset]:
    return [preset for presets in DEVICE_PRESETS.values() for preset in presets]


def get_preset_by_name(name: str) -> DevicePreset | None:
    for preset in get_all_presets():
        if preset.name == name:
            return preset
    return None


def get_preset_display_options() -> list[str]:
    """Return list of display strings for UI dropdowns."""
    options = []
    for category, presets in DEVICE_PRESETS.items():
        for preset in presets:
            options.append(f"{preset.name} ({preset.resolution_str})")
    return options


def parse_preset_display_option(display: str) -> DevicePreset | None:
    """Parse a display string back to a DevicePreset."""
    # Split on the last " (" to handle names containing parentheses (e.g. "4K (UHD)")
    idx = display.rfind(" (")
    name = display[:idx] if idx != -1 else display
    return get_preset_by_name(name)


def validate_resolution(width: int, height: int) -> tuple[bool, str]:
    """Validate a custom resolution. Returns (is_valid, error_message)."""
    if width < 64 or height < 64:
        return False, "Minimum resolution is 64x64"
    if width > 8192 or height > 8192:
        return False, "Maximum resolution is 8192x8192"
    if width % 8 != 0 or height % 8 != 0:
        return False, "Resolution must be divisible by 8"
    return True, ""


def calculate_base_resolution(
    target_width: int, target_height: int, base_size: int = 1024
) -> tuple[int, int]:
    """Calculate optimal base generation resolution matching target aspect ratio.

    Returns a resolution close to base_size that matches the target aspect ratio
    and is divisible by 8.
    """
    aspect = target_width / target_height
    if aspect >= 1:
        base_w = base_size
        base_h = round(base_size / aspect)
    else:
        base_h = base_size
        base_w = round(base_size * aspect)
    # Ensure divisible by 8
    base_w = max(64, (base_w // 8) * 8)
    base_h = max(64, (base_h // 8) * 8)
    return base_w, base_h


def calculate_upscale_factor(
    base_width: int, base_height: int, target_width: int, target_height: int
) -> int:
    """Calculate the minimum integer upscale factor needed."""
    factor_w = target_width / base_width
    factor_h = target_height / base_height
    factor = max(factor_w, factor_h)
    # Round up to next supported factor (2 or 4)
    if factor <= 2:
        return 2
    return 4
