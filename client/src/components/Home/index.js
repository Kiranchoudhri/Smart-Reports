import React from "react";
import "./index.css";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useLocation } from "react-router-dom";
import Header from "../Header/index";
import LipidForm from "../LipidForm";
import Cookies from "js-cookie";

const categoryButtons = ["Lipid", "Diabetes", "Kidney"];

const Home = (props) => {
  const [chosenCategory, setChosenCategory] = useState(categoryButtons[0]);

  const location = useLocation();

  console.log("location", location);
  const editFormData = location.state && location.state.obtainedFormData;
  const updateId = location.state && location.state.fileId;
  console.log(editFormData);

  const getCategoryId = async () => {
    const categoryDetails = {
      id: uuidv4(),
      categoryName: chosenCategory,
    };
    const apiUrl = "http://localhost:4000/category";
    console.log("clientUser", categoryDetails);
    const jwtToken = Cookies.get("jwt_token");
    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(categoryDetails),
    };
    try {
      const response = await fetch(apiUrl, options);
      const data = await response.text();
      console.log(data);
    } catch (err) {
      console.log("Error posting category", err);
    }
  };

  useEffect(() => {
    getCategoryId();
  }, [chosenCategory]);

  console.log("categoryid", chosenCategory);
  return (
    <div>
      <Header />
      <div className="homeContainer">
        <p className="homeTitle1">Generate lab test reports the smarter way</p>
        <p className="homeTitle2">Generate yout test report now</p>
        <div className="reportCategories">
          {categoryButtons.map((value, index) => (
            <button
              onClick={() => setChosenCategory(categoryButtons[index])}
              key={index}
              className={
                chosenCategory === value
                  ? "activeButton reportButton"
                  : "reportButton"
              }
            >
              {value}
            </button>
          ))}
        </div>
        <LipidForm
          chosenCategory={chosenCategory}
          editFormData={editFormData}
          updateId={updateId}
        />
      </div>
    </div>
  );
};

export default Home;
