sap.ui.define([
	"sap/ui/core/mvc/Controller",
    "./MainComp.controller",
    "sap/ui/core/BusyIndicator"
], function(
	Controller,
    MainComp,
    BusyIndicator
) {
	"use strict";

	return MainComp.extend("com.tasa.registroeventospescav2.controller.DetalleMareaExt", {

        /**
         * @override
         */
        onInit: function() {
            jQuery.sap.require("jquery.sap.storage");
			this._oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.session);
            this.router = this.getOwnerComponent().getRouter();
            this.router.getRoute("DetalleEventoExt").attachPatternMatched(this._onPatternMatched, this);
            /*this.router.navTo("DetalleEventoExt", {
                nrmar: "123456"
            })*/
            
        },

        callConstantes: async function(){
            BusyIndicator.show(0);
            var body={
                "nombreConsulta": "CONSGENCONST",
                "p_user": this.userOperation,
                "parametro1": this.parameter,
                "parametro2": "",
                "parametro3": "",
                "parametro4": "",
                "parametro5": ""
            }
            await fetch(`${this.onLocation()}General/ConsultaGeneral/`,
                  {
                      method: 'POST',
                      body: JSON.stringify(body)
                  })
                  .then(resp => resp.json()).then(data => {
                    
                    console.log(data.data);
                    this.HOST_HELP=this.url+data.data[0].LOW;
                    console.log(this.HOST_HELP);
                        BusyIndicator.hide();
                  }).catch(error => console.log(error)
            );
        },

        _onPatternMatched: async function(param){
            var that = this;
                var oView = this.getView();                
                this.userOperation =await this.getCurrentUser();
                this.objetoHelp =  this._getReusable();
                this.parameter= this.objetoHelp[0].parameter;
                this.url= this.objetoHelp[0].url;
               	await this.callConstantes();
                var nameComponent = "com.tasa.mareaevento";
                var idComponent = "com.tasa.mareaevento";                   
                var urlComponent = this.HOST_HELP+".com-tasa-mareaevento.comtasamareaevento-0.0.1";

                var compCreateOk = function () {
                    that.oGlobalBusyDialog.close();
                };
                
                oView.byId('pageDetallex').destroyContent();

                var content = oView.byId('pageDetallex').getContent();
                if (content.length === 0) {
                    this.oGlobalBusyDialog = new sap.m.BusyDialog();
                    this.oGlobalBusyDialog.open();
                    var oContainer = new sap.ui.core.ComponentContainer({
                        id: idComponent,
                        name: nameComponent,
                        url: urlComponent,
                        settings: {},
                        componentData: {},
                        propagateModel: true,
                        componentCreated: compCreateOk,
                        height: '100%',
                        //manifest: true,
                        async: false
                    });

                    oView.byId('pageDetallex').addContent(oContainer);
                }
        }


	});
});