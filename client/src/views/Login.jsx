import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useForm } from "@mantine/form";
import {
  Box,
  Button,
  Center,
  Container,
  Flex,
  PasswordInput,
  Space,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import styles from "../css/login.module.css";
import { yupResolver } from "mantine-form-yup-resolver";
import { object, string } from "yup";

const formSchema = object({
  username: string().required("Invalid username"),
  password: string().required("Invalid password"),
});

const Login = () => {
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      username: "",
      password: "",
    },
    validate: yupResolver(formSchema),
  });

  const navigate = useNavigate();
  const handleSubmit = async (values) => {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error);
    }

    navigate("/@me");
  };
  const handleErrors = (errors) => {
    if (errors.username) toast.error("Please fill in your username");
    else if (errors.password) toast.error("Please fill in your password");
  };

  return (
    <>
      <Box className={styles["auth"]} w={"100%"} h={"100%"}>
        <Container
          size={400}
          style={{
            position: "relative",
            top: "8rem",
          }}
        >
          <form onSubmit={form.onSubmit(handleSubmit, handleErrors)}>
            <Stack gap={"xs"} align="stretch">
              <Center>
                <Title order={2}>Login</Title>
              </Center>
              <TextInput
                placeholder="Your username"
                label="Username"
                key={form.key("username")}
                {...form.getInputProps("username")}
              ></TextInput>
              <PasswordInput
                placeholder="Your password"
                label="Password"
                key={form.key("password")}
                {...form.getInputProps("password")}
              ></PasswordInput>
              <Button type="submit" variant="outline">
                Submit
              </Button>
            </Stack>
          </form>
          <Space h={"lg"}></Space>
          <Flex
            bd={"1px solid white"}
            justify={"center"}
            className={styles["form-bottom-line"]}
          >
            <Box
              w={50}
              bg={"rgb(24 16 35)"}
              className={styles["form-bottom-line-content"]}
            >
              <Center>Or</Center>
            </Box>
          </Flex>
          <Space h={"lg"}></Space>
          <Box>
            <Center>
              <Text>New to MyChat?</Text>
              <Link to={"/register"}>
                <Text c={"blue"} td="underline" ml={"sm"}>
                  Create an Account
                </Text>
              </Link>
            </Center>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default Login;
