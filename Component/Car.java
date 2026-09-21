package Component;

import java.util.Objects;

public final class Car implements Comparable<Car> {
    private final String model;
    private final int year;
    private final double price;

    public Car(String model, int year, double price) {
        if (model == null || model.trim().isEmpty()) {
            throw new IllegalArgumentException("model must not be blank");
        }
        if (year < 1886) {
            throw new IllegalArgumentException("year must be 1886 or later");
        }
        if (price < 0 || Double.isNaN(price)) {
            throw new IllegalArgumentException("price must not be negative");
        }
        this.model = model.trim();
        this.year = year;
        this.price = price;
    }

    public String getModel() {
        return model;
    }

    public int getYear() {
        return year;
    }

    public double getPrice() {
        return price;
    }

    @Override
    public int compareTo(Car other) {
        Objects.requireNonNull(other, "other");
        int byPrice = Double.compare(price, other.price);
        return byPrice != 0 ? byPrice : model.compareToIgnoreCase(other.model);
    }

    @Override
    public String toString() {
        return model + " (" + year + ") - " + price;
    }
}