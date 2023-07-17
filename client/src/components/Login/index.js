import "./index.css";
import { useState } from "react";

import { v4 as uuidv4 } from "uuid";
import { useHistory, Link, Redirect } from "react-router-dom";
import Cookies from "js-cookie";

const Login = (props) => {
  const jwtToken = Cookies.get("jwt_token");
  if (jwtToken !== undefined) {
    <Redirect to="/" />;
  }
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const history = useHistory();

  console.log(history);
  const onSubmitSuccess = (jwtToken) => {
    Cookies.set("jwt_token", jwtToken, { expires: 30, path: "/" });
    console.log("home route");
    history.replace("/", { userData: username });
  };

  const submitLoginDetails = async (e) => {
    e.preventDefault();
    const userDetails = {
      id: uuidv4(),
      username,
      password,
    };
    const apiUrl = "http://localhost:4000/login";
    console.log("clientUser", userDetails);
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userDetails),
    };

    const response = await fetch(apiUrl, options);
    console.log("login", response);
    let data;

    console.log(data);
    if (response.ok) {
      data = await response.json();
      setShowError(false);
      onSubmitSuccess(data.jwtToken);
    } else {
      data = await response.text();
      setUserName("");
      setPassword("");
      setShowError(true);
      setErrorMsg(data);
    }
  };

  return (
    <div className="loginWrapper">
      <div className="loginContainer">
        <h1 className="heading">Login</h1>
        <form onSubmit={submitLoginDetails}>
          <div className="usernameSection">
            <label htmlFor="name">Username</label>
            <input
              onChange={(e) => setUserName(e.target.value)}
              onFocus={() => setShowError(false)}
              value={username}
              type="text"
              id="name"
              placeholder="Enter Username"
              className="nameInput"
              required
            />
          </div>
          <div className="passwordSection">
            <label htmlFor="passkey">Password</label>
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
                onChange={() => setShowPassword((prevState) => !prevState)}
              />
              <label>Show Password</label>
            </div>
          </div>
          <div className="buttonSection">
            <button type="submit" className="buttonElement">
              Login
            </button>
          </div>
        </form>
        {showError && <p className="errorMessage">{errorMsg}</p>}
        <p className="signupSection">
          Don't have an account?
          <a href="/register" className="signupLink">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
