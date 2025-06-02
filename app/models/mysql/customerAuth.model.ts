// models/mysql/customerAuth.model.ts
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/sequelize";

interface CustomerAuthAttributes {
  id?: number;
  cus_id: number;
  cus_auth_token: string;
  cus_refresh_auth_token: string;
}

type CustomerAuthCreationAttributes = Optional<CustomerAuthAttributes, "id">;

class CustomerAuth
  extends Model<CustomerAuthAttributes, CustomerAuthCreationAttributes>
  implements CustomerAuthAttributes
{
  public id!: number;
  public cus_id!: number;
  public cus_auth_token!: string;
  public cus_refresh_auth_token!: string;
}

CustomerAuth.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    cus_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    cus_auth_token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cus_refresh_auth_token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    tableName: "customer_auth",
    timestamps: true, // Optional: remove if you don't want createdAt/updatedAt
  }
);

export default CustomerAuth;
