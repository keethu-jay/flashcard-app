import './App.css';
import Home from "./routes/Home";
import Dashboard from "./routes/Dashboard";
import Library from "./routes/Library";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/library",
    element: <Library />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
