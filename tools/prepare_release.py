"""
Prepare a new release of react-native-bluebreeze.

This is a verifying gate, not just a file-rewriter: it runs the full release preparation
sequence, but checks its own work at each step and stops at the first problem instead of leaving
you to discover it after tagging and pushing.

Unlike the native bluebreeze-android/bluebreeze-ios repos, this package has no assigned-numbers
table to refresh (BBAssignedNumbers lives in, and is generated for, those native SDKs only) and
doesn't follow their copyright-header convention, so this script has no equivalent of their
fetch_assigned_numbers.py/fix_copyright_headers.py steps. What it does add, since this package
ships real native code of its own, is a build check for each platform's bridge module.

Steps:
1. Verifies the git working tree is clean (so unrelated changes don't get swept into the release).
2. Verifies the requested version is valid and newer than every existing tag.
3. bump_version.py  - updates package.json's version.
4. Verifies package.json was actually updated to the requested version.
5. yarn typecheck   - verifies the TypeScript source has no type errors.
6. yarn lint        - verifies the JS/TS source passes lint.
7. yarn test        - verifies the JS unit test suite passes.
8. yarn prepare     - verifies the library builds (commonjs/module/typescript/codegen).
9. Android build    - verifies the Kotlin native module compiles, via the example app.
10. iOS build       - verifies the Swift native module compiles, via the example app.
                      Skipped on non-macOS hosts, since it needs Xcode.

Nothing is committed, tagged, published, or pushed automatically -- this only prepares and
verifies the working tree, and prints the remaining manual steps at the end.

Usage:
    python prepare_release.py <version>

Example:
    python prepare_release.py 1.0.1
"""

import platform
import re
import subprocess
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
TOOLS_DIR = Path(__file__).parent

VERSION_PATTERN = re.compile(r'^\d+\.\d+\.\d+$')


def fail(message: str) -> None:
    print(f"\n✗ {message}")
    sys.exit(1)


def run_script(script_name: str, args: list = None) -> None:
    """Run a Tools script from the project root, failing the release if it doesn't succeed."""
    print(f"\n{'=' * 60}")
    print(f"Running {script_name}...")
    print('=' * 60)

    cmd = [sys.executable, str(TOOLS_DIR / script_name)]
    if args:
        cmd.extend(args)

    result = subprocess.run(cmd, cwd=PROJECT_ROOT)
    if result.returncode != 0:
        fail(f"{script_name} failed with exit code {result.returncode}")

    print(f"✓ {script_name} completed successfully")


def run_command(description: str, cmd: list, cwd: Path = PROJECT_ROOT) -> None:
    """Run a plain shell command, failing the release if it doesn't succeed."""
    print(f"\n{'=' * 60}")
    print(f"{description}...")
    print('=' * 60)

    result = subprocess.run(cmd, cwd=cwd)
    if result.returncode != 0:
        fail(f"{description} failed with exit code {result.returncode}")

    print(f"✓ {description} succeeded")


def check_git_tree_clean() -> None:
    result = subprocess.run(
        ["git", "status", "--porcelain"],
        cwd=PROJECT_ROOT,
        capture_output=True,
        text=True,
        check=True,
    )
    if result.stdout.strip():
        fail(
            "Working tree is not clean. Commit or stash pending changes before preparing a "
            "release -- otherwise they'll get mixed into the release commit.\n\n"
            f"{result.stdout}"
        )


def existing_tags() -> list:
    result = subprocess.run(
        ["git", "tag"],
        cwd=PROJECT_ROOT,
        capture_output=True,
        text=True,
        check=True,
    )
    return [tag for tag in result.stdout.splitlines() if tag.strip()]


def check_version_is_new(version: str) -> None:
    tags = existing_tags()

    if version in tags:
        fail(f"Tag {version} already exists.")

    version_tuple = tuple(int(part) for part in version.split("."))
    for tag in tags:
        if not VERSION_PATTERN.match(tag):
            continue

        if version_tuple <= tuple(int(part) for part in tag.split(".")):
            fail(
                f"Version {version} is not newer than existing tag {tag}. Double-check you "
                "passed the intended version."
            )


def check_package_json_version(version: str) -> None:
    package_json_path = PROJECT_ROOT / "package.json"
    content = package_json_path.read_text(encoding="utf-8")

    if f'"version": "{version}"' not in content:
        fail(f"package.json's version was not updated to {version} as expected.")

    print(f"✓ package.json correctly reflects version {version}")


def main():
    if len(sys.argv) != 2:
        print("Usage: python prepare_release.py <version>")
        print("Example: python prepare_release.py 1.0.1")
        sys.exit(1)

    version = sys.argv[1]

    if not VERSION_PATTERN.match(version):
        fail(f"Invalid version format: {version}. Version should be in format: X.Y.Z (e.g., 1.0.1)")

    print(f"Preparing release version {version}...")

    check_git_tree_clean()
    check_version_is_new(version)

    run_script("bump_version.py", [version])
    check_package_json_version(version)

    run_command("Type-checking", ["yarn", "typecheck"])
    run_command("Linting", ["yarn", "lint"])
    run_command("Running JS unit tests", ["yarn", "test"])
    run_command("Building the JS package", ["yarn", "prepare"])

    run_command(
        "Building the Android native module",
        ["./gradlew", ":react-native-bluebreeze:build"],
        cwd=PROJECT_ROOT / "example" / "android",
    )

    if platform.system() == "Darwin":
        run_command(
            "Installing iOS pods",
            ["pod", "install"],
            cwd=PROJECT_ROOT / "example" / "ios",
        )
        run_command(
            "Building the iOS native module",
            [
                "xcodebuild",
                "-workspace", "BlueBreezeExample.xcworkspace",
                "-scheme", "BlueBreezeExample",
                "-configuration", "Debug",
                "-sdk", "iphonesimulator",
                "-destination", "generic/platform=iOS Simulator",
                "build",
            ],
            cwd=PROJECT_ROOT / "example" / "ios",
        )
    else:
        print(f"\n{'=' * 60}")
        print("Skipping the iOS build -- it requires Xcode, which only runs on macOS.")
        print('=' * 60)

    print(f"\n{'=' * 60}")
    print(f"✓ Release {version} prepared successfully!")
    print("\nNext steps:")
    print("  1. Review changes: git diff")
    print(f"  2. Commit changes: git add . && git commit -m 'Prepare release {version}'")
    print(f"  3. Tag release: git tag {version}")
    print("  4. Publish to npm: yarn npm publish")
    print("  5. Push: git push && git push --tags")
    print('=' * 60)


if __name__ == "__main__":
    main()
