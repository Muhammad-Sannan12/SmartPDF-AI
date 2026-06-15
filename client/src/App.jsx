import { BrowserRouter, Route, Routes } from "react-router-dom";
import Main from "./components/Main/Main";
import LoginForm from "./components/Login/LoginForm";
import ProtectedRoute from "./routes/ProtectedRoute";
import { Navigate } from "react-router-dom";

const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Main />
              </ProtectedRoute>
            }
          />

          {/* Catch-all: redirect unknown routes to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};
export default App;
