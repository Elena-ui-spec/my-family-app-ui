import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import AdminDashboard from "./components/AdminDashboard";
import UserDashboard from "./components/UserDashboard";
import ApproveUsers from "./components/ApproveUsers";
import AddMedia from "./components/AddMedia";
import SearchMedia from "./components/SearchMedia";
import { useUser } from "./components/useUser";

function App() {
  const { user, loading } = useUser();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to={user.isAdmin ? "/admin" : "/user"} />
              ) : (
                <Login />
              )
            }
          />
          <Route
            path="/"
            element={
              user ? (
                <Navigate to={user.isAdmin ? "/admin" : "/user"} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path="/register" element={<Register />} />
          <Route
            path="/admin"
            element={
              user && user.isAdmin ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/user"
            element={
              user && !user.isAdmin ? (
                <UserDashboard />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/approve-users"
            element={
              user && user.isAdmin ? <ApproveUsers /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/add-media"
            element={
              user && user.isAdmin ? <AddMedia /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/search-media"
            element={user ? <SearchMedia /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
