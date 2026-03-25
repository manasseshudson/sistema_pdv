require('dotenv').config();
const knex = require('knex')({
  client: 'mysql2',
  connection: {
    //host : '148.113.153.60',
    host : '168.75.108.235',
    port : 3306,
    //user : 'igrej3682_ibadejuf',
    user: 'igrej3682_controle',
    password : 'ibadejuf2024',
    database : 'igrej3682_controle'
  }
});
/*
const knex = require('knex')({
  client: 'mysql2',
  connection: {
    host : 'localhost',
    port : 3306,
    user : 'root',
    password : '',
    database : 'igrej3682_controle'
  }
});
*/
module.exports = knex;

  