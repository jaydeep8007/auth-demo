



var config: any = {
  production: {
    database: {
       DB_TYPE: process.env.DB_TYPE || "mysql", 
      DB_NAME: "fuse2",
      DB_USERNAME: "admin",
      DB_PASSWORD: "Admin@123",
      DB_HOST: "localhost",
      DIALECT: "mysql",
      LOGGING: false,
      MONGO_URI: "mongodb://localhost:27017/fuse2"
    },
    SECURITY_TOKEN: 'Fuse2ServerSecurityKey',
    SERVER_PORT: '3000',
    TOKEN_EXPIRES_IN: 361440,
    REFRESH_TOKEN_EXPIRES_IN: 361440
  },
  development: {
    database: {
      DB_TYPE: process.env.DB_TYPE || "mysql",
      DB_NAME: "mydbdemo",
      DB_USERNAME: "root",
      DB_PASSWORD: "Admin@123",
      DB_HOST: "localhost",
      DIALECT: "mysql",
      LOGGING: false,
      MONGO_URI: "mongodb://localhost:27017/mydbdemo"
    },
    SECURITY_TOKEN: 'Fuse2ServerSecurityKey',
    SERVER_PORT: '8000',
    TOKEN_EXPIRES_IN: 361440,
    REFRESH_TOKEN_EXPIRES_IN: 361440
  }
};

export function get(env: any) {
  return config[env] || config.development;
}
