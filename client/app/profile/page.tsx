"use client";
import React, { FC, useState } from "react";
import Protected from "../hooks/useProtected";
import Header from "../components/Header";
import Headings from "../utils/Heading";
import Profile from "../components/Profile/Profile";
import { useSelector } from "react-redux";
import Footer from "../components/Footer/Footer";

type Props = object;

const Page: FC<Props> = () => {
  const [open, setOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(5);
  const [route, setRoute] = useState("Login");
  const { user } = useSelector((state: any) => state.auth);

  return (
    <div>
      <Protected>
        <Headings
          title={`${user?.name}'s Profile - ELearning`}
          description="ELearning is a platform for students to learn and get help from teachers"
          keywords="Programming, MERN, Typescript, Redux"
        />
        <Header
          open={open}
          setOpen={setOpen}
          activeItem={activeItem}
          setRoute={setRoute}
          route={route}
        />
        <Profile user={user} />
        <Footer />
      </Protected>
    </div>
  );
};

export default Page;
