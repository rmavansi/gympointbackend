import Sequelize from 'sequelize';
import User from '../app/models/User';
import Student from '../app/models/Student';
import Membership from '../app/models/Membership';
import databaseConfig from '../config/database';

const models = [User, Student, Membership];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);
    models.map(model => model.init(this.connection));
  }
}

export default new Database();
