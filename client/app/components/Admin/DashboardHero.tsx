import React, { useState } from "react";
import DashboardHeader from "./DashboardHeader";
import DashboardWidgets from "../../components/Admin/Widgets/DashboardWidgets";

type Props = {
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  isDashboard: boolean;
};

const DashboardHero = ({ isDashboard }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="">
        <DashboardHeader open={open} setOpen={setOpen} />
        {isDashboard && <DashboardWidgets open={open} />}
      </div>
    </div>
  );
};

export default DashboardHero;
