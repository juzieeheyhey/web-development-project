import React, { useState } from "react";
import { useRouter } from "next/router";
import { Input, Button, Form, message } from "antd";
import { UserAddOutlined } from "@ant-design/icons";
import { error } from "console";

const Signup = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Perform validation on input
  const validInput = (name: any, email: any, password: any) => {
    // Check if all fields are filled.
    // Check if email are valid.
    // Check if password contains at least 8 characters, an uppercase, a lowercase, and a number.
    if (name === "") {
      message.error("Name is required!");
      return false;
    }
    if (email === "") {
      message.error("Email is required!");
      return false;
    }
    if (!email.includes("@")) {
      message.error("Please input a valid email!");
      return false;
    }
    if (password === "") {
      message.error("Password is required!");
      return false;
    }
    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/\d/.test(password)
    ) {
      message.error(
        "Password must contain at least 8 characters, an uppercase, a lowercase, and a number!"
      );
      return false;
    }
    return true;
  };

  const SignUp = async () => {
    // Perform validation checking, if pass make backend call.
    const values = { name, email, password };
    if (validInput(name, email, password)) {
      console.log("Received values:", values);
      try {
        const response = await fetch("/api/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, password }),
        });
        if (response.ok) {
          console.log("User created successfully");
          message.success("Sign up successfully. Redirect to Login page");
          // =================
          // ADD CODE TO JUST PUSH TO LOGIN PAGE
          // window.location.href = "/login";
          router.push("/login");
        } else {
          const errorMessage = await response.text(); // Get the error message from the response
          message.error(errorMessage);
          console.log(errorMessage);
        }
      } catch (error) {
        console.log("Error: ", error);
      }
    } else {
      console.log("Received invalid inputs.");
    }
  };

  // to return to home
  const Home = () => {
    router.push("/");
  };

  return (
    <div
      // Styling the page
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
        // Styling the Sign up form
        className="CenteredCard"
        style={{
          textAlign: "center",
          width: "450px",
          padding: "20px",
          borderRadius: "8px",
        }}
      >
        <Form form={form} name="Signup">
          <h1>Sign Up</h1>
          <Form.Item
            name="name"
            // validateStatus={nameError ? "error" : ""}
            // help={nameError ? "Name is required" : null}
            style={{ textAlign: "left" }}
          >
            {"Name"}
            <Input
              placeholder="Name"
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Item>

          <Form.Item
            name="email"
            // validateStatus={emailError ? "error" : ""}
            // help={emailError ? "Email is required" : null}
            style={{ textAlign: "left" }}
          >
            {"Email Address"}
            <Input
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Item>

          <Form.Item
            name="password"
            // comments
            style={{ textAlign: "left" }}
          >
            {"Password"}
            <Input.Password
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Item>

          <Form.Item>
            <Button
              icon={<UserAddOutlined />}
              size="large"
              htmlType="submit"
              // handle submit here
              style={{
                backgroundColor: "MediumSeaGreen",
                border: "none",
                color: "white",
                width: "250px",
              }}
              onClick={SignUp}
            >
              {" "}
              Sign up
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

export default Signup;
