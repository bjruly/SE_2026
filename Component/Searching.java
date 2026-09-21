package Component;

import java.util.List;

public final class Searching {
	private Searching() { }

	public static <T extends Comparable<T>> T binarySearch(List<T> sortedItems, T target) {
		int left = 0;
		int right = sortedItems.size() - 1;
		while (left <= right) {
			int middle = left + (right - left) / 2;
			int comparison = sortedItems.get(middle).compareTo(target);
			if (comparison == 0) {
				return sortedItems.get(middle);
			}
			if (comparison < 0) {
				left = middle + 1;
			} else {
				right = middle - 1;
			}
		}
		return null;
	}
}
