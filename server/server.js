const dotenv = require("dotenv")
const express = require("express");
const cors = require("cors");
const connecttomongodb = require("./db/connectTodb");
const authRoutes = require("./routes/auth-routes/index");
const mediaRoutes = require("./routes/instructor-routes/media-routes")
const instructorCourseRoutes = require("./routes/instructor-routes/course-routes");
const studentViewCourseRoutes = require("./routes/student-routes/course-routes");
const studentViewOrderRoutes = require("./routes/student-routes/order-routes");
const studentViewCoursesRoutes = require("./routes/student-routes/student-courses-route");
const studentCourseProgressRoutes = require("./routes/student-routes/course-progress-routes")


dotenv.config();

const port = process.env.PORT || 5000;
const app = express();

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
        methods: ["GET", "POST", "DELETE", "PUT"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth",authRoutes);
app.use("/media",mediaRoutes);
app.use("/instructor/course", instructorCourseRoutes);
app.use("/student/course",studentViewCourseRoutes);
app.use("/student/order",studentViewOrderRoutes);
app.use("/student/courses-bought",studentViewCoursesRoutes);
app.use("/student/course-progress", studentCourseProgressRoutes);


app.listen(port,() => {
    connecttomongodb();
    console.log(`Server is running on port ${port}`);
});
