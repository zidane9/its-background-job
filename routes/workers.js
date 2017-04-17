'use strict'
const express = require('express');
const router = express.Router();
let controller  = require('../controllers/workerController');

/* GET home page. */
router.get('/',  controller.getAll);
router.get('/stoptime/:workerid',controller.stopWorkTime);
router.get('/:workerid', controller.getOne);
router.post('/', controller.createOne);
router.put('/:workerid', controller.update);
router.delete('/:workerid', controller.deleteOne);
router.get('/worktime/:workerid', controller.createCronJob);

module.exports = router;
