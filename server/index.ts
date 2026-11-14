// In server/src/index.ts:
import express from "express";
import cors from "cors";
import worksheetRoutes from "./routes/worksheetRoutes";

const app = express();
app.use(cors());
app.use(express.json());

// Mount the worksheet engine routes
app.use("/api/worksheets", worksheetRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});