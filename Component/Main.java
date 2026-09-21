package Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

public final class Main {
    private Main() {
    }

    public static void main(String[] args) {
        List<Contact> contacts = createContacts();
        List<Car> cars = createCars();
        List<Circle> circles = createCircles();

        try (Scanner scanner = new Scanner(System.in)) {
            boolean running = true;
            while (running) {
                printMenu();
                String choice = scanner.nextLine().trim();
                System.out.println();

                switch (choice) {
                    case "1":
                        System.out.println("Danh ba theo thu tu ten:");
                        Sorting.sortedCopy(contacts).forEach(System.out::println);
                        break;
                    case "2":
                        searchContact(scanner, contacts);
                        break;
                    case "3":
                        System.out.println("Xe theo thu tu gia:");
                        Sorting.sortedCopy(cars).forEach(System.out::println);
                        break;
                    case "4":
                        System.out.println("Hinh tron theo thu tu dien tich:");
                        Sorting.sortedCopy(circles).forEach(System.out::println);
                        break;
                    case "0":
                        running = false;
                        System.out.println("Da thoat chuong trinh.");
                        break;
                    default:
                        System.out.println("Lua chon khong hop le.");
                }
                System.out.println();
            }
        }
    }

    private static void printMenu() {
        System.out.println("===== MENU =====");
        System.out.println("1. Xem danh ba");
        System.out.println("2. Tim Contact");
        System.out.println("3. Xem danh sach Car");
        System.out.println("4. Xem danh sach Circle");
        System.out.println("0. Thoat");
        System.out.print("Chon chuc nang: ");
    }

    private static void searchContact(Scanner scanner, List<Contact> contacts) {
        System.out.print("Nhap ten Contact: ");
        String name = scanner.nextLine().trim();
        System.out.print("Nhap email Contact: ");
        String email = scanner.nextLine().trim();

        Contact target = new Contact(name, email, "unknown");
        Contact result = Searching.binarySearch(Sorting.sortedCopy(contacts), target);
        System.out.println(result == null ? "Khong tim thay Contact." : "Tim thay: " + result);
    }

    private static List<Contact> createContacts() {
        List<Contact> contacts = new ArrayList<>();
        contacts.add(new Contact("Tran An", "an@example.com", "0901000001"));
        contacts.add(new Contact("Nguyen Binh", "binh@example.com", "0901000002"));
        contacts.add(new Contact("Le Chi", "chi@example.com", "0901000003"));
        return contacts;
    }

    private static List<Car> createCars() {
        List<Car> cars = new ArrayList<>();
        cars.add(new Car("Toyota Camry", 2022, 950.0));
        cars.add(new Car("Honda Civic", 2024, 780.0));
        cars.add(new Car("Ford Ranger", 2023, 820.0));
        return cars;
    }

    private static List<Circle> createCircles() {
        List<Circle> circles = new ArrayList<>();
        circles.add(new Circle(5.0));
        circles.add(new Circle(2.0));
        circles.add(new Circle(3.5));
        return circles;
    }
}