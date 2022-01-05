const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

// imports routes
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");

dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));
app.use(cors());

// routes
app.use("/api/v1/users", userRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/posts", postRoute);
app.use("/images", express.static(path.join(__dirname, "public/images")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
    // cb(null, req.body.name);
    console.log(37, req.body);
  },
});

const upload = multer({ storage: storage });

app.post("/api/v1/upload", upload.array("file", 8), (req, res) => {
  console.log(45, req.files);
  console.log(46, req.body);
  try {
    console.log(48, req.files);
    return res
      .status(200)
      .json({ success: true, data: "File uploaded successfully!" });
  } catch (err) {
    console.log({ success: false, data: err });
  }
});

app.get("/", (req, res) => {
  res.json("Welcome to the Social Media (Facebook clone) server!");
});

const PORT = process.env.PORT || 5000;

const uri = process.env.ATLAS_URI;

// mongoose.connect(process.env.ATLAS_URI, {useNewUrlParser: true}, () => {
//     console.log("MongoDB database connection has been established successfully.")
// })

mongoose.connect(uri, { useNewUrlParser: true });
const connection = mongoose.connection;

connection.once("open", () => {
  console.log("MongoDB database connection has been established successfully.");
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
