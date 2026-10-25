import { app } from "./app.js";
import { connectDB } from "./db/db.js";
let port = process.env.PORT || 4000;
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`app is listning on ${port}`);
    });
  })
  .catch((error) => {
    console.log("connection failed with mongodb", error);
  });
