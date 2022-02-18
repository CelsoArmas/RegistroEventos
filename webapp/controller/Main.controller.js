sap.ui.define([
    "./MainComp.controller",
    "./FormCust",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "../Service/TasaBackendService",
    "../model/formatter",
    "./Utils",
    "../model/models",
    "sap/ui/core/BusyIndicator",
    'sap/m/MessagePopover',
    'sap/m/MessageItem'
],

    function (MainComp, FormCust, Controller, JSONModel, MessageBox, TasaBackendService, formatter, Utils, models, BusyIndicator, MessagePopover, MessageItem) {
        "use strict";

        var oMessagePopover;

        const mainUrlServices = 'https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com/api/';

        return MainComp.extend("com.tasa.registroeventospescav2.controller.Main", {

            formatter: formatter,
            //FormCust: FormCust,

            onInit: async function () {
                BusyIndicator.show(0);
                //var currentUser = await this.getCurrentUser();
                this.oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
                //this.formCust = sap.ui.controller("com.tasa.registroeventospescav2.controller.FormCust"
                /*
                var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.Session);
                var cdpta = oStore.get("CDPTA");
                var cdtem = oStore.get("CDTEM");
                if(cdpta && cdtem){
                    this.filtarMareas(cdtem, cdpta);
                }
                */
                var currentUser = await this.getCurrentUser();
                var listaMareas = await TasaBackendService.cargarListaMareas(currentUser);
                if (listaMareas) {
                    var tipoEmba = await TasaBackendService.obtenerTipoEmbarcacion(currentUser);
                    if (tipoEmba) {
                        var plantas = await TasaBackendService.obtenerPlantas(currentUser);
                        if (plantas) {
                            this.prepararDataTree(tipoEmba, plantas.data);
                            this.validarDataMareas(listaMareas);
                        }
                    }
                }

                await this.loadInitData();
                await this.cargarDatosReutilizables();

                this.CDTEM = "";
                this.CDPTA = "";
                this.primerOption = [];
                this.segundoOption = [];
                this.currentPage = "";
                this.lastPage = "";

                this.cargarMessagePopover();

                //this.filtarMareas("001","0012");//por defecto muestra la primera opcion
                //console.log("FECHA HOY: ", new Date());
                var modelo = this.getOwnerComponent().getModel('DetalleMarea');
                var dataModelo = modelo.getData();
                var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.Session);
                oStore.put('InitData', dataModelo);

                console.log("MODELO INICIAL: ", modelo);

            },

            /**
             * @override
             */
            onAfterRendering: async function () {
                //MainComp.prototype.onAfterRendering.apply(this, arguments);
                BusyIndicator.show(0);
                this.objetoHelp = this._getHelpSearch();
                this.parameter = this.objetoHelp[0].parameter;
                this.url = this.objetoHelp[0].url;
                await this.callConstantes();

                // this.byId("tblMareasPropios").refreshRows();
                // this.byId("tblMareasTerceros").refreshRows();
                var oRenderer = sap.ushell.Container.getRenderer("fiori3");

                console.log("RENDERER: ", oRenderer);
                oRenderer.hideHeaderItem("backBtn", false);

                BusyIndicator.hide();

                
                /*
                BusyIndicator.show(0);
                await this.onActualizaMareas();
                BusyIndicator.hide();*/

                /*await this.getOwnerComponent().getServiceAsync("ShellUIService").then(function(oShellService) {
                    oShellService.setBackNavigation(function() {
                        console.log("NAVEGAR ATRAS FIORI LAUNCHPAD");
                    });
                });*/


                //BusyIndicator.hide();
            },

            callConstantes: async function () {
                BusyIndicator.show(0);
                //var modeloConstantes = this.getOwnerComponent().getModel("DetalleMarea");
                var modeloConstantes2 = this.getOwnerComponent().getModel("DetalleMarea");//busquedaEmba
                var body = {
                    "nombreConsulta": "CONSGENCONST",
                    "p_user": await this.getCurrentUser(),
                    "parametro1": this.parameter,
                    "parametro2": "",
                    "parametro3": "",
                    "parametro4": "",
                    "parametro5": ""
                }
                fetch(`${this.onLocation()}General/ConsultaGeneral/`,
                    {
                        method: 'POST',
                        body: JSON.stringify(body)
                    })
                    .then(resp => resp.json()).then(data => {
                        var host = this.url + data.data[0].LOW;
                        modeloConstantes2.setProperty("/HelpHost", host);
                    }).catch(error => console.log(error)
                    );
                BusyIndicator.hide();
            },

            _onPatternMatched: function () {

            },

            cargarMessagePopover: function () {
                var oMessageTemplate = new MessageItem({
                    type: '{DetalleMarea>type}',
                    title: '{DetalleMarea>title}',
                    activeTitle: "{DetalleMarea>active}",
                    description: '{DetalleMarea>description}',
                    subtitle: '{DetalleMarea>subtitle}',
                    counter: '{DetalleMarea>counter}'
                });

                oMessagePopover = new MessagePopover({
                    items: {
                        path: 'DetalleMarea>/Utils/MessageItemsMA',
                        template: oMessageTemplate
                    }
                });
                this.byId("messagePopoverBtnMain").addDependent(oMessagePopover);
            },

            handleMessagePopoverPress: function (oEvent) {
                oMessagePopover.toggle(oEvent.getSource());
            },

            loadInitData: async function () {
                //let zinprpDom = [];
                let plantas = [];
                const bodyDominios = {
                    "dominios": [
                        {
                            "domname": "ZINPRP",
                            "status": "A"
                        }
                    ]
                };

                /*fetch(`${mainUrlServices}dominios/Listar`,
                    {
                        method: 'POST',
                        body: JSON.stringify(bodyDominios)
                    })
                    .then(resp => resp.json()).then(data => {
                        zinprpDom = data.data.find(d => d.dominio == "ZINPRP").data;
                        this.getOwnerComponent().getModel("ComboModel").setProperty("/IndPropiedad", zinprpDom);
                    }).catch(error => console.log(error));*/

                
                const bodyAyudaPlantas = {
                    "nombreAyuda": "BSQPLANTAS",
                    "p_user": await this.getCurrentUser()
                };

                fetch(`${this.onLocation()}General/AyudasBusqueda/`,
                    {
                        method: 'POST',
                        body: JSON.stringify(bodyAyudaPlantas)
                    })
                    .then(resp => resp.json()).then(data => {
                        plantas = data.data;
                        this.getOwnerComponent().getModel("ComboModel").setProperty("/Plantas", plantas);
                    }).catch(error => console.log(error));

                var modelo = this.getOwnerComponent().getModel("DetalleMarea");
                var listaDominios = [{
                    "domname": "ZCDMMA",
                    "status": "A"
                }, {
                    "domname": "ZDO_ZESMAR",
                    "status": "A"
                }, {
                    "domname": "ZCDTEV",
                    "status": "A"
                }, {
                    "domname": "ZDO_ZINUBC",
                    "status": "A"
                },{
                    "domname": "ZINPRP",
                    "status": "A"
                }];

                var dominios = await TasaBackendService.obtenerDominioVarios(listaDominios);
                if (dominios) {
                    var data = dominios.data;
                    if (data.length > 0) {
                        var motivosMarea = data[0].data;
                        modelo.setProperty("/Utils/BckMotMarea", motivosMarea);

                        var estadosMarea = data[1].data;
                        modelo.setProperty("/Config/datosCombo/EstMar", estadosMarea);

                        var tipoEventos = data[2].data;
                        modelo.setProperty("/Utils/BckTipoEvento", tipoEventos);

                        var indUbic = data[3].data;
                        modelo.setProperty("/Config/datosCombo/UbicPesca", indUbic);

                        var zinprpDom = data[4].data;
                        this.getOwnerComponent().getModel("ComboModel").setProperty("/IndPropiedad", zinprpDom);

                    }
                }

                var resDepartamentos = await TasaBackendService.obtenerDepartamentos(await this.getCurrentUser());
                if (resDepartamentos) {
                    var departamentos = resDepartamentos.data;
                    modelo.setProperty("/Config/datosCombo/Departamentos", departamentos);
                }
                modelo.refresh();

                this.validarRoles();
            },

            onSearchMarea: function (evt) {
                //console.log(evt)
                var selectedItem = evt.getParameter("item").getBindingContext("PlantasModel").getObject();
                var modelo = this.getOwnerComponent().getModel("DetalleMarea");
                var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.Session);
                if (selectedItem.cdtem && selectedItem.cdpta) {
                    var oGlobalBusyDialog = new sap.m.BusyDialog();
                    var cdtem = selectedItem.cdtem;
                    var cdpta = selectedItem.cdpta;
                    var txtCabecera = selectedItem.text + " - " + selectedItem.descr;
                    this.getView().byId("idObjectHeader").setTitle(txtCabecera);
                    modelo.setProperty("/Form/CDPTA", cdpta);
                    modelo.setProperty("/Form/CDPTA", cdpta);
                    this.CDTEM = cdtem;
                    this.CDPTA = cdpta;
                    oStore.put("CDTEM", cdtem);
                    oStore.put("CDPTA", cdpta);
                    this.filtarMareas(cdtem, cdpta);
                    oGlobalBusyDialog.close();
                }
            },



            onNavToDetailMaster: function () {

            },

            onActionCrearMarea: async function () {
                //abrir poup
                BusyIndicator.show(0);
                var me = this;
                var modeloDetalleMarea = me.getOwnerComponent().getModel("DetalleMarea");
                var dataDetalleMarea = modeloDetalleMarea.getData();
                var currentUser = await this.getCurrentUser();
                var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.Session);
                var cdpta = oStore.get("CDPTA");
                await this.clearAllData();
                modeloDetalleMarea.refresh();
                await TasaBackendService.obtenerPlantas(currentUser).then(function (plantas) {
                    dataDetalleMarea.Config.datosCombo.Plantas = plantas.data; // cargar combo plantas nueva marea
                    modeloDetalleMarea.setProperty("/Form/CDEMB", "");
                    modeloDetalleMarea.setProperty("/Form/NMEMB", "");
                    modeloDetalleMarea.setProperty("/Form/CDPTA", cdpta);
                    modeloDetalleMarea.refresh();
                }).catch(function (error) {
                    console.log("ERROR: Main.onInit - " + error);
                });
                BusyIndicator.hide();
                console.log("MODELO ABRIR POUP: ", modeloDetalleMarea);
                me.getDialog().open();
            },

            onCancelMarea: function () {
                var modelo = this.getOwnerComponent().getModel("DetalleMarea");
                var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.Session);
                var initData = oStore.get('InitData');
                modelo.setData(initData);
                modelo.refresh();
                this.getDialog().close();
            },

            onCrearMarea: async function () {
                //var me = this;
                this.getDialog().close();
                BusyIndicator.show(0);
                var modelo = this.getOwnerComponent().getModel("DetalleMarea");
                var codPlanta = modelo.getProperty("/Form/CDPTA");
                var embarcacion = modelo.getProperty("/Form/CDEMB");
                var validarBodegaCert = await this.validarBodegaCert(embarcacion, codPlanta);
                if (validarBodegaCert) {
                    var validacionMareaProduce = await this.ValidacionMareaProduce(embarcacion, codPlanta);
                    if (validacionMareaProduce) {
                        //await this.prepareNewRecord();
                        var buscarEmba = await this.buscarEmbarcacion(embarcacion);
                        if (buscarEmba) {
                            var modeloListaMareas = this.getOwnerComponent().getModel("ListaMareas");
                            var modeloPlantas = this.getOwnerComponent().getModel("PlantasModel");
                            var constantsUtility = this.getOwnerComponent().getModel("ConstantsUtility");
                            this.getOwnerComponent().setModel(modelo, "DataModelo");
                            this.getOwnerComponent().setModel(modeloListaMareas, "ModeloListaMareas");
                            this.getOwnerComponent().setModel(modeloPlantas, "ModeloPlantasModel");
                            this.getOwnerComponent().setModel(constantsUtility, "ModeloConstants");
                            BusyIndicator.hide();
                            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                            oRouter.navTo("DetalleMarea");
                        } else {
                            BusyIndicator.hide();
                        }
                    } else {
                        BusyIndicator.hide();
                        this.mostrarMessagePopover();
                    }
                } else {
                    BusyIndicator.hide();
                    MessageBox.error(this.oBundle.getText("EMBANOPER", [selectedItem.NMEMB]));
                }
            },

            onEditarCrearMarea: async function (evt) {
                var selectedItem = evt.getSource().getParent().getBindingContext("ListaMareas").getObject();
                var modelo = this.getOwnerComponent().getModel("DetalleMarea");
                var estMarea = selectedItem.ESMAR;
                var embarcacion = selectedItem.CDEMB;
                if (estMarea == "A") {
                    await this.editRecord(selectedItem.NRMAR);
                } else {
                    BusyIndicator.show(0);
                    var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.Session);
                    var codPlanta = modelo.getProperty("/Form/CDPTA") ? modelo.getProperty("/Form/CDPTA") : oStore.get("CDPTA");
                    var validarBodegaCert = await this.validarBodegaCert(embarcacion, codPlanta);
                    if (validarBodegaCert) {
                        var validacionMareaProduce = await this.ValidacionMareaProduce(embarcacion, codPlanta);
                        if (validacionMareaProduce) {
                            await this.prepareNewRecord();
                            var buscarEmba = await this.buscarEmbarcacion(embarcacion);
                            if(buscarEmba){
                                var modeloListaMareas = this.getOwnerComponent().getModel("ListaMareas");
                                var modeloPlantas = this.getOwnerComponent().getModel("PlantasModel");
                                var constantsUtility = this.getOwnerComponent().getModel("ConstantsUtility");
                                this.getOwnerComponent().setModel(modelo, "DataModelo");
                                this.getOwnerComponent().setModel(modeloListaMareas, "ModeloListaMareas");
                                this.getOwnerComponent().setModel(modeloPlantas, "ModeloPlantasModel");
                                this.getOwnerComponent().setModel(constantsUtility, "ModeloConstants");
                                BusyIndicator.hide();
                                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                                //oRouter.navTo("DetalleMarea");

                                oRouter.navTo("DetalleEventoExt");
                            }else{
                                BusyIndicator.hide();
                            }
                        } else {
                            BusyIndicator.hide();
                            this.mostrarMessagePopover();
                        }
                    } else {
                        BusyIndicator.hide();
                        MessageBox.error(this.oBundle.getText("EMBANOPER", [selectedItem.NMEMB]));
                    }
                }
            },

            preparaFormulario: function () {
                var me = this;
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                var modeloDetalleMarea = me.getOwnerComponent().getModel("DetalleMarea");
                var dataDetalleMarea = modeloDetalleMarea.getData();

                modeloDetalleMarea.refresh();
                oRouter.navTo("DetalleMarea");
            },

            /*getCurrentUser: function () {
                return "FGARCIA";
            },*/

            getRolUser: function () {
                return [];//este metodo debe devolver la lista de roles asignado. Ejem. ["Administrador", "Operador"]
            },

            getDialog: function () {
                if (!this.oDialog) {
                    this.oDialog = sap.ui.xmlfragment("com.tasa.registroeventospescav2.view.fragments.NuevaMarea", this);
                    this.getView().addDependent(this.oDialog);
                }
                return this.oDialog;
            },

            onSelectTab: function (evt) {
                var modelo = this.getOwnerComponent().getModel("ListaMareas");
                var key = evt.getParameter("key");
                var totalPescaDeclarada = 0;
                var data = [];
                //var modelo = null;
                if (key.includes("itfPropios")) {
                    //modelo = this.getView().byId("tblMareasPropios").getModel();
                    data = modelo.getProperty("/PropiosFiltro");
                }

                if (key.includes("itfTerceros")) {
                    //modelo = this.getView().byId("tblMareasTerceros").getModel();
                    data = modelo.getProperty("/TercerosFiltro");
                }

                //console.log("DATA: ", data);

                //if (modelo) {
                //var data = modelo.getData();
                if (data.length > 0) {
                    for (let index = 0; index < data.length; index++) {
                        const element = data[index];
                        totalPescaDeclarada += Number(element.CNPCM) ? Number(element.CNPCM) : 0;
                    }
                }
                /*} else {
                    MessageBox.error(this.oBundle.getText("ERRORSELECPESTANIA"));
                }*/
                var ttPescaDeca = totalPescaDeclarada.toString();
                modelo.setProperty("/Utils/TotalPescDecl", ttPescaDeca);
                this.cargarDatosResumenMarea();
                modelo.refresh();
                //this.getView().byId("idObjectHeader").setNumber(ttPescaDeca);
            },

            onActionSelPlanta: function (evt) {
                var utils = this.getModel("Utils");
                var formModel = this.getModel("Form");
                var embarcacion = formModel.getProperty("/Embarcacion");
                if (embarcacion) {
                    utils.setProperty("/BtnEnabled", true);
                }
            },

            getEmbaDialog: function () {
                if (!this.oDialogEmba) {
                    this.oDialogEmba = sap.ui.xmlfragment("com.tasa.registroeventospescav2.view.fragments.Embarcacion", this);
                    this.getView().addDependent(this.oDialogEmba);
                }
                return this.oDialogEmba;
            },

            onAbrirAyudaEmbarcacion: async function (evt) {
                //this.getEmbaDialog().open();
                BusyIndicator.show(0);
                var modeloConst = this.getOwnerComponent().getModel("DetalleMarea");//busquedaEmba
                var usuario = await this.getCurrentUser();
                modeloConst.setProperty("/user/name", usuario);
                modeloConst.setProperty("/Utils/BuscarEmba", true);

                //let sIdInput = oEvent.getSource().getId(),
                let host = modeloConst.getProperty("/HelpHost"),
                    oView = this.getView(),
                    //oModel = this.getModel(),
                    sUrl = host + ".AyudasBusqueda.busqembarcaciones-1.0.0",
                    nameComponent = "busqembarcaciones",
                    idComponent = "busqembarcaciones",
                    oInput = sap.ui.getCore().byId("txtEmba_R");
                
                modeloConst.setProperty("/input", oInput);

                if (!this.DialogComponentEmba) {
                    this.DialogComponentEmba = sap.ui.xmlfragment("com.tasa.registroeventospescav2.view.fragments.Embarcacion", this);
                    oView.addDependent(this.DialogComponentEmba);
                }
                modeloConst.setProperty("/idDialogComp", this.DialogComponentEmba.getId());

                let compCreateOk = function () {
                    BusyIndicator.hide()
                }
                if (this.DialogComponentEmba.getContent().length === 0) {
                    BusyIndicator.show(0);
                    const oContainer = new sap.ui.core.ComponentContainer({
                        id: idComponent,
                        name: nameComponent,
                        url: sUrl,
                        settings: {},
                        componentData: {},
                        propagateModel: true,
                        componentCreated: compCreateOk,
                        height: '100%',
                        // manifest: true,
                        async: false
                    });
                    this.DialogComponentEmba.addContent(oContainer);
                }

                BusyIndicator.hide();
                this.DialogComponentEmba.open();

            },

            onCerrarEmba: function (oEvent) {
                oEvent.getSource().getParent().close();
            },

            validarRoles: function () {
                var modelo = this.getOwnerComponent().getModel("DetalleMarea");
                var rolesRadOpe = modelo.getProperty("/RolesFlota/RolRadOpe");
                var rolIngCOmb = modelo.getProperty("/RolesFlota/RolIngCom");
                var rolesUsuario = this.getRolUser();
                for (let index = 0; index < rolesUsuario.length; index++) {
                    const rol = rolesUsuario[index];
                    if (rolesRadOpe.includes(rol)) {
                        modelo.setProperty("/DataSession/IsRolRadOpe", true);
                    }

                    if (rolIngCOmb.includes(rol)) {
                        modelo.setProperty("/DataSession/IsRollngComb", true);
                    }
                }
                BusyIndicator.hide();
                //modelo.setProperty("/DataSession/RolFlota", true);
            },

            onSelectItemList: function (evt) {
                //console.log(evt);
                var listItem = evt.getSource();
                var expanded = listItem.getExpanded();
                listItem.setExpanded(!expanded);
                console.log(listItem);
            },

            onAnularMarea: async function (evt) {
                var selectedItem = evt.getSource().getParent().getBindingContext("ListaMareas").getObject();
                var modelo = this.getOwnerComponent().getModel("DetalleMarea");
                if (selectedItem) {
                    var me = this;
                    MessageBox.confirm("¿Realmente quiere anular esta marea?, este proceso puede durar varios minutos.", {
                        title: "Anular Marea",
                        onClose: async function (bOk) {
                            if (bOk == "OK") {
                                var anular = await me.anularMarea(selectedItem.NRMAR);
                                if (anular) {
                                    await me.onActualizaMareas();
                                } else {
                                    var messageItems = modelo.getProperty("/Utils/MessageItemsMA");
                                    if (messageItems.length > 0) {
                                        me.mostrarMessagePopover();
                                    }
                                }
                            }
                        }
                    });
                }
            },

            mostrarMessagePopover: function(){
                var oButton = this.getView().byId("messagePopoverBtnMain");
                oMessagePopover.getBinding("items").attachChange(function (oEvent) {
                    oMessagePopover.navigateBack();
                    oButton.setType(this.buttonTypeFormatter("MA"));
                    oButton.setIcon(this.buttonIconFormatter("MA"));
                    oButton.setText(this.highestSeverityMessages("MA"));
                }.bind(this));

                setTimeout(function () {
                    oMessagePopover.openBy(oButton);
                    oButton.setType(this.buttonTypeFormatter("MA"));
                    oButton.setIcon(this.buttonIconFormatter("MA"));
                    oButton.setText(this.highestSeverityMessages("MA"));
                }.bind(this), 100);
            },

            getDataPopUp: async function(value){
                var modelo = this.getOwnerComponent().getModel("DetalleMarea");
                var modeloAydBusqEmba = this.getOwnerComponent().getModel("DetalleMarea");//busquedaEmba
                var flagBuscEmba = modeloAydBusqEmba.getProperty("/Utils/BuscarEmba");
                if(value && flagBuscEmba){
                    var embarcacion = modelo.getProperty("/Form/CDEMB");
                    await this.verificarCambiosCodigo("EMB", embarcacion);
                    modelo.refresh();

                    var newEmba = modelo.getProperty("/Form/CDEMB");
                    if (newEmba) {
                        sap.ui.getCore().byId("btnAceptarCrearMarea").setEnabled(true);
                    } else {
                        sap.ui.getCore().byId("btnAceptarCrearMarea").setEnabled(false);
                    }
                    return newEmba;
                }else{
                    return value;
                }
                //return value;
            },

            onTest: function () {
                console.log("Hiciste click");
                window.open('https://tasaqas.launchpad.cfapps.us10.hana.ondemand.com/site/tasapqas#pescaDeclarada-display?sap-ui-app-id-hint=saas_approuter_com.tasa.pdeclarada', '_blank', 'location=yes,height=570,width=520,scrollbars=yes,status=yes');
                // TasaBackendService.test().then(function (response) {
                //     console.log("Response: ", response);
                // }).catch(function (error) {
                //     console.log("ERROR: DetalleMarea.onTest - ", error);
                // });
            },
            cargarFilas : function(event) {
                console.log(event);
                let otable = event.getSource();
                let lista  = event.getSource().getBinding().oList;
                let rows_d = event.getSource().getAggregation("rows"); 

                for (let index2 = 0; index2 < rows_d.length; index2++) {
                    const element2 = rows_d[index2];
                    if(element2.getAggregation("cells")[7].getProperty("text") === "Abierto"){
                        element2.addStyleClass("tabla");
                    }else if (element2.getAggregation("cells")[7].getProperty("text") === "Cerrado"){
                        element2.addStyleClass("tabla1");
                    }else{
                        element2.addStyleClass("tabla2");
                    }
                        
                }
                // this.byId("tblMareasPropios").refreshRows();
                // this.byId("tblMareasTerceros").refreshRows();
                    
                

                //otable.addStyleClass("tabla1");

                
            },

            onCallUsuario: async function () {
                /*var modelo = this.getOwnerComponent().getModel("DetalleMarea");
                var dataModelo = modelo.getData();
                var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.Session);
                oStore.put("DataModelo", dataModelo);
                var oCrossAppNav = sap.ushell.Container.getService("CrossApplicationNavigation");
                oCrossAppNav.toExternal({
                    target: {
                        semanticObject: "mareaevento",
                        action: "display"
                    }
                });*/

                /*$.ajax({
                    url: 'https://current-user-qas.cfapps.us10.hana.ondemand.com/getuserinfo',
                    type: 'GET',
                    contentType: 'application/x-www-form-urlencoded',
                    success: function(data){
                        console.log("success"+data);
                    },
                    error: function(e){
                        console.log("error: "+e);
                    }
                  });*/

                //var appPath = appId.replaceAll(".", "");
                //var appPath = "03ca268b-52db-4b05-8855-e05a82e96d53.com-tasa-registroeventospescav2.comtasaregistroeventospescav2-1.0.0";
                //var url_data = "./GetUserInfo/getuserinfo";
                //var url_data = "./userinfodetails/getuserinfo";

                /*var aData = jQuery.ajax({
                    method: 'GET',
                    cache: false,
                    headers: {
                        "X-CSRF-Token": "Fetch"
                    },
                    async: false,
                    url: url_data

                }).then(function successCallback(result, xhr, data) {
                    var token = data.getResponseHeader("X-CSRF-Token");
                    var ddd = '';

                }, function errorCallback(xhr, readyState) {
                    var ddd2 = '';
                });
                var gg = 'dfd';*/

                /*
                const oUserInfo = await this.getUserInfoService();
                const sUserId = oUserInfo.getId();
                const sUserEmail = oUserInfo.getEmail();
                const sUserFirstName = oUserInfo.getFirstName();
                const sUserLastName = oUserInfo.getLastName();
                const sUserFullName = oUserInfo.getFullName();
                const sUser = oUserInfo.getUser();


                console.log("oUserInfo: ", oUserInfo);
                console.log("sUserId: ", sUserId);
                console.log("sUserEmail: ", sUserEmail);
                console.log("sUserFirstName: ", sUserFirstName);
                console.log("sUserLastName: ", sUserLastName);
                console.log("sUserFullName: ", sUserFullName);
                console.log("sUser: ", sUser);*/

                /*
                $.ajax({
                    type: 'GET',
                    url: 'https://current-user-qas.cfapps.us10.hana.ondemand.com/getuserinfo',
                    dataType: 'json',
                    beforeSend: function(jqXHR, settings) {
                       // setting a timeout
                       console.log("jqXHR: ", jqXHR);
                       console.log("settings: ", settings);
                    },
                    success: function(data) {
                       console.log(data);
                    },
                    error: function(xhr) { // if error occured
                       
                    },
                    complete: function() {
                       
                    }
                 });*/


                //abrir componente externo

            },

            /*getUserInfoService: function () {
                return new Promise(resolve => sap.ui.require([
                    "sap/ushell/library"
                ], oSapUshellLib => {
                    const oContainer = oSapUshellLib.Container;
                    const pService = oContainer.getServiceAsync("UserInfo"); // .getService is deprecated!
                    resolve(pService);
                }));
            }*/

        });
    });
