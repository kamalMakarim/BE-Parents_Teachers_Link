const studentController = require('../controllers/student.controller');
const router = require('express').Router();
const auth = require('../middlewares/auth.middlewares');

router.get('/getStudentsOfParent', auth.authenticate, studentController.getStudentsOfParent);
router.post('/add', auth.authenticate, auth.isAdmin, studentController.addStudent);
router.get('/getStudentClass', auth.authenticate, studentController.getStudentClass);
router.get('/all', auth.authenticate, auth.isAdmin, studentController.getAllStudent);
router.delete('/delete/:id', auth.authenticate, auth.isAdmin, studentController.deleteStudent);
router.put('/update', auth.authenticate, auth.isAdmin, studentController.updateStudent);

module.exports = router;