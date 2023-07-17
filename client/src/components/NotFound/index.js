import "./index.css";
import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="notFoundContainer">
    <img
      alt="page not found"
      className="notFoundImage"
      src="https://res.cloudinary.com/dcva6xwxy/image/upload/v1672981754/erroring_1_onb1lm.png"
    />
    <h1 className="notFoundTitle">Page Not Found</h1>
    <p className="notFoundDesc">
      we are sorry, the page you requested could not be found. Please go back to
      the homepage
    </p>
    <Link to="/" className="notFoundLink">
      <button type="button" className="homepageBtn">
        Home Page
      </button>
    </Link>
  </div>
);

export default NotFound;
