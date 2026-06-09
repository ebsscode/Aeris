"""
A. Mystic Waves
================

Nia casts a spell producing n waves of energy that alternate between
x and -x, starting with x:

    x, -x, x, -x, x, ...

We need the total energy after all n waves.

Observation
-----------
The waves pair up as (x) + (-x) = 0. So every two consecutive waves
cancel out. Therefore:

    * if n is even -> all waves cancel        -> total = 0
    * if n is odd  -> one leftover +x remains -> total = x

This is O(1) per test case (no need to build the sequence).

Input
-----
t                       number of test cases (1 <= t <= 100)
x n  (repeated t times) two integers (1 <= x, n <= 10)

Output
------
For each test case, the total energy on its own line.
"""

import sys


def total_energy(x: int, n: int) -> int:
    """Total energy of n alternating waves starting with +x."""
    return x if n % 2 == 1 else 0


def main() -> None:
    data = sys.stdin.read().split()
    if not data:
        return

    idx = 0
    t = int(data[idx]); idx += 1

    out = []
    for _ in range(t):
        x = int(data[idx]); n = int(data[idx + 1]); idx += 2
        out.append(str(total_energy(x, n)))

    sys.stdout.write("\n".join(out) + "\n")


if __name__ == "__main__":
    main()
