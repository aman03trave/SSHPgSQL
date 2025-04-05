import mongoose from "mongoose";

const URI = "mongodb://localhost:27017/SSHBackend"

mongoose.connect(URI, {})
.then( () => {
    console.log("Connected to Database.");
}
    )
    .catch((err) => console.error("Failed to connect to Database" ,err)
);

const connection = mongoose.connection;

export default connection;
