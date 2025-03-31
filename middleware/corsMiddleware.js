import cors from "cors";

app.use(
  cors({
    origin: "http://192.168.1.46:3000",  // Change to your frontend URL
    credentials: true,  // ✅ Allows cookies to be sent
  })
);
