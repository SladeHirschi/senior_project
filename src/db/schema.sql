CREATE TABLE budgets (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    total_budget INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id)
);
CREATE TABLE users (
    id VARCHAR PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT
);
    CREATE TABLE expenses (
    id INTEGER PRIMARY KEY,
    budget_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    amount INTEGER NOT NULL,
    actual_amount INTEGER DEFAULT 0,
    FOREIGN KEY (budget_id) REFERENCES budgets (id)
);
