import { styles } from "@/app/styles/style";
import React, { FC } from "react";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import toast from "react-hot-toast";

type Props = {
  benefits: { title: string }[];
  setBenefits: (benefits: { title: string }[]) => void;
  prerequisites: { title: string }[];
  setPrerequisites: (prerequisites: { title: string }[]) => void;
  active: number;
  setActive: (active: number) => void;
};

const CourseData: FC<Props> = ({
  benefits,
  setBenefits,
  prerequisites,
  setPrerequisites,
  active,
  setActive,
}) => {
  const handleBenefitChange = (index: number, value: string) => {
    const updatedBenefits = benefits.map((benefit, i) =>
      i === index ? { ...benefit, title: value } : benefit
    );
    setBenefits(updatedBenefits);
  };

  const handlePrerequisiteChange = (index: number, value: string) => {
    const updatedPrerequisites = prerequisites.map((item, i) =>
      i === index ? { ...item, title: value } : item
    );
    setPrerequisites(updatedPrerequisites);
  };

  const handleAddBenefits = () => {
    setBenefits([...benefits, { title: "" }]);
  };

  const handleAddPrerequisites = () => {
    setPrerequisites([...prerequisites, { title: "" }]);
  };

  const prevButton = () => {
    setActive(active - 1);
  };

  const handleOptions = () => {
    if (
      benefits[benefits.length - 1]?.title !== "" &&
      prerequisites[prerequisites.length - 1]?.title !== ""
    ) {
      setActive(active + 1);
    } else {
      toast.error("Please fill all the fields.");
    }
  };
  return (
    <div className="w-[80%] m-auto mt-24 block dark:text-white text-black">
      <div>
        <label className={`${styles.label} text-[20px]`}>
          What are the benefits for students in this course?
        </label>
        <br />
        {benefits.map((benefits: any, index: number) => (
          <input
            type="text"
            key={index}
            name="Benefits"
            placeholder="You will be able to build a fullstack LMS application.."
            required
            className={`${styles.input} my-2`}
            value={benefits.title || ""}
            onChange={(e) => handleBenefitChange(index, e.target.value)}
          />
        ))}
        <AddCircleIcon
          style={{
            margin: "10px 0",
            cursor: "pointer",
            width: "30px",
            color: "black",
          }}
          onClick={handleAddBenefits}
        />
      </div>
      <div>
        <label className={`${styles.label} text-[20px]`}>
          What are the prerequisites of this course?
        </label>
        <br />
        {prerequisites.map((prerequisites: any, index: number) => (
          <input
            type="text"
            key={index}
            name="prerequisites"
            placeholder="You need basic knowledge of MERN."
            required
            className={`${styles.input} my-2`}
            value={prerequisites.title || ""}
            onChange={(e) => handlePrerequisiteChange(index, e.target.value)}
          />
        ))}
        <AddCircleIcon
          style={{ margin: "10px 0", cursor: "pointer", width: "30px" }}
          onClick={handleAddPrerequisites}
        />
      </div>
      <div className="w-full flex items-center justify-between">
        <div
          className="w-full 800px:w-[180px] flex items-center justify-center h-[40px] bg-[#37a39a] text-center text-[#fff] rounded mt-8 cursor-pointer"
          onClick={() => prevButton()}
        >
          Prev
        </div>
        <div
          className="w-full 800px:w-[180px] flex items-center justify-center h-[40px] bg-[#37a39a] text-center text-[#fff] rounded mt-8 cursor-pointer"
          onClick={() => handleOptions()}
        >
          Next
        </div>
      </div>
    </div>
  );
};

export default CourseData;
