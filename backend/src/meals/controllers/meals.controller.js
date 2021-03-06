const MealModel = require('../models/meals.model');
const UserModel = require('../../users/models/users.model');

exports.insert = (req, res) => {
  MealModel.createMeal(req.params.userId, req.body)
    .then((result) => {
      res.status(201).send({ id: result._id });
    });
};

exports.patchById = (req, res) => {
  MealModel.patchMeal(req.params.userId, req.params.mealId, req.body).then((result) => {
    res.status(204).send({});
  }).catch(err => {
    res.status(404).send('Meal doesnt exist!');
  });
};

exports.list = (req, res) => {
  let take = req.query.take && req.query.take <= 100 ? parseInt(req.query.take) : 10;
  let skip = 0;
  if (req.query.skip) {
    req.query.skip = parseInt(req.query.skip);
    skip = Number.isInteger(req.query.skip) ? req.query.skip : 0;
  }
  const startDate = req.query.startDate ? new Date(req.query.startDate) : undefined;
  const endDate = req.query.endDate ? new Date(req.query.endDate) : undefined;
  const startTime = req.query.startTime ? new Date(req.query.startTime) : undefined;
  const endTime = req.query.startTime ? new Date(req.query.endTime) : undefined;

  UserModel.findById(req.params.userId).then(user => {
    MealModel.list(
      req.params.userId,
      take, skip,
      { startDate, endDate, startTime, endTime },
      user.expectedNumberOfCalories
    ).then((result) => {
      res.status(200).send(result);
    });
  });
};

exports.removeById = (req, res) => {
  MealModel.removeById(req.params.userId, req.params.mealId)
    .then((result) => {
      res.status(204).send({});
    }).catch(err => {
      res.status(404).send(err);
    });
};