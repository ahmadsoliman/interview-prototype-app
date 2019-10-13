import { Meal } from '@app/core/models';

export class FetchMeals {
  static type = '[Meal] FetchMeals';
  constructor(public userId: string) {}
}

export class FetchMeal {
  static type = '[Meal] FetchMeal';
  constructor(public userId: string, public mealId: string) {}
}

export class UpdateMeal {
  static type = '[Meal] UpdateMeal';
  constructor(public userId: string, public meal: Meal) {}
}

export class DeleteMeal {
  static type = '[Meal] DeleteMeal';
  constructor(public userId: string, public mealId: string) {}
}