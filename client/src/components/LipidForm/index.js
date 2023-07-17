import React from "react";
import "./index.css";
import Cookies from "js-cookie";
import FormEntity from "../FormEntity";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

const limitingValues = {
  TotalCholestrol: { min: 50, max: 200 },
  HDLCholestrol: { min: 40, max: 60 },
  VLDL: { min: 2, max: 30 },
  LDLCholestrol: { min: 0, max: 100 },
  NonHDLCholestrol: { min: 0, max: 130 },
  Triglyceroides: { min: 50, max: 150 },
};

const initialState = {
  TotalCholestrol: "",
  HDLCholestrol: "",
  VLDL: "",
  LDLCholestrol: "",
  NonHDLCholestrol: "",
  Triglyceroides: "",
};

const LipidForm = (props) => {
  const [testResults, setTestResults] = useState({
    TotalCholestrol: "",
    HDLCholestrol: "",
    VLDL: "",
    LDLCholestrol: "",
    NonHDLCholestrol: "",
    Triglyceroides: "",
  });
  const [pdfData, setPdfData] = useState(null);
  const [testId, setTestId] = useState(null);
  const [isUpdate, setIsUpdate] = useState(false);

  const { chosenCategory, editFormData, updateId } = props;
  console.log("update", editFormData);

  const onChangeUpdateResult = (name, value) => {
    setTestResults({ ...testResults, [name]: value });
  };

  console.log("state", testResults);

  const obtainReqValues = () => {
    const resultsArray = [];
    for (let [key, value] of Object.entries(testResults)) {
      resultsArray.push({
        id: uuidv4(),
        name: key,
        testValue: parseInt(value),
        ...limitingValues[key],
      });
    }
    console.log(resultsArray);
    return resultsArray;
  };

  const generatePdf = async () => {
    try {
      const apiUrl2 = `http://localhost:4000/test-report-pdf/${testId}`;
      const jwtToken = Cookies.get("jwt_token");
      const options = {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
        method: "GET",
      };
      const response = await fetch(apiUrl2, options);
      console.log(response);
      const data = await response.blob();
      console.log("blob", data);
      const pdfUrl = URL.createObjectURL(data);
      console.log("pdf data", pdfUrl);
      setPdfData(pdfUrl);
    } catch (err) {
      console.log("error_msg", err);
      alert(`Error generating pdf ${err}`);
    }
  };

  console.log("formPdf", pdfData);

  const submitTestDetails = async (e) => {
    e.preventDefault();
    const reqTestDetails = obtainReqValues();
    console.log(reqTestDetails);
    const reqUrlBody = {
      category: chosenCategory,
      reqTestDetails,
    };
    console.log(JSON.stringify(reqUrlBody));
    const jwtToken = Cookies.get("jwt_token");
    const apiUrl = "http://localhost:4000/insert-test-results";
    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reqUrlBody),
    };
    const response = await fetch(apiUrl, options);
    setTestResults(initialState);
    console.log(response);
    const data = await response.json();
    console.log(data);
    if (response.ok) {
      console.log("submit", data);
      const { newReportId } = data;
      setTestId(newReportId);
      alert(
        "Details submitted successfully click Download Button to download file"
      );
    } else {
      console.log("error in submitting details");
      alert(`Error in submitting details`);
    }
  };

  const updateDatabase = async () => {
    const apiUrl = `http://localhost:4000/update-test-record/${updateId}`;
    const jwtToken = Cookies.get("jwt_token");

    const options = {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ editedTestValues: testResults }),
    };
    const response = await fetch(apiUrl, options);
    console.log(response);
    setTestResults(initialState);
    const data = await response.text();
    alert(data);
    setTestId(updateId);
  };

  useEffect(() => {
    if (editFormData) {
      setTestResults(editFormData);
      setIsUpdate(true);
    } else {
      setIsUpdate(false);
    }
  }, []);

  const openNewWindow = () => {
    const newWindow = window.open("", "_blank");
    const iframeContent = `<iframe src=${pdfData} width="100%" height="100%"></iframe>`;
    newWindow.document.write(iframeContent);
  };

  return (
    <div>
      <form className="userTestForm" onSubmit={submitTestDetails}>
        <div className="tableHeaders">
          <p className="serialNum">Sl No.</p>
          <p className="testTitle">Description</p>
          <p className="valueTitle">Actual value</p>
          <p className="normalRange">Normal Range</p>
        </div>

        <FormEntity
          slNo={1}
          name="Total Cholestrol"
          inputName="TotalCholestrol"
          permValue="50-200"
          onChangeUpdateResult={onChangeUpdateResult}
          value={testResults.TotalCholestrol}
        />
        <FormEntity
          slNo={2}
          name="HDL Cholestrol"
          inputName="HDLCholestrol"
          permValue="40-60"
          onChangeUpdateResult={onChangeUpdateResult}
          value={testResults.HDLCholestrol}
        />
        <FormEntity
          slNo={3}
          name="VLDL"
          inputName="VLDL"
          permValue="2-30"
          onChangeUpdateResult={onChangeUpdateResult}
          value={testResults.VLDL}
        />
        <FormEntity
          slNo={4}
          name="LDL Cholestrol"
          inputName="LDLCholestrol"
          permValue="&lt;100"
          onChangeUpdateResult={onChangeUpdateResult}
          value={testResults.LDLCholestrol}
        />
        <FormEntity
          slNo={5}
          name="Non-HDL Cholestrol"
          inputName="NonHDLCholestrol"
          permValue="&lt;130"
          onChangeUpdateResult={onChangeUpdateResult}
          value={testResults.NonHDLCholestrol}
        />
        <FormEntity
          slNo={6}
          name="Triglyceroides"
          inputName="Triglyceroides"
          permValue="50-150"
          onChangeUpdateResult={onChangeUpdateResult}
          value={testResults.Triglyceroides}
        />
        <div className="formBtnContainer">
          {!isUpdate ? (
            <button type="submit" className="formButton">
              Generte Report
            </button>
          ) : (
            <button
              type="button"
              className="formButton"
              onClick={updateDatabase}
            >
              Update Details
            </button>
          )}
        </div>
      </form>
      <div className="downloadBtnContainer">
        <button className="formButton" onClick={generatePdf}>
          Download
        </button>
      </div>

      {pdfData && openNewWindow()}
    </div>
  );
};

export default LipidForm;
