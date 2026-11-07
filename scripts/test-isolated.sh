#!/usr/bin/env bash
# Run every test file in its own bun process and fail if any file fails.
#
#   scripts/test-isolated.sh [test files...]     (default: tests/*.test.*)
#
# One shared process runs all files, several of which start Chromium. On small CI runners the browsers
# interfere with each other (a browser disappears mid-test), so each file gets a fresh process, which
# releases its browser memory before the next file starts.
set -uo pipefail
cd "$(dirname "$0")/.."

if [ "$#" -gt 0 ]; then FILES=("$@"); else FILES=($(ls tests/*.test.* | sort)); fi

failed=()
for file in "${FILES[@]}"; do
  echo "::group::$file"
  if ! bun test "$file"; then failed+=("$file"); fi
  echo "::endgroup::"
done

echo
echo "Ran ${#FILES[@]} test files."
if [ "${#failed[@]}" -gt 0 ]; then
  echo "Failed files:" >&2
  printf '  %s\n' "${failed[@]}" >&2
  exit 1
fi
echo "All test files passed."
