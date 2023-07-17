const express = require("express");
const app = express();
const cors = require("cors");
const { open } = require("sqlite");
app.use(cors());
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { format } = require("date-fns");
const pdf = require("html-pdf");

app.use(express.json());
const PORT = 4000;
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "testReports.db");
let db = null;

const initializeDbServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
  } catch (err) {
    console.log(`DB error: ${err.message}`);
    process.exit(1);
  }
};

initializeDbServer();

// app.get("/create-test", async (req, res) => {
//     const createQuery = `CREATE TABLE user_reports (
//         report_id VARCHAR(250) NOT NULL PRIMARY KEY,
//         user_id VARCHAR(250),
//         category_id VARCHAR(250),
//         test_date DATE,
//         FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
//         FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE
//     )`
//         await db.run(createQuery, (err) => {
//         if (err) {res.status(500).send("Error creating table")}
//         else {
//             console.log("column renamed")
//             res.send("Table successfully created")
//         }
//     })
// })

// list tables

app.get("/list-tables", async (req, res) => {
  const tables = await db.all(
    `SELECT name FROM sqlite_master WHERE type="table"`
  );
  res.send(tables);
});

// User Registration
app.post("/registration", async (req, res) => {
  console.log(req.body);
  const { id, username, email, password, age, gender } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const verifyUsername = await db.get(
    `SELECT * FROM users WHERE username = '${username}'`
  );
  if (verifyUsername !== undefined) {
    res.status(400).send("User Already Exists Please login To Continue");
  } else {
    const postQuery = `INSERT INTO users (id, username, email, password, age, gender)
        VALUES ('${id}', '${username}', '${email}', '${hashedPassword}', '${age}', '${gender}')`;
    const response = await db.run(postQuery);
    const new_user_id = response.lastID;
    res.status(200).send(`user created successfully`);
    `SELECT * FROM users WHERE username= '${username}'`;
  }
});

//User login
app.post("/login", async (req, res) => {
  console.log("server", req.body);
  const { username, password } = req.body;
  const dbUser = await db.get(
    `SELECT * FROM users WHERE username = "${username}"`
  );
  if (dbUser === undefined) {
    res.status(400).send("Invalid User");
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
    if (isPasswordMatched) {
      const payload = { username: username };
      const jwtToken = jwt.sign(payload, "MY_SECRET_TOKEN");
      res.status(200).send({ jwtToken, payload });
    } else {
      res.status(400).send("Invalid Password");
    }
  }
});

// Authentication function
const authenticateToken = (req, res, next) => {
  let jwtToken;
  const authHeader = req.headers["authorization"];
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(" ")[1];
  }

  if (jwtToken === undefined) {
    res.status(401);
    res.send("Invalid JWT Token");
  } else {
    jwt.verify(jwtToken, "MY_SECRET_TOKEN", async (error, payload) => {
      if (error) {
        res.status(401);
        res.send("Invalid JWT Token");
      } else {
        req.username = payload.username;
        next();
      }
    });
  }
};

// POST category
app.post("/category", authenticateToken, async (req, res) => {
  console.log("server", req.body);
  const { id, categoryName } = req.body;
  const categoryQuery = await db.get(
    `SELECT * FROM category WHERE category_name="${categoryName}"`
  );
  if (categoryQuery !== undefined) {
    res.send(`category already exists with id ${categoryQuery.id}`);
  } else {
    await db.run(`INSERT INTO category (id, category_name)
        VALUES ('${id}', '${categoryName}')`);
    res.send("successfullt created category");
  }
});

//POST test details to database
app.post("/insert-test-results", authenticateToken, async (req, res) => {
  const { username } = req;
  console.log(username);
  const { category, reqTestDetails } = req.body;
  try {
    const reqCategoryId = await db.get(
      `SELECT id FROM category WHERE category_name='${category}'`
    );
    console.log("x", reqCategoryId);
    const reqUserId = await db.get(
      `SELECT id FROM users WHERE username='${username}'`
    );
    console.log("y", reqUserId);

    //insert values to user_reports
    const dateString = format(new Date(), "dd-MM-yyyy");
    const newReportId = uuidv4();
    console.log("report_id", newReportId);
    const insertUserReports = `INSERT INTO user_reports (report_id, user_id, category_id, test_date) 
    VALUES("${newReportId}", "${reqUserId.id}", "${reqCategoryId.id}", "${dateString}")`;
    await db.run(insertUserReports);

    for (let data of reqTestDetails) {
      const { id, name, testValue, min, max } = data;
      const checkAttribute = await db.get(
        `SELECT * FROM attributes WHERE attribute_name='${name}'`
      );
      if (checkAttribute === undefined) {
        await db.run(`INSERT INTO attributes (id, attribute_name)
            VALUES ('${id}', '${name}')`);
      }
      const obtainedAttributeId = await db.get(
        `SELECT id FROM attributes WHERE attribute_name='${name}'`
      );
      console.log("z", obtainedAttributeId);
      console.log("zx", obtainedAttributeId.id);
      console.log("cate", newReportId);
      const insertQuertCatAtt = `INSERT INTO category_attributes (id, category_id, attribute_id, 
            test_report_id, test_value, min, max)
            VALUES ("${uuidv4()}", "${reqCategoryId.id}", "${
        obtainedAttributeId.id
      }", "${newReportId}",
            ${testValue}, ${min}, ${max})`;
      await db.run(insertQuertCatAtt);
    }
    res.status(200).json({ newReportId });
  } catch (err) {
    console.log("error in submiting details", err);
    res.status(400).send("error in submitting details");
  }
});

