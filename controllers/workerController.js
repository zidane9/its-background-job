'use strict'

let Worker = require('../models/worker');
const CronJob = require('cron').CronJob;
const kue = require('kue');
const queue = kue.createQueue();
let jobs = [];

let getAll = function (req, res, next) {
  Worker.find(function (err, workers){
    if(err){
      res.json({error: err});
    } else {
      res.json(workers);
    }
  })
};

let getOne = function (req, res, next) {
  Worker.findOne({workerid: req.params.workerid}, function (err, worker){
    if(err){
      res.json({error: err});
    } else {
      res.json(worker);
    }
  })
};

let createOne = function (req, res, next) {
  Worker.create({
    name : req.body.name,
    workerid : req.body.workerid,
    minutesWork : 0,
    phone : req.body.phone
  }, function (error, worker){
    if(error) throw error;
    res.send(worker);
  })
};

let update = function (req, res, next) {
  let temp = {
    name : req.body.name,
    workerid : req.body.workerid,
    // minutesWork : 0,
    phone : req.body.phone
  }
  Worker.update({ workerid: req.params.workerid }, { $set: temp}, function(err, updatedWorker) {
    if (err) res.send(err);
    else res.send(updatedWorker);
  });
};

let createCronJob = function (req, res, next) {
  // console.log(req.params.workerid);
  let wId = req.params.workerid;
  if(findJobIndex(wId) == -1){
    let job;
  let query = Worker.findOne({workerid: wId});
  query.exec(function (err, worker) {
    if(err) console.log(err);
    else {
      job = new CronJob('*/60 * * * * *', function() {
        let jobQueue = queue.create('workingNow', {
          wId: wId
        }).save(function(err){
        if (err) console.log(jobQueue.id,err);
      });

      queue.process('workingNow', function(jobInQueue, done){
        addWorkingTime(jobInQueue.data, done);
      })
    }, function(){
      console.log('cronjob stopped');
    }, false,
    'Asia/Jakarta');

    job.start();
    jobs.push({id: wId, job: job});
    }
  })
  }
  // Worker.findOne({workerid: wId}, (err,worker)=>{
  //   if(err) console.log(err);
  //   else {
  //     new CronJob('1 * * * * *', function() {
  //     worker.minutesWork += 1;
  //     worker.save(function(err){
  //       if (err) console.log(err);
  //     })
  //   }, function(){
  //     console.log('cronjob stopped');
  //   }, true, 'Asia/Jakarta');
  // }})

  // let job = new CronJob('1 * * * * *', function() {
  //   Worker.findOne({workerid: wId}, (err,worker)=>{
  //     if(err) console.log(err);
  //     else {
  //       worker.minutesWork += 1;
  //       worker.save(function(err){
  //         if (err) console.log(err);
  //       })
  //     }
  //   })
  // }, function(){
  //   console.log('cronjob stopped');
  // }, true, 'Asia/Jakarta');
  // res.send(job)

};

let stopWorkTime = function (req, res, next) {
  let idx = findJobIndex(req.params.workerid);
  if(idx != -1){
    console.log('stopping cron job '+req.params.workerid);
    jobs[idx].job.stop();
    jobs[idx].job = null;
    jobs.splice(idx,1);
  }
}

let deleteOne = function (req, res, next) {
  Worker.findOne({workerid: req.params.workerid}).remove(function(err, respond){
    if(err) res.send(err);
    else res.send(respond);
  });
};

function findJobIndex(jobId){
  for(let i=0;i<jobs.length;i++){
    if(jobs[i].id == jobId) return i;
  }
  return -1;
}

function addWorkingTime(data){
  Worker.findOne({workerid: data.wId}, (err,worker)=>{
    if(err) console.log(err);
    else {
      worker.minutesWork += 1;
      worker.save(function(err){
        if (err) console.log(err);
        else console.log(`workerid ${data.wId} updated`);
      })
    }
  })
}

module.exports = {
  getAll,
  getOne,
  createOne,
  update,
  createCronJob,
  stopWorkTime,
  deleteOne
}
