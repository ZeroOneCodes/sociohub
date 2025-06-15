##  setup
1. npm init -y
2. npm install express nodemon dotenv pg pg-hstore sequelize sequelize-cli
3. npx sequelize-cli init

"scripts": {
    "dev": "nodemon index.js",
    "start": "node index.js",
    "migrate": "sequelize-cli db:migrate",
    "migrate:undo": "sequelize-cli db:migrate:undo",
    "seed": "sequelize-cli db:seed:all"
  },

4. npx sequelize-cli migration:generate --name create-users

5. run with docker : docker-compose up --build
6. docker-compose down
7. 