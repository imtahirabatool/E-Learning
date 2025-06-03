"use client";

import Loader from "@/app/components/Loader/Loader";
import { useLoadUserQuery } from "@/redux/features/api/apiSlice";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";
import CourseContent from "../../components/Course/CourseContent";

const Page = () => {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { isLoading, error, data } = useLoadUserQuery(undefined, {});

  useEffect(() => {
    if (!isLoading && data) {
      const user = data.user;
      console.log("Loaded user:", user);

      if (!user || !Array.isArray(user.course)) {
        console.log("User not logged in or invalid course array");
        router.push("/");
        return;
      }

      const isPurchased = user.course.find((item: any) => item.courseId === id);

      if (!isPurchased || error) {
        console.log("Course not found or error");
        router.push("/");
      }
    }

    if (error) {
      console.log("Query error:", error);
    }
  }, [data, error, id, isLoading, router]);

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div>
          <CourseContent id={id} user={data?.user} />
        </div>
      )}
    </>
  );
};

export default Page;