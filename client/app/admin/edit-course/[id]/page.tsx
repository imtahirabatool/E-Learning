"use client";

import AdminSidebar from "@/app/components/Admin/sidebar/AdminSidebar";
import EditCourse from "../../../components/Admin/Course/EditCourse";
import DashboardHeader from "../../../components/Admin/DashboardHeader";
import Headings from "../../../utils/Heading";
import { use } from "react";

type Props = {
  params: Promise<{ id: string }>;
};

const page = ({ params }: any) => {
  const { id } = use(params);

  return (
    <div>
      <Headings
        title="ELearning Admin"
        description="ELearning is a platform for students to learn and get help from teachers"
        keywords="Programming, MERN, Redux,AI/ML"
      />
      <div className="flex min-h-screen">
        <div className="1500px:w-[16%] w-1/5">
          <AdminSidebar />
        </div>
        <div className="w-[85%]">
          <DashboardHeader />
          <EditCourse id={id} />
        </div>
      </div>
    </div>
  );
};

export default page;
