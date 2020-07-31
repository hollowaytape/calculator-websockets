'use strict';

function calcHandler (db) {
   var calcs = db.collection('calculations');

   this.getCalcs = function (req, res) {
      // Get the 10 most recently created calculations.
      calcs.find({}).sort({_id:-1}).limit(10).toArray(function(err, calcDocs) {
         // Reverse the order - show the most recent calculation first.
         calcDocs.sort((a, b) => (a.id > b.id) ? 1 : -1)

         return res.json({calculations: calcDocs});
      });
   };

   this.addCalc = function (req, res) {
      // Create a calculation.
      let doc = {
         calculation: req.body.calculation
      };

      calcs.insertOne(doc, function(err, calcDoc) {
         if (err) { throw err; }
         return res.status(200).send();
      });
   };
}

module.exports = calcHandler;
