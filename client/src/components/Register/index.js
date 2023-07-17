import React from "react";
import "./index.css";
import { useState, useEffect } from "react";
import { useHistory, Redirect } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import Cookies from "js-cookie";

const Register = (props) => {
  const jwtToken = Cookies.get("jwt_token");
  if (jwtToken !== undefined) {
    <Redirect to="/" />;
  }
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const history = useHistory();

  console.log(history);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const submitUserDetails = async (e) => {
    e.preventDefault();
    const userDetails = {
      id: uuidv4(),
      username,
      email,
      password,
      age,
      gender,
    };
    const apiUrl = "http://localhost:4000/registration";
    console.log("clientUser", userDetails);
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userDetails),
    };

    const response = await fetch(apiUrl, options);
    console.log("register", response);
    const data = await response.text();
    console.log(data);
    if (response.ok) {
      setShowError(false);
      alert("Please login to Continue");
      const { history } = props;
      history.replace("/login");
    } else {
      setUserName("");
      setEmail("");
      setPassword("");
      setAge("");
      setShowError(true);
      setErrorMsg(data);
    }
  };

  return (
    <div className="loginWrapper">
      <div className="loginContainer">
        <h1 className="heading">Register</h1>
        <form onSubmit={submitUserDetails}>
          <div className="usernameSection">
            <label htmlFor="name">Enter Username</label>
            <input
              onChange={(e) => setUserName(e.target.value)}
              value={username}
              type="text"
              id="name"
              placeholder="Enter Username"
              className="nameInput"
              required
            />
          </div>
          <div className="usernameSection">
            <label htmlFor="email">Enter Email</label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="text"
              id="email"
              placeholder="Email"
              className="nameInput"
              required
            />
          </div>
          <div className="additionalDetails">
            <div className="ageSection">
              <label>Age</label>
              <input
                onChange={(e) => setAge(parseInt(e.target.value))}
                value={age}
                type="text"
                className="ageField"
              />
            </div>
            <div className="genderSection">
              <label className="genderTitle">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
          <div className="passwordSection">
            <label htmlFor="passkey">Enter Password</label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type={showPassword ? "text" : "password"}
              id="passkey"
              placeholder="Enter Password"
              className="passwordInput"
              required
            />
            <div className="showPasswordSection">
              <input
                type="checkbox"
                className="passCheckbox"
                onChange={toggleShowPassword}
              />
              <label>Show Password</label>
            </div>
          </div>
          <div className="buttonSection">
            <button type="submit" className="buttonElement">
              Sign up
            </button>
          </div>
        </form>
        {showError && <p className="errorMessage">{errorMsg}</p>}
        <p className="signupSection">
          Already have an account?
          <a href="/login" className="signupLink">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
