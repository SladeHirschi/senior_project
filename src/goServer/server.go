package main

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/gorilla/securecookie"
	"github.com/gorilla/sessions"
	"github.com/mattn/go-sqlite3"
	"golang.org/x/crypto/bcrypt"
)

var store *sessions.CookieStore

func init() {
	authKeyOne := securecookie.GenerateRandomKey(64)
	encryptionKeyOne := securecookie.GenerateRandomKey(32)

	store = sessions.NewCookieStore(
		authKeyOne,
		encryptionKeyOne,
	)
}

type User struct {
	ID        string `json:"id"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Password  string `json:"password"`
	Email     string `json:"email"`
}

type Budget struct {
	ID          int       `json:"id"`
	UserID      string    `json:"userId"`
	Name        string    `json:"name"`
	TotalBudget string    `json:"totalBudget"`
	Expenses    []Expense `json:"expenses"`
}

type Expense struct {
	ID           int    `json:"id"`
	BudgetID     int    `json:"budgetId"`
	Name         string `json:"name"`
	Amount       string `json:"amount"`
	ActualAmount string `json:"actualAmount"`
}

type Login struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type Password struct {
	Password string `json:"password"`
}

type ActualExpense struct {
	Amount    string `json:"amount"`
	ExpenseID int    `json:"expenseId"`
}

type GoogleUser struct {
	ID        string `json:"sub"`
	Email     string `json:"email"`
	FirstName string `json:"given_name"`
	LastName  string `json:"family_name"`
}

var db *sql.DB

func login(w http.ResponseWriter, r *http.Request) {
	session, _ := store.Get(r, "cookie_store")
	var login Login
	var password Password
	err := json.NewDecoder(r.Body).Decode(&login)
	checkErr(err)
	err = db.QueryRow("SELECT password FROM users WHERE email = ?", login.Email).Scan(&password.Password)
	switch {
	case err == sql.ErrNoRows:
		w.WriteHeader(http.StatusUnauthorized)
		w.Write([]byte("Email not found"))
		return
	}
	checkErr(err)

	err = bcrypt.CompareHashAndPassword([]byte(password.Password), []byte(login.Password))
	if err != nil {
		w.WriteHeader(http.StatusForbidden)
		w.Write([]byte("Incorrect Password"))
		return
	}
	var userID int
	err = db.QueryRow("SELECT id FROM users WHERE email = ?", login.Email).Scan(&userID)
	checkErr(err)
	session.Values["authenticated"] = true
	session.Values["UserID"] = userID
	session.Save(r, w)
}

func logout(w http.ResponseWriter, r *http.Request) {
	session, _ := store.Get(r, "cookie_store")
	session.Values["authenticated"] = nil
	session.Values["UserID"] = nil
	session.Options.MaxAge = -1
}

func getUsers(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT * FROM users")
	checkErr(err)
	var users []byte

	defer rows.Close()
	for rows.Next() {
		var user User

		err := rows.Scan(&user.ID, &user.FirstName, &user.LastName, &user.Password, &user.Email)
		checkErr(err)

		fmt.Println("user: ", user)
		jsonBytes, err := json.Marshal(user)
		checkErr(err)
		users = append(users, jsonBytes...)

	}
	w.WriteHeader(http.StatusOK)
	w.Write(users)
}

func createUser(w http.ResponseWriter, r *http.Request) {
	var user User
	var googleUser GoogleUser
	body, err := ioutil.ReadAll(r.Body)
	reader := ioutil.NopCloser(bytes.NewReader(body))
	var v map[string]interface{}
	json.Unmarshal([]byte(body), &v)

	if _, ok := v["sub"]; ok {
		err = json.NewDecoder(reader).Decode(&googleUser)
		checkErr(err)
		checkErr(err)
		var name = ""
		err = db.QueryRow("SELECT first_name FROM users WHERE id = ? ", googleUser.ID).Scan(&name)
		if err != nil {
			name = ""
		}
		if name != "" {
			session, _ := store.Get(r, "cookie_store")
			session.Values["FirstName"] = googleUser.FirstName
			session.Values["UserID"] = googleUser.ID
			session.Save(r, w)
			w.WriteHeader(http.StatusOK)
			w.Write([]byte("AlreadyMade"))
			return
		}
		_, err = db.Exec(`
		INSERT INTO users 
			(id, first_name, last_name, email) 
		VALUES 
			(?, ?, ?, ?)`,
			googleUser.ID, googleUser.FirstName, googleUser.LastName, googleUser.Email)
		if err != nil {
			if sqliteErr, ok := err.(sqlite3.Error); ok {
				if sqliteErr.Code == sqlite3.ErrConstraint {
					fmt.Println("Unique Constraint Failed")
				}
			}
		} else {
			checkErr(err)
			session, _ := store.Get(r, "cookie_store")
			session.Values["FirstName"] = googleUser.FirstName
			session.Values["UserID"] = googleUser.ID
			session.Save(r, w)
			w.WriteHeader(http.StatusCreated)
			w.Write([]byte("Success"))
		}
		return
	}

	checkErr(err)
	if body != nil {
		print("Something")
	}
	err = json.NewDecoder(reader).Decode(&user)
	checkErr(err)
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	checkErr(err)
	result, err := db.Exec(`
		INSERT INTO users 
			(first_name, last_name, email, password) 
		VALUES 
			(?, ?, ?, ?)`,
		user.FirstName, user.LastName, user.Email, hashedPassword)
	if err != nil {
		if sqliteErr, ok := err.(sqlite3.Error); ok {
			if sqliteErr.Code == sqlite3.ErrConstraint {
				fmt.Println("Unique Constraint Failed")
			}
		}
	} else {
		id, err := result.LastInsertId()
		checkErr(err)
		_, err = db.Exec(`
		UPDATE users 
		SET id = ? WHERE rowid = ?`,
			id, id)
		checkErr(err)
		session, _ := store.Get(r, "cookie_store")
		session.Values["FirstName"] = user.FirstName
		session.Values["UserID"] = id
		session.Save(r, w)
		w.WriteHeader(http.StatusCreated)
		w.Write([]byte("Success"))
	}
}

func getBudgets(w http.ResponseWriter, r *http.Request) {
	session, _ := store.Get(r, "cookie_store")
	currentUserId := session.Values["UserID"]
	rows, err := db.Query(`
		SELECT 
			b.id, 
			b.user_id, 
			b.name, 
			b.total_budget
		FROM 
			budgets b
		WHERE user_id = ?`, currentUserId)
	checkErr(err)
	var budgets []Budget

	defer rows.Close()
	for rows.Next() {
		var budget Budget
		var expenses []Expense

		err := rows.Scan(&budget.ID, &budget.UserID, &budget.Name, &budget.TotalBudget)
		checkErr(err)

		rows, err := db.Query(`
			SELECT
				*
			FROM
				expenses
			WHERE budget_id = ?
		`, budget.ID)
		checkErr(err)
		defer rows.Next()
		for rows.Next() {
			var expense Expense
			err = rows.Scan(&expense.ID, &expense.BudgetID, &expense.Name, &expense.Amount, &expense.ActualAmount)
			checkErr(err)
			expenses = append(expenses, expense)
		}

		budget.Expenses = expenses
		checkErr(err)
		budgets = append(budgets, budget)

	}
	toSend, err := json.Marshal(budgets)
	checkErr(err)
	w.WriteHeader(http.StatusOK)
	w.Write(toSend)
}

func createBudget(w http.ResponseWriter, r *http.Request) {
	session, _ := store.Get(r, "cookie_store")
	var budget Budget
	err := json.NewDecoder(r.Body).Decode(&budget)
	checkErr(err)
	currentUserId := session.Values["UserID"]
	result, err := db.Exec(`
		INSERT INTO budgets 
			(user_id, name, total_budget) 
		VALUES 
			(?, ?, ?)`,
		currentUserId, budget.Name, budget.TotalBudget)
	if err != nil {
		if sqliteErr, ok := err.(sqlite3.Error); ok {
			if sqliteErr.Code == sqlite3.ErrConstraint {
				fmt.Println("Constraint Failed")
				w.WriteHeader(http.StatusInternalServerError)
				w.Write([]byte("Failed"))
				return
			}
		}
	}
	id, err := result.LastInsertId()
	for _, expense := range budget.Expenses {
		_, err := db.Exec(`
			INSERT INTO expenses
				(budget_id, name, amount)
			VALUES
				(?, ?, ?)
		`, id, expense.Name, expense.Amount)
		checkErr(err)
	}
	if err != nil {
		checkErr(err)
	} else {
		w.WriteHeader(http.StatusCreated)
		w.Write([]byte("Success"))
	}
}

func postExpenses(w http.ResponseWriter, r *http.Request) {
	var actualExpense ActualExpense
	err := json.NewDecoder(r.Body).Decode(&actualExpense)
	checkErr(err)
	_, err = db.Exec(`
		UPDATE expenses
		SET actual_amount = actual_amount + ?
		WHERE id = ?
		`,
		actualExpense.Amount, actualExpense.ExpenseID)
	checkErr(err)
	if err != nil {
		checkErr(err)
	} else {
		w.WriteHeader(http.StatusCreated)
		w.Write([]byte("Success"))
	}
}

func usersHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == "GET" {
		getUsers(w, r)
	} else if r.Method == "POST" {
		createUser(w, r)
	}
}

func budgetsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == "GET" {
		getBudgets(w, r)
	} else if r.Method == "POST" {
		createBudget(w, r)
	}
}

func expensesHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		postExpenses(w, r)
	}
}

func main() {

	http.HandleFunc("/users", usersHandler)
	http.HandleFunc("/budgets", budgetsHandler)
	http.HandleFunc("/expenses", expensesHandler)
	http.HandleFunc("/login", login)
	http.HandleFunc("/logout", logout)
	http.HandleFunc("/oAuthUsers", logout)
	err := http.ListenAndServe(":8080", nil)
	checkErr(err)
}

func init() {
	var err error
	db, err = sql.Open("sqlite3", "../db/budget.db")
	checkErr(err)
}

func checkErr(err error) {
	if err != nil {
		panic(err)
	}
}
