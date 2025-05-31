"use client";
import React from "react";
import Heading from "../utils/Heading";
import AdminSidebar from "../components/Admin/sidebar/AdminSidebar";
import AdminProtected from "../hooks/adminProtected";
import DashboardHero from "../components/Admin/DashboardHero";
type Props = {};

const page = (props: Props) => {
  return (
    <AdminProtected>
      <div>
        <Heading
          title="E-Learning - Admin"
          description="ELearning is a platform for students where they can learn and get help from teachers"
          keywords="Programming, MERN, Redux, Machine Learning, AWS"
        />
        <div className="flex h-[200vh]">
          <div className="1500px:w-[15%] w-1/5">
            <AdminSidebar />
          </div>
          <div className="w-[85%]">
            <DashboardHero isDashboard={true}/>
          </div>
        </div>
      </div>
    </AdminProtected>
  );
};

export default page;
