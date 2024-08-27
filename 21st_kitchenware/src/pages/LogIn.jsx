import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from "@nextui-org/react";
import '../firebaseConfig';
import { useNavigate } from "react-router-dom";



const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, redirect to dashboard
        navigate('/dashboard');
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (error) {
      console.log(error);
      setError(error.message);
    }
  };


  return (
    <div className="flex justify-center items-center h-full max-h-[100vh]">
      <Card className="px-4 py-4">
        <CardHeader className="flex items-center justify-center">
          <div>LogIn to Admin Dashboard</div>
        </CardHeader>
        <CardBody className="flex justify-center">
          <div className="flex items-center justify-center ">
            <div className="p-8 space-y-8 rounded-xl shadow-lg flex flex-col gap-4">
              {error && <p className="text-red-500 text-center">{error}</p>}
              <div className="flex flex-col gap-4">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 justify-center w-80">
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="mt-2 p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-6">
                    <label htmlFor="password" className="block text-gray-700">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      className="mt-2 p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit">Login</Button>
                </form>
              </div>
            </div>
          </div>
        </CardBody>

      </Card>
    </div>
  );
};

export default Login;
