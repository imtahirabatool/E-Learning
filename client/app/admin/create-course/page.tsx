"use client";
import React from "react";
import CreateCourse from "../../components/Admin/Course/CreateCourse";
import Heading from "@/app/utils/Heading";
import AdminProtected from "@/app/hooks/adminProtected";
import AdminSidebar from "@/app/components/Admin/sidebar/AdminSidebar";
import DashboardHero from "@/app/components/Admin/DashboardHero";
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
          <div className="1500px:w-[16%] w-1/5">
            <AdminSidebar />
          </div>
          <div className="w-[85%]">
            <DashboardHero />
            <CreateCourse />
          </div>
        </div>
      </div>
    </AdminProtected>
  );
};

export default page;
