import "./index.css";

const data = [
  { name: "cholestrol", value: 150, range: "50-160" },
  { name: "Triglyceroid", value: 100, range: "50-100" },
];

const TestReport = () => {
  return (
    <div className="pageContainer">
      <div className="header">
        <h1 className="companyName">Smart Reports</h1>
        <div className="contactDetails">
          <p className="contactItem">Phone +91 - 785496645</p>
          <p className="contactItem">contact@abcde.com</p>
          <p className="contactItem">www.asdfg.com</p>
        </div>
      </div>
      <div className="basicInfoSection">
        <div className="userDetails">
          <p className="infoTitle">Name: John</p>
          <p className="infoTitle">Gender: Male</p>
          <p className="infoTitle">Age: 35</p>
        </div>
        <div className="otherDetails">
          <p className="infoTitle">Test Id: AVFETG1255520</p>
          <p className="infoTitle">Date of Test: 13/07/2023</p>
        </div>
      </div>
      <div className="testDescription">
        <h1 className="testName">Lipid Profile</h1>
        <p className="testBrief">
          This profile helps detect imbalance of lipids such as cholestrol,
          triglyceriods, etc. If left untreated, it increase the risk of
          Cardiovascular diseases.
        </p>
      </div>
      <div className="indicators">
        <p className="label normal">Normal</p>
        <p className="label abnormal">Abnormal</p>
        <p className="label borderline">Borderline</p>
      </div>
      {/* <div className="resultsTable">
        <div className="tableHeader">
          <div className="twoSection">
            <p>Test Name</p>
            <p>Result mg/dL</p>
          </div>
          <p className="oneSection">Range</p>
        </div>
        <div>
          {data.map((item, index) => (
            <div key={index} className="tableHeader valueHeader">
              <div className="twoSection">
                <p>{item.name}</p>
                <p>{item.value}</p>
              </div>
              <p className="oneSection">{item.range}</p>
            </div>
          ))}
        </div>
      </div> */}
      <table>
        <tr>
          <th>Test Name</th>
          <th>Result mg/dL</th>
          <th>Normal Range</th>
        </tr>
        {data.map((item, index) => (
          <tr className="valueRow">
            <td>{item.name}</td>
            <td>{item.value}</td>
            <td>
              {item.min}-{item.max}
            </td>
          </tr>
        ))}
      </table>
      <div className="insights">
        <p className="riskTitle">Risk Factors</p>
        <p className="suggestions">
          The individual are suspected to heart disease
        </p>
        <p className="suggestions">High BP over time leads to heart disease</p>
      </div>
    </div>
  );
};

export default TestReport;
