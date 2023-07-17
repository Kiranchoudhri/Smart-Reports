import React from "react";
import "./index.css";

const FormEntity = (props) => {
  const { name, inputName, permValue, onChangeUpdateResult, slNo, value } =
    props;

  const updateResults = (e) => {
    console.log(e.target.name);
    onChangeUpdateResult(e.target.name, e.target.value);
  };

  return (
    <div className="testEntity">
      <p className="serial">{slNo}</p>
      <p className="testName">{name} (mg/dL)</p>
      <p className="testValueContainer">
        <input
          type="text"
          name={inputName}
          className="testValue"
          onChange={updateResults}
          value={value}
          required
        />
      </p>
      <p className="nomalValues">{permValue}</p>
    </div>
  );
};

export default FormEntity;
