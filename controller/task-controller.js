const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Task = require("../models/task");
const User = require("../models/user");
const HttpError = require("../models/http-error");

const getTasksByTaskId = async (req, res, next) => {
  const taskId = req.params.tid;
  let task;
  try {
    task = await Task.findById(taskId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong while fetching data",
      500
    );
    return next(error);
  }
  if (!task) {
    const error = new HttpError(
      "Unable to find tasks with provided task id",
      404
    );
    return next(error);
  }
  res.json({ task: task.toObject({ getters: true }) });
};

const getTasksByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let tasks;
  try {
    tasks = await Task.find({ creator: userId });
  } catch (err) {
    const error = new HttpError(
      "Fetching Tasks get failed, try after sometime",
      500
    );
    return next(error);
  }

  if (!tasks || tasks.length === 0) {
    // return next(
    //   new HttpError("Unable to find tasks with provided User id", 404)
    // );
    res.json({
      tasks: []
    });
    return ;
  }
  res.json({
    tasks: tasks.map((taskObj) => {
      return taskObj.toObject({ getters: true });
    }),
  });
};

const createTask = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(new HttpError("Please check your Input data", 422));
  }
  const { taskName, additionalNote, dueDate,status,priority} = req.body;

  const createTask = new Task({
    taskName,
    additionalNote: additionalNote || "",
    dueDate: dueDate || Date.now(),
    status: status || false,
    priority: priority || 4,
    creator:req.userData.userId
  });

  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError('Failed while checking existing user, try after some time.',500);
    return next(error);
  }
if(!user){
  const error = new HttpError('We could not find user with provided user id.',404);
    return next(error);
}
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    createTask.save({session:sess});
    user.tasks.push(createTask);
    await user.save();
    await sess.commitTransaction();

  } catch (err) {
    const error = new HttpError(
      "Creating task failed, please try again.",
      500
    );
    return next(error);
  }

  res.status(201).json({ task: createTask });
};

const updateTask = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(new HttpError("Please check your Input data", 422));
  }
  const { taskName, additionalNote, dueDate,status,priority } = req.body;
  const taskId = req.params.tid;

  let task;
  try {
    task = await Task.findById(taskId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong while updating data, please try again later",
      500
    );
    return next(error);
  }
  if(task.creator.toString() !== req.userData.userId){
    const error = new HttpError('You are not allowed to edit this place.',401);
    return next(error);
  }
  task.taskName = taskName;
  task.additionalNote = additionalNote;
  task.dueDate = dueDate;
  task.status = status;
  task.priority = priority;

  try {
    await task.save();
  } catch (err) {
    const error = new HttpError("Something went wrong while saving data", 500);
    return next(error);
  }

  res.status(200).json({ task: task.toObject({ getters: true }) });
};

const deleteTask = async (req, res, next) => {
  const taskId = req.params.tid;
  
  let task;
  try {
    task = await Task.findById(taskId).populate('creator');
  } catch (err) {
    const error = new HttpError(
      "Something went wrong while deleting task",
      500
    );
    return next(error);
  }

  if(!task){
      const error = new HttpError('Task could not be found',404);
      return next(error);
  }

if(task.creator.id !== req.userData.userId){
  const error = new HttpError('You are not allowed to delete this task.',401);
  return next(error);
}

 
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await task.deleteOne({session:sess});
    task.creator.tasks.pull(task);
    await task.creator.save({session:sess});
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong while deleting task",
      500
    );
    return next(error);
  }
  res.status(200).json({ message: "Task Deleted Successfully." });
};

exports.getTasksByTaskId = getTasksByTaskId;
exports.getTasksByUserId = getTasksByUserId;
exports.createTask = createTask;
exports.updateTask = updateTask;
exports.deleteTask = deleteTask;