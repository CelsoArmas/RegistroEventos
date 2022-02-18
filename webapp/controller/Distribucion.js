sap.ui.define([
	"sap/ui/base/ManagedObject"
], function(
	ManagedObject
) {
	"use strict";

	return ManagedObject.extend("com.tasa.registroeventospescav2.controller.Distribucion", {

        constructor: function(oView,sFragName) {

            this._oView = oView;
            var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.session);
            let flag = oStore.get("flagFragment");
            if(flag){
                this._oControl = sap.ui.xmlfragment(oView.getId(), "com.tasa.registroeventospescav2.fragments."+ sFragName,this);
            }
            this._bInit = false;


        },

        onButtonPress3:function(o_event){
            console.log(o_event);
        },

        getcontrol:function(){
            return this._oControl;
        }


	});
});