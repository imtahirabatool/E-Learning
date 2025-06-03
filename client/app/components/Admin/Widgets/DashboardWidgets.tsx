import {
  useGetOrdersAnalyticsQuery,
  useGetUserAnalyticsQuery,
} from "@/redux/features/analytics/analyticsApi";
import { Box, CircularProgress } from "@mui/material";
import { FC, useEffect, useState } from "react";
import { BiBorderLeft } from "react-icons/bi";
import { PiUsersFourLight } from "react-icons/pi";
import OrdersAnalytics from "../Analytics/OrderAnalytics";
import UserAnalytics from "../Analytics/UserAnalytics";
import AllInvoices from "../Order/AllInvoices";

type Props = {
  open?: boolean;
  value?: number;
};

const CircularProgressWithLabel: FC<Props> = ({ open, value = 0 }) => {
  // Added default value
  return (
    <Box sx={{ position: "relative", display: "inline-flex" }}>
      <CircularProgress
        variant="determinate"
        value={value}
        size={45}
        color={value > 99 ? "info" : "error"}
        thickness={4}
        style={{ zIndex: open ? -1 : 1 }}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: "absolute",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      ></Box>
    </Box>
  );
};

// Initialize with default values
type CompareData = {
  currentMonth: number;
  previousMonth: number;
  percentChange: number;
};

const DEFAULT_COMPARE_DATA: CompareData = {
  currentMonth: 0,
  previousMonth: 0,
  percentChange: 0,
};

const DashboardWidgets: FC<Props> = ({ open }) => {
  const [ordersComparePercentage, setOrdersComparePercentage] =
    useState<CompareData>(DEFAULT_COMPARE_DATA);
  const [userComparePercentage, setUserComparePercentage] =
    useState<CompareData>(DEFAULT_COMPARE_DATA);

  // 1. Added refetchOnMountOrArgChange to ensure fresh data
  const {
    data: userData,
    isLoading: userLoading,
    isError: userError,
  } = useGetUserAnalyticsQuery({}, { refetchOnMountOrArgChange: true });

  const {
    data: orderData,
    isLoading: orderLoading,
    isError: orderError,
  } = useGetOrdersAnalyticsQuery({}, { refetchOnMountOrArgChange: true });

  useEffect(() => {
    if (userLoading || orderLoading) return;

    // 2. Better data validation
    const userMonths = userData?.users?.last12Months || [];
    const orderMonths = orderData?.orders?.last12Months || [];

    // User analytics calculation
    if (userMonths.length >= 2) {
      const userLastTwo = userMonths.slice(-2);
      const current = userLastTwo[1]?.count || 0;
      const previous = userLastTwo[0]?.count || 0;

      setUserComparePercentage({
        currentMonth: current,
        previousMonth: previous,
        percentChange:
          previous > 0
            ? ((current - previous) / previous) * 100
            : current > 0
            ? 100
            : 0,
      });
    }

    // Orders analytics calculation
    if (orderMonths.length >= 2) {
      const orderLastTwo = orderMonths.slice(-2);
      const current = orderLastTwo[1]?.count || 0;
      const previous = orderLastTwo[0]?.count || 0;

      setOrdersComparePercentage({
        currentMonth: current,
        previousMonth: previous,
        percentChange:
          previous > 0
            ? ((current - previous) / previous) * 100
            : current > 0
            ? 100
            : 0,
      });
    }
  }, [userData, orderData, userLoading, orderLoading]);

  // 3. Show loading state
  if (userLoading || orderLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  // 4. Show error state
  if (userError || orderError) {
    return (
      <div className="h-screen w-full flex items-center justify-center text-red-500">
        Failed to load analytics data
      </div>
    );
  }

  return (
    <div className="mt-[30px] min-h-screen ml-8">
      <div className="grid grid-cols-[75%,25%]">
        <div className="p-8">
          <UserAnalytics isDashboard={true} />
        </div>

        <div className="pt-[80px] pr-8">
          <div className="w-full dark:bg-[#111C43] rounded-sm shadow">
            <div className="flex items-center p-5 justify-between">
              <div>
                <BiBorderLeft className="dark:text-[#45CBA0] text-[#000] text-[30px]" />
                <h5 className="pt-2 font-Poppins dark:text-[#fff] text-black text-[20px]">
                  {ordersComparePercentage.currentMonth}{" "}
                  {/* Removed optional chaining */}
                </h5>
                <h5 className="py-2 font-Poppins dark:text-[#45CBA0] text-black text-[20px] font-[400]">
                  Sales Obtained
                </h5>
              </div>
              <div>
                <CircularProgressWithLabel
                  value={ordersComparePercentage.percentChange > 0 ? 100 : 0}
                  open={open}
                />
                <h5 className="text-center pt-4">
                  {ordersComparePercentage.percentChange > 0
                    ? "+" + ordersComparePercentage.percentChange.toFixed(2)
                    : ordersComparePercentage.percentChange.toFixed(2)}{" "}
                  % {/* Fixed negative sign */}
                </h5>
              </div>
            </div>
          </div>

          <div className="w-full dark:bg-[#111C43] rounded-sm shadow my-8">
            <div className="flex items-center p-5 justify-between">
              <div>
                <PiUsersFourLight className="dark:text-[#45CBA0] text-[#000] text-[30px]" />
                <h5 className="pt-2 font-Poppins dark:text-[#fff] text-black text-[20px]">
                  {userComparePercentage.currentMonth}
                </h5>
                <h5 className="py-2 font-Poppins dark:text-[#45CBA0] text-black text-[20px] font-[400]">
                  New Users
                </h5>
              </div>
              <div>
                <CircularProgressWithLabel
                  value={userComparePercentage.percentChange > 0 ? 100 : 0}
                  open={open}
                />
                <h5 className="text-center pt-4">
                  {userComparePercentage.percentChange > 0
                    ? "+" + userComparePercentage.percentChange.toFixed(2)
                    : userComparePercentage.percentChange.toFixed(2)}{" "}
                  %
                </h5>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[65%,35%] mt-[-20px]">
        <div className="dark:bg-[#111c43] w-[94%] mt-[30px] h-[40vh] shadow-sm m-auto">
          <OrdersAnalytics isDashboard={true} />
        </div>
        <div className="p-5">
          <h5 className="dark:text-[#fff] text-black text-[20px] font-[400] font-Poppins pb-3">
            Recent Transactions
          </h5>
          <AllInvoices isDashboard={true} />
        </div>
      </div>
    </div>
  );
};

export default DashboardWidgets;
