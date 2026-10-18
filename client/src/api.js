
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const getTasks = (params = {}) =>
  api.get("/tasks", { params }).then((res) => res.data);

export const createTask = (task) =>
  api.post("/tasks", task).then((res) => res.data);

export const updateTask = (id, task) =>
  api.put(`/tasks/${id}`, task).then((res) => res.data);

export const deleteTask = (id) =>
  api.delete(`/tasks/${id}`).then((res) => res.data);

export function getErrorMessage(error) {
  return (
    error.response?.data?.message ||
    error.message ||
    "Something went wrong. Please try again."
  );
}
