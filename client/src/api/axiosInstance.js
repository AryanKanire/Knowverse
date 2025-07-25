import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://knowverse-backend.onrender.com",
  withCredentials: true
});

axiosInstance.interceptors.request.use(config=>{
  const accessToken = JSON.parse(sessionStorage.getItem('accessToken')) || "";

  console.log("Access Token:", accessToken); 

  if(accessToken){
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config;
},(err)=>{
  Promise.reject(err);
})


export default axiosInstance;