// Generate Pdf and store pdf data in database
app.get("/test-report-pdf/:id", authenticateToken, async (req, res) => {
  const { username } = req;
  const { id } = req.params;

  console.log(id);
  try {
    const numOfRows = await db.all(`SELECT COUNT() as count FROM user_reports`);
    const { count } = numOfRows[0];
    console.log(count);
    if (count < 1) {
      res.status(400).send("No Records Found");
    } else {
      const { test_date } = await db.get(
        `SELECT * FROM user_reports WHERE report_id = "${id}"`
      );
      const { age, gender } = await db.get(
        `SELECT * FROM users WHERE username = "${username}"`
      );
      console.log(username, age, gender);

      const testDetails =
        await db.all(`SELECT attributes.attribute_name, category_attributes.test_value,
        category_attributes.min, category_attributes.max FROM attributes INNER JOIN category_attributes 
        ON attributes.id = category_attributes.attribute_id WHERE category_attributes.test_report_id = "${id}"`);
      console.log(testDetails);

      //generate html
      const html = `<html>
     <head>
       <style> 
       body {
        box-sizing: border-box;
        margin: 0px;
        padding: 0px;
       }

       .pageContainer {
        padding: 20px;
      }
      
      .header {
        display: -webkit-box;
        display:flex;
        -webkit-box-pack: space-between;
        justify-content: space-between
      }

      .companyName {
        font-size: 30px;
        color: #6257b3; 
        margin-right: 340px; 
        padding-left: 6px;
      }
      
      .contactItem {
        margin-bottom: -10px;
        color: #578bb3;
      }
      
      .basicInfoSection {
        display: flex;
        display: -webkit-flex;
        font-size: 14px;
        justify-content: space-between;
        margin-top: 10px;
        padding: 6px;
        border-top: 1px solid #302c33;
        border-bottom: 1px solid #302c33;
      } 

      .userDetails {
        width: 340px;
      }
      
      .infoTitle {
        padding: 4px;
        margin: 0px;
      }
      
      .testDescription {
        margin-top: 10px;
        padding: 6px 10px;
        background-color: #e6e6e6;
        font-size: 14px;
      }
      .testName {
        font-size: 16px;
        margin-bottom: 0px;
      }
      
      .indicators {
        display: flex;
        display: -webkit-flex;
        justify-content: -webkit-flex-end;
        margin-top: 6px; 
        margin-left:500px;
      }
      
      .label {
        margin-right: 10px;
        padding: 6px 10px;
        border-radius: 16px;
        font-size: 12px;
      }
      
      .normal {
        color: #0a632c;
        background-color: #61c788;
      }
      
      .abnormal {
        color: #d14226;
        background-color: #e68f7e;
      }
      
      .borderline {
        color: #cfa723;
        background-color: #edd37e;
      }
      
      .resultsTable {
        margin-top: 6px;
        font-size: 12px;
      }
      
      .tableHeader {
        background-color: #8682ed;
        padding-left: 10px;
        display: -webkit-flex;
        font-size: 16px;
        font-weight: bold;
      }
      
      .twoSection {
        width: 60%;
        display: flex;
        display: -webkit-flex;
        justify-content: space-between;
      }

      .testTitleEntity {
        display: inline-block;
        width: 320px;
      }

      .testTitle {
        display: inline-block;
        width: 340px;
      } 
      .testValue {
        display:inline;
        float:right;
      }
      .oneSection {
        width: 40%;
        text-align: center;
      }
      
      .valueHeader {
        font-size: 14px;
        margin: 8px 0px;
        font-weight: normal;
        background-color: #edebeb;
      }
      
      .insights {
        font-size: 14px;
        margin-top: 0px;
        padding-left: 10px;
      }
      
      .riskTitle {
        color: #cf4b3a;
        font-size: 18px;
        font-weight: bold;
      }
      
      .suggestions {
        margin-top: 6px;
      }
      
       </style>
       <body>
       <div class="pageContainer">
        <div class="header">
         <h1 class="companyName">Smart Reports</h1>
         <div class="contactDetails">
           <p class="contactItem">Phone +91 - 785496645</p>
           <p class="contactItem">contact@abcde.com</p>
           <p class="contactItem">www.asdfg.com</p>
         </div>
       </div>
       <div class="basicInfoSection">
         <div class="userDetails">
           <p class="infoTitle">Name: ${username}</p>
           <p class="infoTitle">Gender: ${gender}</p>
           <p class="infoTitle">Age: ${age}</p>
         </div>
         <div class="otherDetails">
           <p class="infoTitle">Test Id: ${id}</p>
           <p class="infoTitle">Date of Test: ${test_date}</p>
         </div>
       </div>
       <div class="testDescription">
         <h1 class="testName">Lipid Profile</h1>
         <p class="testBrief">
           This profile helps detect imbalance of lipids such as cholestrol,
           triglyceriods, etc. If left untreated, it increase the risk of
           Cardiovascular diseases.
         </p>
       </div>
       <div class="indicators">
         <p class="label normal">Normal</p>
         <p class="label abnormal">Abnormal</p>
         <p class="label borderline">Borderline</p>
       </div>
       <div class="resultsTable">
         <div class="tableHeader">
           <div class="twoSection">
             <p class="testTitleEntity">Test Name</p>
             <p>Result mg/dL</p>
           </div>
           <p class="oneSection">Normal Range</p>
         </div>
         <div>
           ${testDetails.map(
             (item) =>
               `<div key={index} class="tableHeader valueHeader">
               <div class="twoSection">
                 <p class="testTitle">${item.attribute_name}</p>
                 <p class="testValue">${item.test_value}</p>
               </div>
               <p class="oneSection">${item.min}-${item.max}</p>
             </div>`
           )}
         </div>
       </div>
       <div class="insights">
         <p class="riskTitle">Risk Factors</p>
         <p class="suggestions">
           The individual are suspected to heart disease
         </p>
         <p class="suggestions">High BP over time leads to heart disease</p>
       </div>
     </div>
       </body>
     </head>
    </html>`;

      const pdfBuffer = await new Promise((resolve, reject) => {
        pdf.create(html).toBuffer((err, buffer) => {
          if (err) {
            reject(err);
          } else {
            resolve(buffer);
          }
        });
      });

      console.log("buffer", pdfBuffer);
      // Send the generated PDF file to the client
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="example.pdf"'
      );
      res.send(pdfBuffer);

      // Store the PDF file in the SQLite database
      const fileName = `lab_test_report_${id}.pdf`;

      //update into database
      const pdfQuery =
        "UPDATE user_reports SET file_name = ?, file_data = ? WHERE report_id = ?";

      await db.run(pdfQuery, [fileName, pdfBuffer, id]);
    }
  } catch (error) {
    console.log("Error generating pdf", error);
    res.status(500).send("Error generating pdf", error);
  }
});

