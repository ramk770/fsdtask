"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dept, setDept] = useState("");
  const [empDate, setEmpDate] = useState("");
  const [role, setRole] = useState("");
  const [employId, setEmployId] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate fields on frontend
    if (!name || !employId || !email || !phone || !dept || !empDate || !role || !password) {
      setMessage("All fields are required.");
      return;
    }

    try {
      const res = await axios.post("https://fsdtask-1.onrender.com/api/v1/register", {
        name,
        employId,
        email,
        password,
        phone,
        dept,
        empDate,
        role,
      });

      if (res.status === 201) {
        
        setMessage("Registration successful!");
        router.push("/home");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response && error.response.data) {
          setMessage(error.response.data.message);
        } else {
          setMessage("Registration failed. Please try again.");
        }
      } else {
        setMessage("An unexpected error occurred.");
      }
     
    }
  };

  const handleReset = () => {
    setName("");
    setEmployId("");
    setEmail("");
    setPhone("");
    setDept("");
    setEmpDate("");
    setRole("");
    setPassword("");
    setMessage("");
  };

  return (
    <div className="flex justify-center bg-slate-400 h-screen">
      <div className="bg-green-300 p-10 shadow-lg rounded-lg border-spacing-1 border-cyan-200 w-2/6">
        <h1 className="text-white text-2xl text-center mb-5">Register</h1>
        <form onSubmit={handleRegister}>
          <div className="mb-5">
            <input
              className="border border-spacing-0 border-black p-2 text-rose-600"
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="mb-5">
            <input
              className="border border-spacing-0 border-black p-2 text-red-500"
              type="text"
              placeholder="EmployId"
              value={employId}
              onChange={(e) => setEmployId(e.target.value)}
            />
          </div>
          <div className="mb-5">
            <input
              className="border border-spacing-0 border-black p-2 text-red-500"
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-5">
            <input
              className="border border-spacing-0 border-black p-2 text-red-500"
              type="text"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="mb-5">
            <input
              className="border border-spacing-0 border-black p-2 text-red-500"
              type="text"
              placeholder="Department"
              value={dept}
              onChange={(e) => setDept(e.target.value)}
            />
          </div>
          <div className="mb-5">
            <input
              className="border border-spacing-0 border-black p-2 text-red-600"
              type="date"
              placeholder="Employment Date"
              value={empDate}
              onChange={(e) => setEmpDate(e.target.value)}
            />
          </div>
          <div className="mb-5">
            <input
              className="border border-spacing-0 border-black p-2 text-red-400"
              type="text"
              placeholder="Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>
          <div className="mb-5">
            <input
              className="border border-spacing-0 border-black p-2 text-red-500"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
}
