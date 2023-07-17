# Smart Reports

This is a web application that generates pdf reports based on test values entered by users.

The test values entered and reports data generated are stored in database.

Users can see the history of their reports generated, can edit them to regenerate reports and delete reports.

It has Login and Register pages

On successfull login user can navigate to Home page and History Page.

## Technologies Used

1. FrontEnd: React.js
2. Backend: Node.js, Express.js
3. Database: SQLite

## Setting up the Server and Database

Server is created using Express.js

A SQLite database with file name **testReports.db** is created

sqlite is used to connect to database

The SQLite provides a command-line tool sqlite3. It allows us to enter and execute SQL statements against an SQLite database.

The SQLite open() method is used to connect the database server and provides a connection object to operate on the database.

```
open({
  filename: DATABASE_PATH,
  driver: SQLITE_DATABASE_DRIVER,
});
```

It returns a promise object. On resolving the promise object, we will get the database connection object.

Below are some methods used to execute SQL queries on a database.

1. all()
2. get()
3. run()

## Server listens to http://localhost:4000 for requests

## Database Design and Schema

The database design consists of 5 Tables.

**users Table**

| Column   |        Type         |     |
| :------- | :-----------------: | --: |
| id       | _VARCHAR(250) (PK)_ |
| username |   _VARCHAR(250)_    |
| email    |   _VARCHAR(250)_    |
| password |   _VARCHAR(250)_    |
| age      |      _INTEGER_      |
| gender   |   _VARCHAR(250)_    |

**category Table**

| Column        |        Type         |     |
| :------------ | :-----------------: | --: |
| id            | _VARCHAR(250) (PK)_ |
| category_name |   _VARCHAR(250)_    |

**attributes Table**

| Column         |        Type         |     |
| :------------- | :-----------------: | --: |
| id             | _VARCHAR(250) (PK)_ |
| attribute_name |   _VARCHAR(250)_    |

**user_reports Table**

| Column      |        Type         |     |
| :---------- | :-----------------: | --: |
| report_id   | _VARCHAR(250) (PK)_ |
| user_id     | _VARCHAR(250) (FK)_ |
| category_id | _VARCHAR(250) (FK)_ |
| test_date   |       _DATE_        |
| file_name   |   _VARCHAR(250)_    |
| file_data   |       _BLOB_        |

**category_attributes Table**

| Column         |        Type         |     |
| :------------- | :-----------------: | --: |
| id             | _VARCHAR(250) (PK)_ |
| category_id    | _VARCHAR(250) (FK)_ |
| attribute_id   | _VARCHAR(250) (FK)_ |
| test_value     |      _INTEGER_      |
| min            |      _INTEGER_      |
| max            |      _INTEGER_      |
| test_report_id | _VARCHAR(250) (FK)_ |

## Sample values of tables already present

**User details present in user table**

```
{
   username: "john",
   email: "john@gmail.com",
   password: "john@123",
   age: 45,
   gender: "Male"
}
```

**category table**
| id | category_name | |
| :------------- | :-----------------: | --: |
| some id | "Lipid" |

**attributes table**
| id | attribute_name | |
| :------------- | :-----------------: | --: |
| some id | "TotalCholestrol" |
| some id | "HDlCholestrol" |
| some id | "VLDL" |
| some id | "LDLCholestrol" |
| some id | "NonHDLCholestrol" |
| some id | "Triglyceroides" |

## APIS

### API-1

#### PATH: /register/

#### METHOD: `POST`

**Request**

```
{
   username: "rahul",
   email: "rahul@gmail.com",
   password: "rahul@123",
   age: 28,
   gender: "Male"
}
```

### API-2

#### PATH: /login/

#### METHOD: `POST`

**Request**

```
{
   username: "john",
   password: "john@123",

}
```

### API-3

#### PATH: /category

#### METHOD: `POST`

**Request**

```
{
   id: "*value*",
   categoryName: "*value*",

}
```

### API-4

#### PATH: /insert-test-results/

#### METHOD: `POST`

#### Updates the database with given details

### API-5

#### PATH: /test-report-pdf/:id

#### METHOD: `GET`

#### Downloads the test_report as pdf

### API-6

#### PATH: /test-record/:id

#### METHOD: `GET`

#### GET the test_report with specific id

### API-7

#### PATH: /update-test-record/:id

#### METHOD: `PUT`

#### Updates the test_report with specific id

### API-8

#### PATH: /reports-history

#### METHOD: `GET`

#### Retrives the data previously generated reports by user

### API-9

#### PATH: /delete-record/:id

#### METHOD: `DELETE`

#### Deletes the record with given id

## Third party packages used

- **bcrypt**: To encrypt passwords
- **jsonwebtoken**: To generate jwt_token and to verify it.
- **html-pdf**: To create pdf from html
- **uuid**: To generate unique ids
- **date-fns**: To create dates
- **react-loader-spinner**: For loading icon
- **react-icons**: For icons
- **js-cookies**: To handle cookies
- **react-router-dom**: For routing in React

### Use 'npm run dev' to start server

### Use {username=john, password= john@123} to login or register and login
