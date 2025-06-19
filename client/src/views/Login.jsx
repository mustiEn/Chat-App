import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error);
    }

    navigate("/@me");
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      <div className="d-flex align-items-center  justify-content-center w-100">
        <div
          id="formBox"
          style={{
            backgroundColor: "#333",
            padding: 20 + "px",
            width: 400 + "px",
            height: "max-content",
            borderRadius: 10 + "px",
            boxShadow: "0 0 10px rgba(0,0,0,0.5)",
          }}
        >
          <h4 className="text-center text-white">Login</h4>
          <form
            className="d-flex flex-column gap-2"
            style={{
              // backgroundColor: "#333",
              padding: "20px",
            }}
            onSubmit={handleSubmit}
          >
            <div className="field-group gap-5 d-flex justify-content-evenly">
              <div className="field-wrapper w-100 d-flex flex-column gap-2">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  name="username"
                  className="form-control"
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleChange(e)}
                  required
                />
              </div>
            </div>
            <div className="field-group gap-5 d-flex justify-content-evenly">
              <div className="field-wrapper w-100 d-flex flex-column gap-2">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  id="password"
                  value={formData.password}
                  onChange={(e) => handleChange(e)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-outline-info mt-3">
              Login
            </button>
          </form>
        </div>
      </div>
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
};

export default Login;
