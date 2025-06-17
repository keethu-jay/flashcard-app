import './App.css';
import './index.css';
import Home from "./routes/Home";
import Dashboard from "./routes/Dashboard";
import GenerationInput from "./routes/GenerationInput";
import EditCards from "./routes/EditCards";
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
    path: "/generation-input",
    element: <GenerationInput />,
  },
  {
    path: "/edit-cards",
    element: <EditCards />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
