import React from "react";
import "./index.css";
import Cookies from "js-cookie";
import { Link, withRouter, useHistory } from "react-router-dom";

const Header = (props) => {
  const history = useHistory();

  const logOutUser = (props) => {
    Cookies.remove("jwt_token");
    history.replace("/login");
  };

  return (
    <div className="headerSection">
      <h1 className="userGreeting">Smart Reports</h1>
      <ul className="navbar">
        <Link to="/" className="navItem">
          <li>Home</li>
        </Link>
        <Link to="/history" className="navItem">
          <li>My History</li>
        </Link>
        <button className="logoutButton" onClick={logOutUser}>
          Logout
        </button>
      </ul>
    </div>
  );
};

export default withRouter(Header);
