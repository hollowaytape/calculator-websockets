'use strict';

var CalcHandler = require(process.cwd() + '/app/controllers/calcHandler.server.js');

module.exports = function (app, db) {

   var calcHandler = new CalcHandler(db);

   app.route('/')
      .get(function (req, res) {
         res.render('index');
      });

   app.route('/api/calcs')
      .get(calcHandler.getCalcs)
      .post(calcHandler.addCalc)
};
