sap.ui.define([
    "../Service/TasaBackendService"
], function (TasaBackendService) {
    "use strict";
    return {

        eventoTexto: async function (cdtev) {
            /*return await TasaBackendService.obtenerDominio("ZCDTEV").then(function(response){
                var sData = response.data[0].data;
                for (let index = 0; index < sData.length; index++) {
                    const element = sData[index];
                    if (element.id == cdtev) {
                        return element.descripcion;
                        break;
                    }
                }
            }).catch(function(error){
                console.log("ERROR: Formatter.eventoTexto - ", error );
            });*/
        },

        motivoMareaTexto: async function (cdmma) {
            /*return await TasaBackendService.obtenerDominio("ZDO_ZCDMMA").then(function(response){
                var sData = response.data[0].data;
                for (let index = 0; index < sData.length; index++) {
                    const element = sData[index];
                    if (element.id == cdmma) {
                        return element.descripcion;
                        break;
                    }
                }
            }).catch(function(error){
                console.log("ERROR: Formatter.eventoTexto - ", error );
            });*/
        }


    };
});