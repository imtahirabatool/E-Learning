import { styles } from "@/app/styles/style";
import {
  useDeleteCourseMutation,
  useGetAllCoursesQuery,
} from "@/redux/features/courses/coursesApi";
import { Box, Button, Modal } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AiOutlineDelete } from "react-icons/ai";
import { FiEdit2 } from "react-icons/fi";
import { format } from "timeago.js";
import Loader from "../../Loader/Loader";

type Props = object;

const AllCourses = () => {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [courseId, setCourseId] = useState("");
  const [deleteCourse, { isSuccess, error }] = useDeleteCourseMutation();
  const { isLoading, data, refetch, isFetching } = useGetAllCoursesQuery(
    {},
    { refetchOnMountOrArgChange: true }
  );

  useEffect(() => {
    console.log("Courses data:", data);
    console.log("Fetching courses...", isFetching);
  }, [data, isFetching]);
  
  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "title", headerName: "Course Title", flex: 1 },
    { field: "ratings", headerName: "Ratings", flex: 0.5 },
    { field: "purchased", headerName: "Purchased", flex: 0.5 },
    { field: "created_at", headerName: "Created At", flex: 0.5 },
    {
      field: "  ",
      headerName: "Edit",
      flex: 0.2,
      renderCell: (params: any) => {
        return (
          <>
            <Link href={`/admin/edit-course/${params.row.id}`}>
              <FiEdit2 className="dark:text-white text-black mt-4" size={20} />
            </Link>
          </>
        );
      },
    },
    {
      field: " ",
      headerName: "Delete",
      flex: 0.2,
      renderCell: (params: any) => {
        return (
          <>
            <Button
              onClick={() => {
                setOpen(true);
                setCourseId(params.row.id);
              }}
            >
              <AiOutlineDelete
                className="dark:text-white text-black"
                size={20}
              />
            </Button>
          </>
        );
      },
    },
  ];

  const rows = data
    ? data.courses.map((course: any) => ({
        id: course._id,
        title: course.name,
        ratings: course.ratings,
        purchased: course.purchased,
        created_at: format(course.createdAt),
      }))
    : [];

  // useEffect(() => {
  //   if (isSuccess) {
  //     setOpen(false);
  //     refetch();
  //     toast.success("Course deleted successfully");
  //   }
  //   if (error && "data" in error) {
  //     toast.error((error as any).data.message);
  //   }
  // }, [isSuccess, error]);

  const handleDelete = async () => {
    const id = courseId;
    try {
      await deleteCourse(id).unwrap();
      toast.success("Course deleted successfully");
      refetch();
      setOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="mt-[120px]">
      {isLoading ? (
        <Loader />
      ) : (
        <Box m="20px">
          <Box
            m="40px 0 0 0"
            height="80vh"
            sx={{
              "& .MuiDataGrid-root": {
                border: "none",
                outline: "none",
              },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: theme === "dark" ? "#3e4396" : "#A4A9FC",
                color: theme === "dark" ? "#000" : "#000",
                borderBottom: "1px solid rgba(0,0,0,0.1)",
                fontWeight: 600,
              },
              "& .MuiDataGrid-row": {
                color: theme === "dark" ? "#edf2f7" : "#1a202c",
                borderBottom:
                  theme === "dark"
                    ? "1px solid rgba(255,255,255,0.1)"
                    : "1px solid rgba(0,0,0,0.05)",
                transition: "background 0.3s",
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: theme === "dark" ? "#4a5568" : "#f0f4ff",
              },
              "& .MuiDataGrid-cell": {
                borderBottom: "none",
              },
              "& .MuiDataGrid-sortIcon": {
                color: theme === "dark" ? "#cbd5e0" : "#4a5568",
              },
              "& .MuiCheckbox-root": {
                color:
                  theme === "dark"
                    ? "#63b3ed !important"
                    : "#4a5568 !important",
              },
              "& .MuiDataGrid-virtualScroller": {
                backgroundColor: theme === "dark" ? "#1a202c" : "#f9fafb",
              },
              "& .MuiTablePagination-root": {
                color: theme === "dark" ? "#e2e8f0" : "#2d3748",
              },
              "& .MuiDataGrid-footerContainer": {
                color: theme === "dark" ? "#fff" : "#000",
                borderTop: "none",
                backgroundColor: theme === "dark" ? "#3e4396" : "#A4A9FC",
              },
            }}
          >
            <DataGrid checkboxSelection rows={rows} columns={columns} />
          </Box>
          {open && (
            <Modal
              open={open}
              onClose={() => setOpen(!open)}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <Box className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[450px] bg-white dark:bg-slate-900 rounded-[8px] shadow p-4 outline-none">
                <h1 className={`${styles.title}`}>
                  Are you sure you want to delete this course?
                </h1>
                <div className="flex w-full items-center justify-between mb-6 mt-4">
                  <div
                    className={`${styles.button} !w-[120px] h-[30px] bg-[#47d097]`}
                    onClick={() => setOpen(!open)}
                  >
                    Cancel
                  </div>
                  <div
                    className={`${styles.button} !w-[120px] h-[30px] bg-[#d63f3f]`}
                    onClick={handleDelete}
                  >
                    Delete
                  </div>
                </div>
              </Box>
            </Modal>
          )}
        </Box>
      )}
    </div>
  );
};

export default AllCourses;
