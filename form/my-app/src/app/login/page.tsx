"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Basic validation
        if (!email || !password) {
            setMessage("Both fields are required.");
            return;
        }

        try {
            const res = await axios.post("http://localhost:2000/api/v1/login", {
                email,
                password,
            });

            if (res.status === 200) {
                setMessage("Login successful!");
                console.log("Login successful:", res.data);

                localStorage.setItem("authToken", res.data.token);

                router.push("/");
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                // Axios-specific error handling
                if (error.response && error.response.data) {
                    setMessage(error.response.data.message);
                } else {
                    setMessage("An error occurred. Please try again.");
                }
            } else {
                // Generic error handling
                setMessage("Login failed. Please try again.");
            }
            console.error("Error during login:", error);
        }
    };

    const handleReset = () => {
        setEmail("");
        setPassword("");
        setMessage("");
    };

    return (
        <div className="flex justify-center bg-slate-400 h-screen items-center">
            <div className="bg-green-300 p-10 shadow-lg rounded-lg border-spacing-1 border-cyan-200">
                <h1 className="text-white text-2xl text-center mb-5">Login</h1>
                <form onSubmit={handleLogin}>
                    <div className="mb-5">
                        <input
                            className="border border-spacing-0 border-black p-2 text-rose-600 w-full"
                            type="text"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-5">
                        <input
                            className="border border-spacing-0 border-black p-2 text-red-500 w-full"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex justify-between">
                        <button
                            type="submit"
                            className="w-1/2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mr-2"
                        >
                            Submit
                        </button>
                        <button
                            type="button"
                            className="w-1/2 bg-red-500 text-white p-2 rounded hover:bg-red-600 ml-2"
                            onClick={handleReset}
                        >
                            Reset
                        </button>
                    </div>
                </form>
                {message && <p className="text-red-700 text-lg text-center mt-5">{message}</p>}
            </div>
        </div>
    );
};

export default Login;
