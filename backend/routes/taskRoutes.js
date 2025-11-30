const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const verifyToken = require('../middlewares/verifyToken');

// require auth
router.use(verifyToken);

router.post('/create', taskController.createTask);
router.get('/getalltasks', taskController.getAllTasks); // you can restrict to admin if required
router.get('/usertaskdisplay', taskController.getTasksByUser); // expects ?id=
router.put('/updatetask/:id', taskController.updateTask);
router.delete('/deletetask/:id', taskController.deleteTask);
router.get('/gettaskmetrics', taskController.getTaskMetrics);
router.get('/getrecenttasks', taskController.getRecentTasks);
router.get('/getusertasks/:id', taskController.getUserTasks); // protected
router.get('/gettaskbyid/:id', taskController.getTaskById);

module.exports = router;
