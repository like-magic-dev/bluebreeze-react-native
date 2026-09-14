"""
Update the version number in package.json.

This script updates package.json's top-level "version" field, the single source of truth for
this package's own release version -- separate from android/build.gradle's and
react-native-bluebreeze.podspec's BlueBreeze *dependency* version pins, which track the native
SDKs' own releases and are bumped independently of this package's version.

Usage:
    python bump_version.py <version>

Example:
    python bump_version.py 1.0.1
"""

import re
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
PACKAGE_JSON = PROJECT_ROOT / "package.json"

# Anchored to two-space indentation so this only matches the top-level "version" field --
# package.json also has an unrelated nested "create-react-native-library": { "version": "..." }
# entry (library-generator metadata, not this package's release version) that must not change.
VERSION_PATTERN = re.compile(r'^(  "version": )"[\d.]+"', re.MULTILINE)


def update_package_json_version(version: str) -> bool:
    if not PACKAGE_JSON.exists():
        print(f"✗ package.json not found: {PACKAGE_JSON}")
        return False

    print(f"\n{'=' * 60}")
    print(f"Updating package.json to version {version}...")
    print('=' * 60)

    try:
        content = PACKAGE_JSON.read_text(encoding="utf-8")

        new_content, count = VERSION_PATTERN.subn(rf'\g<1>"{version}"', content)

        if count == 0:
            print('✗ Did not find a top-level "version": "..." field to update')
            return False

        PACKAGE_JSON.write_text(new_content, encoding="utf-8")

        print(f"✓ Updated package.json to version {version}")
        return True

    except Exception as e:
        print(f"✗ Failed to update package.json: {e}")
        return False


def main():
    if len(sys.argv) != 2:
        print("Usage: python bump_version.py <version>")
        print("Example: python bump_version.py 1.0.1")
        sys.exit(1)

    version = sys.argv[1]

    if not re.match(r'^\d+\.\d+\.\d+$', version):
        print(f"✗ Invalid version format: {version}")
        print("Version should be in format: X.Y.Z (e.g., 1.0.1)")
        sys.exit(1)

    if not update_package_json_version(version):
        sys.exit(1)

    print('=' * 60)


if __name__ == "__main__":
    main()
