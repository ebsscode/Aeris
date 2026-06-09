"""Unit tests for Task B (CargoCraft Fleet)."""

from solution import fleet_range


def test_examples():
    assert fleet_range(4) == (1, 1)
    assert fleet_range(7) is None
    assert fleet_range(24) == (4, 6)
    assert fleet_range(998244353998244352) == (
        166374058999707392,
        249561088499561088,
    )


def test_small_impossible():
    assert fleet_range(1) is None   # odd
    assert fleet_range(2) is None   # even but cannot be built from 4 and 6
    assert fleet_range(3) is None   # odd


def test_small_possible():
    assert fleet_range(6) == (1, 1)    # one Type B
    assert fleet_range(8) == (2, 2)    # two Type A
    assert fleet_range(10) == (2, 2)   # one A + one B
    assert fleet_range(12) == (2, 3)   # two B, or three A


def test_brute_force_agreement():
    """Cross-check the O(1) formula against a brute-force search."""
    for n in range(1, 2001):
        counts = set()
        b = 0
        while 6 * b <= n:
            rem = n - 6 * b
            if rem % 4 == 0:
                counts.add(rem // 4 + b)
            b += 1
        expected = (min(counts), max(counts)) if counts else None
        assert fleet_range(n) == expected, n


if __name__ == "__main__":
    test_examples()
    test_small_impossible()
    test_small_possible()
    test_brute_force_agreement()
    print("All Task B tests passed.")
