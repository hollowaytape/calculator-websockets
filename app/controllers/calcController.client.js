'use strict';

(function () {
   const apiUrl = '/api/calcs';

   const DOMAIN = window.location.hostname;

   function cleanArithmetic(str) {
      // Replace anything in a string that's not digits or operators.
      return str.replace(/[^-()\d/*+.]/g, '');
   }

   function addOneCalculation(calc) {
      // Add one calculation to the top of the list,
      // then clean up the list if there are more than 10.
       $('#calculations').prepend(`<p class='calc'>${calc}</p>`);

       while ($('.calc').length > 10) {
         $('.calc').last().remove();
       }
   }

   function refreshCalculations() {
      $.ajax({
         url: apiUrl,
         method: "GET",
         success: function(data) {
            console.log("Got it");
            console.log(data);

            let calculations = data.calculations;
            $('#calculations').text("");
            calculations.forEach(function(calc) {
               addOneCalculation(calc.calculation);
            });
         }
      });
   }


   $().ready(function() {
      // Setup websocket
      const ws = new window.WebSocket(`wss://${DOMAIN}/chat`);
      ws.onopen = function() {
         console.log("Opened ws connection");
         //ws.send("A client has connected"); 
      };

      ws.onclose = function(e) {
         console.log("Close ws connection: ", e.code, e.reason);
      };
 
      ws.onmessage = function(event) {
         // Display a new calculation that comes in through a WS message
         let msg = JSON.parse(event.data);
         if (msg.type == "calculation") {
            addOneCalculation(msg.value);
         }
      }

      // Digit buttons
      $('.btn-val').click(function() {
         // Replace the field's initial '0' value if necessary
         if ($('#results').val() == '0') {
            $('#results').val($(this).val());
         } else {
            $('#results').val($('#results').val() + ($(this).val()));
         }
      });

      // Operator buttons
      $('.btn-op').click(function() {
         $('#results').val($('#results').val() + ($(this).val()));
      });

      // Equal button
      $('.btn-equal').click(function() {
          let arithmeticString = $('#results').val();
          arithmeticString = cleanArithmetic(arithmeticString);

          // eval() is not a security risk on the client side. But don't use it on a server
          let result = eval(arithmeticString);

          let fullCalculation = arithmeticString + " = " + result;

          // No need to display this calculation right now...
          // we will send a websocket message, and the server will tell this client
          // about this calculation. We can display it then

          // addOneCalculation(fullCalculation);

          $.ajax({
            url: apiUrl,
            method: "POST",
            data: JSON.stringify({calculation: fullCalculation}),
            contentType: "application/json",
            success: function() {
               // Let the websocket know there's a new calculation
               let msg = {
                  type: "calculation",
                  value: fullCalculation
               };
               ws.send(JSON.stringify(msg));
            },
          })

          // Reset calculator field to initial '0'
          $('#results').val("0");
      });

      // Get initial list of 10 calculations.
      refreshCalculations();
   })
})();
