const IS_PROD = process.env.NODE_ENV === "production";
const server = process.env.REACT_APP_SERVER_URL || (IS_PROD ? "https://apnacollegebackend.onrender.com" : "http://localhost:8000");

export default server;