// get pdf records of user
app.get("/reports-history", authenticateToken, async (req, res) => {
  const { username } = req;
  try {
    const userId = await db.get(
      `SELECT id FROM users WHERE username = "${username}";`
    );
    const recordQuery = await db.all(
      `SELECT * FROM user_reports WHERE user_id = "${userId.id}";`
    );
    const validData = recordQuery.filter(
      (eachData) => eachData.file_data !== null
    );
    const recordsId = validData.map((eachData) => eachData.report_id);

    const reportDataArray = validData.map((bufferData) => bufferData.file_data);

    console.log("blobData", reportDataArray);
    console.log("ids", recordsId);
    const pdfBuffers = reportDataArray.map((bufferData) =>
      Buffer.from(bufferData)
    );
    console.log("modified", pdfBuffers);

    res.status(200).json({ pdfBuffers, recordsId });
  } catch (err) {
    console.log("error while fetching records", err);
    res.status(500).send("Error While fetching test report records");
  }
});

// update api
//1. first get record of thet doc
app.get("/test-record/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  console.log(id);
  try {
    const foundRecord =
      await db.all(`SELECT attributes.attribute_name, category_attributes.test_value
    FROM attributes INNER JOIN category_attributes ON attributes.id = category_attributes.attribute_id 
    WHERE category_attributes.test_report_id = "${id}"`);
    res.status(200).send(foundRecord);
  } catch (err) {
    console.log("cant get results", err);
    res.status(400).send("cant get the test details");
  }
});

