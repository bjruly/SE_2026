package Component;

import java.util.Objects;

public final class Contact implements Comparable<Contact> {
	private final String name;
	private final String email;
	private final String phone;

	public Contact(String name, String email, String phone) {
		this.name = requireText(name, "name");
		this.email = requireText(email, "email");
		this.phone = requireText(phone, "phone");
	}

	public String getName() { return name; }
	public String getEmail() { return email; }
	public String getPhone() { return phone; }

	@Override
	public int compareTo(Contact other) {
		Objects.requireNonNull(other, "other");
		int byName = name.compareToIgnoreCase(other.name);
		return byName != 0 ? byName : email.compareToIgnoreCase(other.email);
	}

	@Override
	public String toString() {
		return name + " <" + email + "> - " + phone;
	}

	private static String requireText(String value, String fieldName) {
		if (value == null || value.trim().isEmpty()) {
			throw new IllegalArgumentException(fieldName + " must not be blank");
		}
		return value.trim();
	}
}
