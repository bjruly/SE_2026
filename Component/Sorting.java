package Component;

import java.util.ArrayList;
import java.util.List;

public final class Sorting {
	private Sorting() { }

	public static <T extends Comparable<T>> void sort(List<T> items) {
		for (int index = 1; index < items.size(); index++) {
			T current = items.get(index);
			int position = index - 1;
			while (position >= 0 && items.get(position).compareTo(current) > 0) {
				items.set(position + 1, items.get(position));
				position--;
			}
			items.set(position + 1, current);
		}
	}

	public static <T extends Comparable<T>> List<T> sortedCopy(List<T> items) {
		List<T> copy = new ArrayList<>(items);
		sort(copy);
		return copy;
	}
}
