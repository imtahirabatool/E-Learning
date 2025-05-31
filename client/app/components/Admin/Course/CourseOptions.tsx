import React, { FC } from "react";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";

type Props = {
  active: number;
  setActive: (active: number) => void;
};

const CourseOptions: FC<Props> = ({ active, setActive }) => {
  const options = [
    "Course Information",
    "Course Options",
    "Course Content",
    "Course Preview",
  ];

  return (
    <div className="space-y-2">
      {options.map((option, index) => (
        <div
          key={index}
          className="flex items-center gap-2 cursor-pointer w-full"
          onClick={() => setActive(index)}
        >
          <div className="relative flex flex-col items-center">
            <div
              className={`w-[35px] h-[35px] rounded-full flex items-center justify-center ${
                active + 1 > index ? "bg-blue-500" : "bg-gray-600"
              }`}
            >
              <IoMdCheckmarkCircleOutline className="text-white text-[25px]" />
            </div>

            {index !== options.length - 1 && (
              <div
                className={`w-[2px] h-[30px] ${
                  active + 1 > index ? "bg-blue-500" : "bg-gray-600"
                }`}
              />
            )}
          </div>
          <h5
            className={`font-semibold pl-3 text-[20px] ${
              active === index
                ? "text-black dark:text-white"
                : "text-gray-500 dark:text-gray-300"
            }`}
          >
            {option}
          </h5>
        </div>
      ))}
    </div>
  );
};

export default CourseOptions;
