import Sequelize from "sequelize";
import { sequelize } from "../../config/sequelize";

const customerModel = sequelize.define("customer", {
  cus_id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  cus_firstname: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  cus_lastname: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  cus_email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  cus_phone_number: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  cus_password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  cus_confirm_password: {
    type: Sequelize.VIRTUAL,
    allowNull: false,
  },
}, {
  tableName: "customers",
  timestamps: true,
});

export default customerModel;