//2. update record
app.put("/update-test-record/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  console.log(id);
  console.log(req.body);
  const { editedTestValues } = req.body;
  console.log(editedTestValues);
  try {
    for (let [key, value] of Object.entries(editedTestValues)) {
      console.log(key, value);
      const updatedValue = parseInt(value);
      const obtainedAttributeId = await db.get(
        `SELECT id FROM attributes WHERE attribute_name = "${key}"`
      );
      console.log(obtainedAttributeId);
      await db.run(`UPDATE category_attributes SET test_value = ${updatedValue} WHERE 
      attribute_id = "${obtainedAttributeId.id}" AND test_report_id = "${id}"`);
    }
    res.status(200).send("Your Values are updated successfully");
  } catch (err) {
    res.status(400).send("error updating your values");
  }
});

// delete record
app.delete("/delete-record/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  console.log(id);
  try {
    await db.run(`DELETE FROM user_reports WHERE report_id = "${id}"`);
    res.status(200).send("Record deleted successfully");
  } catch (err) {
    console.log("cant delete record", err);
    res.status(401).send("Unable to delete record");
  }
});

// Additional apis to get table data

// GET users
app.get("/users", async (req, res) => {
  const response = await db.all(`SELECT * FROM users`);
  res.send(response);
});

//GET categories
app.get("/category", async (req, res) => {
  result = await db.all(`SELECT * FROM category`);
  res.send(result);
});

//GET attributes
app.get("/attributes", async (req, res) => {
  result = await db.all(`SELECT * FROM attributes`);
  res.send(result);
});

//GET test results from category_attributes table
app.get("/test-values", async (req, res) => {
  const results = await db.all(`SELECT * FROM category_attributes`);
  res.send(results);
});

//GET test report details from user_reports table
app.get("/user-reports", async (req, res) => {
  const results = await db.all(`SELECT * FROM user_reports`);
  res.send(results);
});

// DELETE all values from category_attributes table and user_report table
// app.delete("/delete-testValues", async (req, res) => {
//   await db.run(`DELETE FROM category_attributes`);
//   await db.run(`DELETE FROM user_reports`);
//   // await db.run(`DELETE FROM users`);
//   res.send("all entries deleted");
//   res.end();
// });

//create Tables

//create table users
// app.get("/create-users", async (req, res) => {
//   try {
//     await db.run(`CREATE TABLE users(
//       id VARCHAR(250) NOT NULL PRIMARY KEY,
//       username VARCHAR(250),
//       email VARCHAR(250),
//       password VARCHAR(250),
//       age INT,
//       gender VARCHAR(250)
//     )`);
//     res.status(201).send("Table created successfully");
//   } catch (err) {
//     console.log("Error in creating table", err);
//     res.status(400).send("Error in creating table");
//   }
// });

//create category table
// app.get("/create-category", async (req, res) => {
//   await db.run(`CREATE TABLE category(
//     id VARCHAR(250) NOT NULL PRIMARY KEY,
//     category_name VARCHAR(250),
//   )`);
// });

// //create attributes table
// app.get("/create-attributes", async (req, res) => {
//   await db.run(`CREATE TABLE attributes(
//     id VARCHAR(250) NOT NULL PRIMARY KEY,
//     attribute_name VARCHAR(250),
//   )`);
// });

// //create table category_attributes
// app.get("/create-category-attributes", async (req, res) => {
//   await db.run(`CREATE TABLE category_attributes(
//         id VARCHAR(250) NOT NULL PRIMARY KEY,
//         category_id VARCHAR(250),
//         attribute_id VARCHAR(250),
//         test_report_id VARCHAR(250),
//         test_value INT,
//         min INT,
//         max INT,
//         FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE,
//         FOREIGN KEY (attribute_id) REFERENCES attributes(id) ON DELETE CASCADE,
//         FOREIGN KEY (test_report_id) REFERENCES user_reports(report_id) ON DELETE CASCADE
//     )`);
//   res.send("created table");
// });

// // create user_reports table
// app.get("/create-user-reports", async (req, res) => {
//   await db.run(`CREATE TABLE user_reports(
//         report_id VARCHAR(250) NOT NULL PRIMARY KEY,
//         user_id VARCHAR(250),
//         category_id VARCHAR(250),
//         test_date DATE,
//         file_name VARCHAR(250),
//         file_data BLOB
//         FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
//         FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE,
//     )`);
//   res.send("created table");
// });
