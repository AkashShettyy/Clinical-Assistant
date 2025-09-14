import axios from "axios";
import { isTokenExpired } from "@/utils/auth";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // if you’re also using cookies
});

API.interceptors.request.use(
  (req) => {
    //  Add Authorization header if token exists and valid
    const userData = JSON.parse(localStorage.getItem("user"));
    const token = userData?.accessToken;
    if (token) {
      if (isTokenExpired(token)) {
        // Token expired → clear storage + redirect
        localStorage.removeItem("user");
        window.location.href = "/";
        return Promise.reject("Token expired");
      } else {
        req.headers.Authorization = `Bearer ${token}`;
      }
    }

    // 🔹 Detect if request contains a file → switch to multipart/form-data
    if (req.data) {
      const hasFile = Object.values(req.data).some(
        (value) =>
          value instanceof File ||
          value instanceof Blob ||
          (Array.isArray(value) && value.some((item) => item instanceof File))
      );

      if (hasFile) {
        const formData = new FormData();

        Object.entries(req.data).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((item) => formData.append(key, item));
          } else {
            formData.append(key, value);
          }
        });

        req.data = formData;
        req.headers["Content-Type"] = "multipart/form-data";
      }
    }

    return req;
  },
  (error) => Promise.reject(error)
);

export default API;

export const fetchDoctorActiveAppointments = async () => {
  const { data } = await API.get(`/appointments/active`);
  return data?.data || [];
};

export const fetchDoctorCompletedAppointments = async () => {
  const { data } = await API.get(`/appointments/completed`);
  return data?.data || [];
};

export const fetchAllDoctors = async () => {
  const { data } = await API.get("/doctors/all");
  console.log("doctors data:", data);
  return data?.data.docs || [];
};

//patient apis:
export const getMyDoctors = async () => {
  const doctors = await API.get("/patients/myDoctors");
  console.log("patient/mydoctors/ : ", doctors.data.data);
  return doctors.data.data;
};

//appointments api:
export const fetchMyAppointments = async () => {
  const { data } = await API.get(`/appointments`);
  return data?.data || [];
};

export const fetchAppointmentById = async (id) => {
  const { data } = await API.get(`/appointments/${id}`);
  return data?.data;
};

export const createAppointment = async ({
  doctorId,
  patientId,
  scheduledAt,
  reason,
}) => {
  const { data } = await API.post(`/appointments`, {
    doctorId,
    patientId,
    scheduledAt,
    reason,
  });
  return data?.data;
};

// export const startAppointment = async (id) => {
//   const { data } = await API.put(`/appointments/${id}/start`);
//   return data?.data;
// };

//this doesn't return anything
export const deleteAppointmentById = async (id) => {
  await API.delete(`/appointments/${id}`);
};

export const completeAppointment = async (id) => {
  const { data } = await API.put(`/appointments/${id}/complete`);
  return data?.data;
};

export const fetchDPAppointment = async (id) => {
  const appt = await API.get(`/appointments/dp/${id}`);
  // console.log("appointment complete response:", appt);
  return appt.data.data;
};
