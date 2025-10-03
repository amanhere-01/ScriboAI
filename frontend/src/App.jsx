import { useState } from "react";
import Login from "./pages/SignIn";
import Signup from "./pages/SignUp";

export default function App() {
  const [user, setUser] = useState(null);

  return (
    <div className="p-6">
      {!user ? (
        <>
          <h1>Signup</h1>
          <Signup />
          <h1 className="mt-6">Login</h1>
          <Login setUser={setUser} />
        </>
      ) : (
        <div>
          <h1>Welcome, {user.username} 👋</h1>
          <p>Email: {user.email}</p>
        </div>
      )}
    </div>
  );
}