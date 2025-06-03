import { styles } from "@/app/styles/style";
import {
  useDeleteUserMutation,
  useGetAllUsersQuery,
  useUpdateUserRoleMutation,
} from "@/redux/features/user/userApi";
import { Box, Button, Modal } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "next-themes";
import { FC, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AiOutlineDelete, AiOutlineMail } from "react-icons/ai";
import { format } from "timeago.js";
import Loader from "../../Loader/Loader";

type Props = {
  isTeam: boolean;
};

const AllUsers: FC<Props> = ({ isTeam }) => {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(false);
  const [courseId, setCourseId] = useState("");
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("admin");
  const { isLoading, data, refetch } = useGetAllUsersQuery(
    {},
    { refetchOnMountOrArgChange: true }
  );
  const [updateUserRole, { error: updateUserRoleError, isSuccess }] =
    useUpdateUserRoleMutation();
  const [deleteUser, { error: deleteUserError, isSuccess: deleteSuccess }] =
    useDeleteUserMutation();

  useEffect(() => {
    if (updateUserRoleError) {
      if ("data" in updateUserRoleError) {
        const errorData = updateUserRoleError as any;
        toast.error(errorData.data.message);
      }
    }

    if (isSuccess) {
      refetch();
      toast.success("User role updated successfully");
      setActive(false);
    }

    if (deleteSuccess) {
      refetch();
      toast.success("User deleted successfully");
      setOpen(false);
    }

    if (deleteUserError) {
      if ("data" in deleteUserError) {
        const errorMessage = deleteUserError as any;
        toast.error(errorMessage.data.message);
      }
    }
  }, [deleteSuccess, deleteUserError, isSuccess, refetch, updateUserRoleError]);

  const columns = [
    { field: "id", headerName: "ID", flex: 0.3 },
    { field: "name", headerName: "Name", flex: 0.5 },
    { field: "email", headerName: "Email", flex: 0.5 },
    { field: "role", headerName: "Role", flex: 0.5 },
    { field: "courses", headerName: "Purchased Courses", flex: 0.5 },
    { field: "created_at", headerName: "Created At", flex: 0.5 },
    {
      field: " ",
      headerName: "Delete",
      flex: 0.2,
      renderCell: (params: any) => {
        return (
          <>
            <Button
              onClick={() => {
                setOpen(!open);
                setUserId(params.row.id);
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
    {
      field: "  ",
      headerName: "Email",
      flex: 0.2,
      renderCell: (params: any) => {
        return (
          <>
            <a href={`mailto:${params.row.email}`}>
              <AiOutlineMail
                className="dark:text-white text-black mt-4"
                size={20}
              />
            </a>
          </>
        );
      },
    },
  ];

  let rows: any[] = [];

  if (isTeam) {
    rows =
      data?.users
        ?.filter((user: any) => user.role === "admin")
        .map((user: any) => ({
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          courses: user.courses?.length || 0,
          created_at: format(user.createdAt),
        })) || [];
  } else {
    rows =
      data?.users?.map((user: any) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        courses: user.courses?.length || 0,
        created_at: format(user.createdAt),
      })) || [];
  }

  const handleSubmit = async () => {
    if (!email) return toast.error("Email is required");
    console.log("Updating user role with:", { email, role });
    const res = await updateUserRole({ email, role });
    console.log("Update response:", res);
  };

  const handleDelete = async () => {
    const id = userId;
    await deleteUser(id);
  };

  return (
    <div className="mt-[120px]">
      {isLoading ? (
        <Loader />
      ) : (
        <Box m="20px">
          <div className="w-full flex justify-end">
            <div
              className={`${styles.button} !w-[200px] dark:bg-[#3e4396] bg-[#121774]`}
              onClick={() => setActive(true)}
            >
              Add new Member
            </div>
          </div>
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

          {active && (
            <Modal
              open={active}
              onClose={() => setActive(!active)}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <Box className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[450px] bg-white dark:bg-slate-900 rounded-[8px] shadow p-4 outline-none">
                <h1 className={`${styles.title}`}>Add New Member</h1>
                <div className="mt-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email..."
                    className={`${styles.input}`}
                  />
                  <select
                    name=""
                    id=""
                    className={`${styles.input} !mt-6 dark:bg-slate-800 bg-white dark:text-white text-black`}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRole(e.target.value)}
                  >
                    <option value="admin">admin</option>
                    <option value="user">user</option>
                  </select>
                  <br />
                  <div
                    className={`${styles.button} my-6 !h-[30px]`}
                    onClick={handleSubmit}
                  >
                    Submit
                  </div>
                </div>
              </Box>
            </Modal>
          )}

          {open && (
            <Modal
              open={open}
              onClose={() => setOpen(!open)}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <Box className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[450px] bg-white dark:bg-slate-900 rounded-[8px] shadow p-4 outline-none">
                <h1 className={`${styles.title}`}>
                  Are you sure you want to delete this User?
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

export default AllUsers;
