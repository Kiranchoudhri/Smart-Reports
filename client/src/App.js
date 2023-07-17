import "./App.css";
import { Redirect, Route, Switch } from "react-router-dom";

import Login from "./components/Login/index";
import Register from "./components/Register/index";
import Home from "./components/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import FileHistory from "./components/FileHistory";
import NotFound from "./components/NotFound";

function App() {
  return (
    <div className="App">
      <Switch>
        <Route exact path="/login" component={Login} />
        <Route exact path="/register" component={Register} />
        <ProtectedRoute exact path="/" component={Home} />
        <ProtectedRoute exact path="/history" component={FileHistory} />
        <Route path="/not-found" component={NotFound} />
        <Redirect to="/not-found" />
      </Switch>
    </div>
  );
}

export default App;
