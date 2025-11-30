const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');


router.post('/create', taskController.createTask);
router.get('/getalltasks', taskController.getAllTasks);
router.get('/usertaskdisplay', taskController.getTasksByUser);
router.put('/updatetask/:id', taskController.updateTask);
router.delete('/deletetask/:id', taskController.deleteTask);
router.get('/gettaskmetrics',taskController.getTaskMetrics)
router.get('/getrecenttasks',taskController.getRecentTasks)
router.get('/getusertasks/:id',taskController.getUserTasks)
router.get('/gettaskbyid/:id',taskController.getTaskById)

module.exports = router;
