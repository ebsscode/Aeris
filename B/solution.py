"""
B. CargoCraft Fleet
===================

Each Type A craft has 4 propulsion units, each Type B craft has 6.
Given a total of n propulsion units, find the minimum and maximum number
of crafts (a + b) such that:

    4*a + 6*b = n,   with a >= 0, b >= 0 integers

If no combination works, print -1.

Derivation
----------
Both 4 and 6 are even, so n must be even, otherwise it is impossible.

Let m = n / 2. The equation becomes:

    2*a + 3*b = m

Let k = a + b be the number of crafts. Substituting a = k - b:

    2*(k - b) + 3*b = m  ->  2*k + b = m  ->  b = m - 2*k,  a = 3*k - m

For a valid (a, b):

    a >= 0  ->  3*k >= m  ->  k >= ceil(m / 3)
    b >= 0  ->  m - 2*k >= 0  ->  k <= floor(m / 2)

So the feasible number of crafts is every integer k in the range
[ceil(m/3), floor(m/2)]:

    minimum crafts = ceil(m / 3)
    maximum crafts = floor(m / 2)

If ceil(m/3) > floor(m/2) the range is empty -> impossible.

This is O(1) per test case and uses Python's arbitrary-precision
integers, so n up to 10**18 is handled exactly.

Verification against the sample
-------------------------------
    n = 4   -> m = 2  -> [ceil(2/3), floor(2/2)]   = [1, 1]   -> "1 1"
    n = 7   -> odd                                  -> "-1"
    n = 24  -> m = 12 -> [ceil(12/3), floor(12/2)]  = [4, 6]   -> "4 6"
    n = 998244353998244352 -> "166374058999707392 249561088499561088"
"""

import sys
from typing import Optional, Tuple


def fleet_range(n: int) -> Optional[Tuple[int, int]]:
    """Return (min_crafts, max_crafts) or None if n is impossible."""
    if n % 2 != 0:
        return None

    m = n // 2
    lo = (m + 2) // 3   # ceil(m / 3)
    hi = m // 2         # floor(m / 2)

    if lo > hi:
        return None
    return lo, hi


def main() -> None:
    data = sys.stdin.buffer.read().split()
    if not data:
        return

    idx = 0
    t = int(data[idx]); idx += 1

    out = []
    for _ in range(t):
        n = int(data[idx]); idx += 1
        result = fleet_range(n)
        if result is None:
            out.append("-1")
        else:
            out.append(f"{result[0]} {result[1]}")

    sys.stdout.write("\n".join(out) + "\n")


if __name__ == "__main__":
    main()
