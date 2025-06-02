import { Model, DataTypes, Optional } from "sequelize";
import { sequelize } from "../../config/sequelize";

// Define interface for model attributes
interface CustomerAuthAttributes {
  cus_auth_id: string;
  cus_id: string;
  cus_auth_token: string;
  cus_refresh_auth_token: string;
}

// For creation, cus_auth_id is optional (auto-generated)
interface CustomerAuthCreationAttributes extends Optional<CustomerAuthAttributes, "cus_auth_id"> {}

// Create the class that extends Sequelize.Model
class CustomerAuth
  extends Model<CustomerAuthAttributes, CustomerAuthCreationAttributes>
  implements CustomerAuthAttributes
{
  public cus_auth_id!: string;
  public cus_id!: string;
  public cus_auth_token!: string;
  public cus_refresh_auth_token!: string;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize the model
CustomerAuth.init(
  {
    cus_auth_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    cus_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "customers",
        key: "cus_id",
      },
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
  }
);

export default CustomerAuth;
