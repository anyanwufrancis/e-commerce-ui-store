import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./pages/layout";
import Homepage from "./pages/HomePage";
import Products from "./pages/products/event";
import Login from "./pages/login";




function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              < Homepage/>
            </Layout>
          }
        />
        <Route
          path="/products"
          element={
            <Layout>
              <Products/>
            </Layout>
          }
        />
        <Route
          path="/products"
          element={
            <Layout>
              <Login/>
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
