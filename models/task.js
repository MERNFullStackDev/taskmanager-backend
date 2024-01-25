const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const taskSchema = new Schema({
  taskName: { type: String, required: true },
  additionalNote: { type: String, default: "" },
  dueDate: { type: Date, default: Date.now },
  status: { type: Boolean, default: false },
  priority: {
    type: Number,
    default: 4
  }, // 1: urgent / red, 2: high / orange, 3: medium / yellow, 4: low // green
  creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
});

module.exports = mongoose.model("Task", taskSchema);
