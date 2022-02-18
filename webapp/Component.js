sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"./model/models",
	"sap/ui/model/json/JSONModel",
], function (UIComponent,
	Device,
	models,
	JSONModel) {
	"use strict";

	return UIComponent.extend("com.tasa.registroeventospescav2.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			jQuery.sap.registerModulePath("mareaeventov2", "../00c652ca-e1ae-4895-b96e-dd46a71bfffa.com-tasa-mareaeventov2.comtasamareaeventov2-1.0.0");

			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");

			//set init model
			this.setModel(models.createInitModel(), "DetalleMarea");

			//set combos model
			this.setModel(models.createCombosModel(), "ComboModel");

			//sett plantas model
			this.setModel(models.createPlantasModel(), "PlantasModel");

			//set propios model
			this.setModel(models.ListaMareas(), "ListaMareas");

			//set constants utilitis model
			this.setModel(models.createConstantsUtility(), "ConstantsUtility");

			//set ayuda de buqueda embarcacion
			this.setModel(models.busquedaEmba(), "busquedaEmba");

			//set form model
			sap.ui.getCore().setModel(models.createFormModel(), "Form");

			//set data session model
			sap.ui.getCore().setModel(models.createDataSession(), "DataSession");

			//set visible model
			sap.ui.getCore().setModel(models.createVisibleModel(), "Visible");

			//set resource model i18n
			sap.ui.getCore().setModel(models.createResourceModel(), "i18n");

			//set Utils model
			sap.ui.getCore().setModel(models.createUtilsModel(), "Utils");

			//set marea anterior model
			sap.ui.getCore().setModel(models.createMareaAnteriorModel(), "MareaAnterior");

			//set utilitario model
			sap.ui.getCore().setModel(models.createUttilitarioModel(), "Utilitario");

			//set filtro model
			sap.ui.getCore().setModel(models.createFiltroModel(), "Filtro");

			//set Distrib Flota model
			sap.ui.getCore().setModel(models.createDistribFlotaModel(), "DistribFlota");

			//set constants utiliy model
			//sap.ui.getCore().setModel(models.createConstantsUtility(), "ConstantsUtility");

			//set constantes model
			sap.ui.getCore().setModel(models.createConstantesModel(), "Constantes");


		}

	});
});
