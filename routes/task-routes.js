const express = require("express");
const { check } = require("express-validator");
const taskController = require("../controller/task-controller");
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.get('/:tid', taskController.getTasksByTaskId);
router.get("/user/:uid", taskController.getTasksByUserId);

router.use(checkAuth);

router.post('/',[check("taskName").notEmpty()],taskController.createTask);
router.patch('/:tid', [check("taskName").notEmpty()],taskController.updateTask);
router.delete('/:tid', taskController.deleteTask);

module.exports = router;