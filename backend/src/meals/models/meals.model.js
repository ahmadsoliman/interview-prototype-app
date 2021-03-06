const mongoose = require('mongoose');
const UserModel = require('../../users/models/users.model');

const mealSchema = new mongoose.Schema({
  text: String,
  date: Date,
  calories: Number,
  exceedsDailyLimit: {
    type: Boolean,
    default: false
  }
});
exports.MealSchema = mealSchema;

const MealModel = mongoose.model('Meals', mealSchema);
exports.MealModel = MealModel;

const inRangePredicate = (date, dateRanges) => {
  forDate = new Date(date.toLocaleDateString());
  if ((dateRanges.startDate && forDate < dateRanges.startDate) ||
    (dateRanges.endDate && forDate > dateRanges.endDate) ||
    (dateRanges.startTime && (date.getHours() < dateRanges.startTime.getHours() ||
      (date.getHours() === dateRanges.startTime.getHours() && date.getMinutes() < dateRanges.startTime.getMinutes()))) ||
    (dateRanges.endTime && (date.getHours() > dateRanges.endTime.getHours() ||
      (date.getHours() === dateRanges.endTime.getHours() && date.getMinutes() > dateRanges.endTime.getMinutes())))) {
    return false;
  }
  return true;
}

const setExceedsProperty = (meals, maxCalories) => {
  let resMeals = [], curDay = [], curSum = 0;
  for (let i = 0; i < meals.length; i++) {
    if (i == 0 || meals[i].date.toLocaleDateString() === curDay[0].date.toLocaleDateString()) {
      curSum += meals[i].calories;
      curDay.push(meals[i]);
    } else {
      resMeals.push(...curDay.map(meal => {
        meal.exceedsDailyLimit = curSum > maxCalories;
        return meal;
      }));
      curSum = meals[i].calories;
      curDay = [meals[i]];
    }
  }
  resMeals.push(...curDay.map(meal => {
    meal.exceedsDailyLimit = curSum > maxCalories;
    return meal;
  }));
  return resMeals;
}

exports.createMeal = (userId, mealData) => {
  const meal = new MealModel(mealData);
  return UserModel.User.findById(userId).then((user) => {
    user.meals.push(meal);
    return user.save().then(() => {
      return meal;
    });
  });
};

exports.list = (userId, take, skip, dateRanges, userCaloriesSetting) => {
  return UserModel.User.findById(userId).then((result) => {
    const meals = setExceedsProperty(result.meals.sort((a, b) => a.date > b.date), userCaloriesSetting)
      .filter(meal => inRangePredicate(meal.date, dateRanges));
    const mealsPage = meals.slice(skip, skip + take).map(meal => {
      meal = meal.toJSON();
      meal.id = meal._id;
      delete meal._id;
      return meal;
    });
    return { meals: mealsPage, total: meals.length };
  });
};

exports.patchMeal = (userId, mealId, mealData) => {
  return new Promise((resolve, reject) => {
    UserModel.User.findById(userId).then((user) => {
      const mealIndex = user.meals.findIndex(meal => meal._id == mealId);
      if (mealIndex === -1) {
        return reject('Meal not found!');
      }
      for (let i in mealData) {
        user.meals[mealIndex][i] = mealData[i];
      }
      user.save(function (err) {
        if (err) return reject(err);
        resolve();
      });
    });
  })
};

exports.removeById = (userId, mealId) => {
  return new Promise((resolve, reject) => {
    UserModel.User.findById(userId).then((user) => {
      const mealIndex = user.meals.findIndex(meal => meal._id == mealId);
      if (mealIndex === -1) {
        reject('Meal not found!');
        return;
      }
      user.meals.splice(mealIndex, 1);
      user.save(function (err) {
        if (err) return reject(err);
        resolve();
      });
    });
  });
};