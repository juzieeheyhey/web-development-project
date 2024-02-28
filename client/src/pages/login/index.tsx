// Rina Tsegay and Hannah Finn are working on this together on one laptop
"use client";

import React, { useState } from "react";
import { useRouter } from "next/router";
import { Input, Button, Form, Typography, message } from "antd";
import { LoginOutlined, UserAddOutlined } from "@ant-design/icons";
import { ILoginResponse } from "@/common/interfaces";
import { useAuth } from "@/contexts/AuthContext";

const { Title } = Typography;

const Login = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { updateAuthToken, isAuthenticated } = useAuth();

  // used to return to home
  const Home = () => {
    router.push("/");
  };

  // error popup message

  const handleEmailChange = (e: { target: { value: string } }) => {
    // Check if the email field is empty and set the error flag accordingly
    const email = e.target.value;
    const emailError = email === "";
    setEmail(email);
    setEmailError(emailError);
  };

  const handlePasswordChange = (e: { target: { value: any } }) => {
    // Check if the password field is empty and set the error flag accordingly
    const password = e.target.value;
    const passwordError = password === "";
    setPassword(password);
    setPasswordError(passwordError);
  };

  const onLoginClick = async () => {
    const values = { email, password };
    if (email === "" || !email.includes("@") || password === "") {
      message.error("Please fill in all the fields correctly");
    } else {
      console.log("Received values:", values);
      try {
        // URL with your backend endpoint
        const response = await fetch("/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });
        console.log(response.ok);
        if (response.ok) {
          // Email and password are valid
          message.success("Login successful");
          const data: ILoginResponse = await response.json();
          console.log(data);
          if (true) {
            console.log(data.token);
            updateAuthToken(data.token);
            router.push("/protected");
          }
          if (isAuthenticated()) {
            message.success("Login successful");
          }
        } else {
          const errorMessage = await response.text();
          message.error(errorMessage);
        }
      } catch (error) {
        console.log("Error: ", error);
      }
    }
  };

  return (
    <div
      // Page styling
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#eaf7f0",
      }}
    >
      <div
        className="CenteredCard"
        style={{
          textAlign: "center",
          width: "450px",
          padding: "20px",
          borderRadius: "8px",
        }}
      >
        <Form form={form} name="Login">
          <Title> Login </Title>
          <Form.Item
            name="email"
            validateStatus={emailError ? "error" : ""}
            help={emailError ? "Email is required" : null}
            style={{ textAlign: "left" }}
          >
            {"Email Address"}
            <Input placeholder="Email" onChange={handleEmailChange} />
          </Form.Item>
          <Form.Item
            name="password"
            validateStatus={passwordError ? "error" : ""}
            help={passwordError ? "Password is required" : null}
            style={{ textAlign: "left" }}
          >
            {"Password"}
            <Input.Password
              placeholder="Password"
              onChange={handlePasswordChange}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              icon={<LoginOutlined style={{ fontSize: "1em" }} />}
              size="large"
              htmlType="submit"
              // handle click join here
              onClick={onLoginClick}
              style={{
                backgroundColor: "MediumSeaGreen",
                border: "none",
                color: "white",
                width: "250px",
                fontWeight: 600,
              }}
            >
              {" "}
              Login
            </Button>
          </Form.Item>
          <Form.Item>
            <Button // Button to get back to home
              type="link"
              block
              onClick={Home}
              style={{
                color: "MediumSeaGreen",
                fontWeight: 600,
              }}
            >
              Back to Home
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;




