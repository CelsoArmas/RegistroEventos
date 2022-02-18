sap.ui.define([], function () {
    "use strict";
  
    return {
      eliminaCeroHora: function(hora){
          var newValue = "";
          if(hora == "00:00"){
            newValue = "";
          }else{
            newValue = hora;
          }
          return newValue;
      },

    };
  
  });