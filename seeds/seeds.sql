INSERT INTO department (name)
VALUES ("Accounting"),
    ("Human Resource"),
    ("Technology"),
    ("Sales"),
    ("Markeeting"),
    ("Management");

INSERT INTO role ( title, salary, department_id)
VALUES ("Engineer", 60.50, 3), 
    ("Tech Intern", 12.50, 3),
    ("Accountant", 30.45, 1),
    ("HR Representative", 30.45, 2),
    ("Sales Representative", 30.45, 4),
    ("Marketing Representative", 30.45, 5),
    ("CEO", 75.80, 6);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Stephanie", "Cabrera", 1, null),
    ("Jasmine", "Cabrera", 3, 3),
    ("Tyra", "Banks", 7, null),
    ("Alex", "Samuel", 2,  1);