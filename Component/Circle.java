package Component;

import java.util.Objects;

public final class Circle implements Comparable<Circle> {
    private final double radius;

    public Circle(double radius) {
        if (radius <= 0 || Double.isNaN(radius)) {
            throw new IllegalArgumentException("radius must be greater than zero");
        }
        this.radius = radius;
    }

    public double getRadius() {
        return radius;
    }

    public double getArea() {
        return Math.PI * radius * radius;
    }

    @Override
    public int compareTo(Circle other) {
        Objects.requireNonNull(other, "other");
        return Double.compare(getArea(), other.getArea());
    }

    @Override
    public String toString() {
        return "Circle{radius=" + radius + ", area=" + getArea() + "}";
    }
}