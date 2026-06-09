"""Unit tests for Task A (Mystic Waves)."""

from solution import total_energy


def test_examples():
    assert total_energy(1, 4) == 0
    assert total_energy(2, 5) == 2
    assert total_energy(3, 6) == 0
    assert total_energy(4, 7) == 4


def test_edge_cases():
    assert total_energy(1, 1) == 1     # single wave -> x
    assert total_energy(10, 2) == 0    # two waves cancel
    assert total_energy(10, 9) == 10   # odd -> x
    assert total_energy(7, 10) == 0    # even -> 0


if __name__ == "__main__":
    test_examples()
    test_edge_cases()
    print("All Task A tests passed.")
