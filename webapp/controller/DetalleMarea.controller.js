sap.ui.define([
    "./MainComp.controller",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "../Service/TasaBackendService",
    "sap/ui/core/BusyIndicator",
    "./Utils",
    'sap/m/MessageItem',
    'sap/m/MessagePopover',
    "sap/ui/core/Fragment",
    "../model/formatter"
], function (
    MainComp,
    Controller,
    JSONModel,
    History,
    MessageBox,
    TasaBackendService,
    BusyIndicator,
    Utils,
    MessageItem,
    MessagePopover,
    Fragment,
    formatter
) {
    "use strict";

    var oMessagePopover;

    return MainComp.extend("com.tasa.registroeventospescav2.controller.DetalleMarea", {

        formatter: formatter,

        onInit: async function () {
            this.router = this.getOwnerComponent().getRouter();
            this.router.getRoute("DetalleMarea").attachPatternMatched(this._onPatternMatched, this);
            this.oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            //this.oControllerEvento = sap.ui.controller("com.tasa.registroeventospescav2.controller.DetalleEvento"); 
            this.cargarMessagePopover();

        },

        _onPatternMatched: async function (oEvent) {
            //console.log("PARAM ROUTER: ", oEvent);
            /*var modeloMarea = this.getOwnerComponent().getModel("DetalleMarea");
            var indicador = modeloMarea.getProperty("/Form/INDICADOR");*/

            BusyIndicator.show(0);
            //validar fechas nulas en tabla de eventos
            //this.validaFechaNulaEvt(this);
            /*
            var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.Session);
            var cargaInicial = oStore.get("FlagCargaInicial");
            if (cargaInicial) {
                this.validaFechaNulaEvt(this);
                await this.cargarCombos(this);
                await this.validarVista(this);
            }

            var modeloMarea = this.getOwnerComponent().getModel("DetalleMarea");
            var listaTipoEventos = modeloMarea.getProperty("/Config/datosCombo/ListaTipoEventos");
            this.validaComboTipoEvento(listaTipoEventos);
            */

            //cargar combos
            //await this.cargarCombos(this);

            //obtener datos de distribucion de flota
            //this.obtenerDatosDistribFlota();

            //obtener datos de marea anterior
            //this.obtenerDatosMareaAnt();

            //validacion de reserva de combustible
            //this.validarReservaCombustible();

            //validar limite de veda
            //this.validarLimiteVeda();

            //validaciones de objetos de vista
            //await this.validarVista(this);

            BusyIndicator.hide();
        },

        /**
         * @override
         */
        onAfterRendering: function () {

            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            console.log("MODELO: ", modelo);

            /*
            var tab = this.getView().byId("itbDetalleMarea");
            tab.setSelectedKey("itfDatosGenerales"); 
            */
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
                    path: 'DetalleMarea>/Utils/MessageItemsDM',
                    template: oMessageTemplate
                }
            });
            this.byId("messagePopoverBtn").addDependent(oMessagePopover);
        },

        handleMessagePopoverPress: function (oEvent) {
            oMessagePopover.toggle(oEvent.getSource());
        },

        /*getCurrentUser: function () {
            return "FGARCIA";
        },*/

        onBackListMarea: function () {
            var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.Session);
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            modelo.refresh();

            var bckpData = oStore.get("DataModeloBckp");
            var currentData = modelo.getData();
            
            var jsonBckpData = JSON.stringify(bckpData);
            var jsonCurrentData = JSON.stringify(currentData);

            if(jsonBckpData === jsonCurrentData){
                var initData = oStore.get('InitData');
                modelo.setData(initData);
                modelo.refresh();
                history.go(-1);
                this.actualizarMareas(false);
            }else{
                let that = this;
                var mssg = this.oBundle.getText("CONFIRMSAVEMSSG");
                MessageBox.confirm(mssg, {
                    title: "Descartar Cambios",
                    onClose: function(evt){
                        if(evt == "OK"){
                            //console.log("entrooooooo");
                            var initData = oStore.get('InitData');
                            modelo.setData(initData);
                            modelo.refresh();
                            history.go(-1);
                            that.actualizarMareas(false);
                        }
                    }
                })
            }
        },

        onCrearArmador: function (oEvent) {
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            modelo.setProperty("/Config/visibleBusArmador", false);
            modelo.setProperty("/Config/visibleNueArmador", true);
            modelo.setProperty("/Form/NUEVOARM", true);
            modelo.setProperty("/Form/CDEMP", null);
            modelo.setProperty("/Form/NAME1", null);
            modelo.refresh();
            /*modeloDetalleMarea.setProperty("/Form/NUEVOARM", "X");
            var dataDetalleMarea = modeloDetalleMarea.getData();
            dataDetalleMarea.Config.visibleArmadorComercial = false;
            dataDetalleMarea.Config.visibleLinkCrearArmador = false;
            dataDetalleMarea.Config.visibleArmadorRuc = true;
            dataDetalleMarea.Config.visibleArmadorRazon = true;
            dataDetalleMarea.Config.visibleArmadorCalle = true;
            dataDetalleMarea.Config.visibleArmadorDistrito = true;
            dataDetalleMarea.Config.visibleArmadorProvincia = true;
            dataDetalleMarea.Config.visibleArmadorDepartamento = true;
            dataDetalleMarea.Config.visibleLinkSelecArmador = true;
            modeloDetalleMarea.refresh();*/
        },

        onSeleccionarArmador: function (oEvent) {
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            modelo.setProperty("/Config/visibleBusArmador", true);
            modelo.setProperty("/Config/visibleNueArmador", false);
            modelo.setProperty("/Form/NUEVOARM", false);
            modelo.setProperty("/Form/RUC", null);
            modelo.setProperty("/Form/RAZON", null);
            modelo.setProperty("/Form/CALLE", null);
            modelo.setProperty("/Form/DISTRITO", null);
            modelo.setProperty("/Form/PROVINCIA", null);
            modelo.setProperty("/Form/DEPARTAMENTO", null);
            modelo.refresh();

            /*
            modeloDetalleMarea.setProperty("/Form/NUEVOARM", "");
            var dataDetalleMarea = modeloDetalleMarea.getData();
            dataDetalleMarea.Config.visibleArmadorComercial = true;
            dataDetalleMarea.Config.visibleLinkCrearArmador = true;
            dataDetalleMarea.Config.visibleArmadorRuc = false;
            dataDetalleMarea.Config.visibleArmadorRazon = false;
            dataDetalleMarea.Config.visibleArmadorCalle = false;
            dataDetalleMarea.Config.visibleArmadorDistrito = false;
            dataDetalleMarea.Config.visibleArmadorProvincia = false;
            dataDetalleMarea.Config.visibleArmadorDepartamento = false;
            dataDetalleMarea.Config.visibleLinkSelecArmador = false;
            dataDetalleMarea.Form.RUC = "";
            dataDetalleMarea.Form.RAZON = "";
            dataDetalleMarea.Form.CALLE = "";
            dataDetalleMarea.Form.DISTRITO = "";
            dataDetalleMarea.Form.PROVINCIA = "";
            dataDetalleMarea.Form.DEPARTAMENTO = "";
            modeloDetalleMarea.refresh();*/

        },

        abrirCrearEvento: async function () {
            await this.crearDropDown();
            this.getNuevoEvento().open();

            //modelo.refresh();
            //var listaEventos = modelo.getProperty("/Eventos/Lista");
            //this.getView().byId("ne_tipoEvn").setValue(null);
            /*if (listaEventos.length > 0) {
                var ultimoEvento = listaEventos[listaEventos.length - 1];
                var tipoEvento = ultimoEvento.CDTEV;
                var tipoEvntInt = !isNaN(tipoEvento) ? parseInt(tipoEvento) + 1 : 0;
                var nuevoEvento = tipoEvntInt.toString();
                this.getView().byId("ne_tipoEvn").setSelectedKey(nuevoEvento);
                modelo.setProperty("/Utils/TipoEvento", nuevoEvento);
                modelo.refresh();
            }
            this.getNuevoEvento().open();*/
        },

        crearDropDown: async function(){
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var listaEventos = modelo.getProperty("/Eventos/Lista");
            var motMarea = modelo.getProperty("/Form/CDMMA");
            var numEventos = listaEventos.length;
            var motivoSinZarpe = ["3", "7", "8"];
            var motivoEventHor = ["7", "8"];
            var siniestAcciden = ["8"];
            var horoSiniAccide = ["H", "8", "T"];
            var zarpeSiniAccid = ["1", "8"];
            var llegArriSinAcc = ["2", "5", "8"];
            var llegArriSinAcc2 = ["5", "2", "8"];
            var calaSalSinAcci = ["3", "4", "8"];
            var motivoCalaSDes = ["4", "5", "6"];
            var zarpEspeSinAcc = ["1", "7", "8"];
            var zarpDescSinAcc = ["1", "6", "7", "8"];
            if(motivoSinZarpe.includes(motMarea)){
                if(motivoEventHor.includes(motMarea)){
                    var existeEveHoro = false;
                    for (let index = 0; index < listaEventos.length; index++) {
                        const element = listaEventos[index];
                        if(element.CDTEV == "H"){
                            existeEveHoro = true;
                            this.createFixedValuesEventos(siniestAcciden);
                            break;
                        }
                        if(element.CDTEV == "T"){
                            existeEveHoro = true;
                            this.createFixedValuesEventos(siniestAcciden);
                            break;
                        }
                    }
                    if(!existeEveHoro){
                        this.createFixedValuesEventos(horoSiniAccide);
                    }
                }else{
                    this.createFixedValuesEventos(siniestAcciden);
                }
            }else{
                if(numEventos > 0){
                    var ultimoIndice = numEventos - 1;
                    var ultimoEvento = listaEventos[ultimoIndice];
                    var tipoEvento = ultimoEvento.CDTEV;
                    while (true) {
                        if(tipoEvento == "1"){
                            await this.createFixedValuesEventos(llegArriSinAcc);
                        }else if (tipoEvento == "2" || tipoEvento == "3"){
                            await this.createFixedValuesEventos(calaSalSinAcci);
                        }else if(tipoEvento == "4"){
                            await this.createFixedValuesEventos(llegArriSinAcc2);
                        }else if(tipoEvento == "5" || tipoEvento == "6"){
                            if(tipoEvento == "5" && (ultimoEvento.CDMNP || motivoCalaSDes.includes(motMarea))){
                                await this.createFixedValuesEventos(zarpEspeSinAcc);
                            }else{
                                await this.createFixedValuesEventos(zarpDescSinAcc);
                                modelo.setProperty("/Utils/TipoEvento", "6");
                            }
                        }else if(tipoEvento == "7"){
                            await this.createFixedValuesEventos(zarpeSiniAccid);
                        }else if(tipoEvento == "8"){
                            ultimoIndice--;
                            if(ultimoIndice >= 0){
                                tipoEvento = listaEventos[ultimoIndice].CDTEV;
                                continue;
                            }else{
                                await this.createFixedValuesEventos(zarpeSiniAccid);
                            }
                        }
                        break;
                    }
                }else{
                    await this.createFixedValuesEventos(zarpeSiniAccid);
                }
            }
        },

        createFixedValuesEventos: async function(evento){
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var listaTipoEventos = modelo.getProperty("/Utils/BckTipoEvento");
            var newValues = [];
            for (let index = 0; index < listaTipoEventos.length; index++) {
                const element = listaTipoEventos[index];
                if(evento.includes(element.id)){
                    newValues.push(element);
                }
            }
            modelo.setProperty("/Config/datosCombo/TipoEventos", newValues);
            modelo.setProperty("/Utils/TipoEvento", evento[0]);
            modelo.refresh();
        },

        onEliminarEvento: async function (evt) {
            //console.log(evt.getSource().getParent());
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var eventos = modelo.getProperty("/Eventos/Lista");
            var confirmElimEve = this.oBundle.getText("CONFIRMELIMEVE")
            var that = this;
            if (eventos.length > 0) {
                var ultimoEvento = eventos[eventos.length - 1];
                var inprpEvento = ultimoEvento.INPRP;
                var motivoMarea = modelo.getProperty("/Form/CDMMA");
                if (ultimoEvento.CDTEV !== "6") {
                    MessageBox.confirm(confirmElimEve, {
                        actions: [MessageBox.Action.OK, MessageBox.Action.CLOSE],
                        onClose: async function (sAction) {
                            if (sAction == MessageBox.Action.OK) {
                                await that.eliminarEvento(ultimoEvento);
                            }
                        }
                    });
                } else {
                    if (motivoMarea == "2" && inprpEvento == "P") {
                        if (await that.verificarCambiosDescarga()) {
                            MessageBox.information(this.oBundle.getText("NOANULDESCARGA"));
                        } else {
                            MessageBox.confirm(confirmElimEve, {
                                actions: [MessageBox.Action.OK, MessageBox.Action.CLOSE],
                                onClose: async function (sAction) {
                                    if (sAction == MessageBox.Action.OK) {
                                        await that.eliminarEvento(ultimoEvento);
                                    }
                                }
                            });
                        }
                    } else {
                        MessageBox.confirm(confirmElimEve, {
                            actions: [MessageBox.Action.OK, MessageBox.Action.CLOSE],
                            onClose: async function (sAction) {
                                if (sAction == MessageBox.Action.OK) {
                                    await that.eliminarEvento(ultimoEvento);
                                }
                            }
                        });
                    }
                }
            } else {
                MessageBox.information("No hay eventos para eliminar");
            }
        },

        eliminarEvento: async function (object) {
            BusyIndicator.show(0);
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var motivoMarea = modelo.getProperty("/Form/CDMMA");
            var indPropPlanta = object.INPRP;
            var indicador = object.Indicador;
            var tipoEvento = object.CDTEV;
            var marea = modelo.getProperty("/Form/NRMAR");
            var nroEvento = !isNaN(object.NREVN) ? parseInt(object.NREVN) : 0;
            var usuario = await this.getCurrentUser();
            var eliminarEvento = true;
            var objEveElim = {
                NREVN: 0,
                EEHorometros: [],
                EEBodegas: [],
                EEPescaDeclarada: [],
                EEPescaDescargada: []
            }

            //eliminar biometria
            var listaBiometriaElim = modelo.getProperty("/Eventos/ListaBiometriaElim");
            var objBiometriaElim = {
                NRMAR: marea,
                NREVN: nroEvento
            };
            listaBiometriaElim.push(objBiometriaElim);

            if (indicador == "E") {
                objEveElim.NREVN = nroEvento;

                var eveVisTabHorom = ["1", "5", "6", "H", "T"];
                if (eveVisTabHorom.includes(tipoEvento)) {
                    var horoElim = await TasaBackendService.obtenerEveElim(marea, nroEvento, "HOROM", usuario);
                    if (horoElim) {
                        objEveElim.EEHorometros = horoElim.data;
                    }
                }

                if (motivoMarea == "1" && tipoEvento == "3") {
                    var bodgElim = await TasaBackendService.obtenerEveElim(marea, nroEvento, "BODG", usuario);
                    if (bodgElim) {
                        objEveElim.EEBodegas = bodgElim.data;
                    }
                }

                if (tipoEvento == "3") {
                    var pesDcl = await TasaBackendService.obtenerEveElim(marea, nroEvento, "PESCD", usuario);
                    if (pesDcl) {
                        objEveElim.EEPescaDeclarada = pesDcl.data;
                    }
                }

                if (tipoEvento == "6") {
                    var bOk = true;
                    bOk = await this.anularDescargaMarea(object.NRDES, true, nroEvento);
                    if (!bOk) {
                        eliminarEvento = false;
                        var messageItems = modelo.getProperty("/Utils/MessageItemsDM");
                        if (messageItems.length > 0) {
                            var oButton = this.getView().byId("messagePopoverBtn");
                            oMessagePopover.getBinding("items").attachChange(function (oEvent) {
                                oMessagePopover.navigateBack();
                                oButton.setType(this.buttonTypeFormatter("DM"));
                                oButton.setIcon(this.buttonIconFormatter("DM"));
                                oButton.setText(this.highestSeverityMessages("DM"));
                            }.bind(this));

                            setTimeout(function () {
                                oMessagePopover.openBy(oButton);
                                oButton.setType(this.buttonTypeFormatter("DM"));
                                oButton.setIcon(this.buttonIconFormatter("DM"));
                                oButton.setText(this.highestSeverityMessages("DM"));
                            }.bind(this), 100);
                            modelo.setProperty("/Config/visibleDetalleEvento", false);
                            modelo.setProperty("/Config/visibleAgregarEvento", false);
                            modelo.setProperty("/Config/visibleEliminarEvento", false);
                        } else {
                            modelo.setProperty("/Config/visibleDetalleEvento", true);
                            modelo.setProperty("/Config/visibleAgregarEvento", true);
                            modelo.setProperty("/Config/visibleEliminarEvento", true);
                        }
                    }

                    var pescaDescElim = [{
                        NRDES: object.NRDES,
                        CDSPC: object.CDSPC
                    }];
                    //modelo.setProperty("/Eventos/EvenEliminados/EEPescaDescargada", pescaDescElim);
                    objEveElim.EEPescaDescargada = pescaDescElim;

                    var objPrecMareElim = {
                        CDSPC: object.CDSPC
                    };
                    var listaPrecMarElim = modelo.getProperty("/Eventos/PreciosMareaElim");
                    listaPrecMarElim.push(objPrecMareElim);

                }

                var listaEvtElim = modelo.getProperty("/Eventos/EvenEliminados");
                listaEvtElim.push(objEveElim);

                if (!eliminarEvento) {
                    var listaEventos = modelo.getProperty("/Eventos/Lista");
                    listaEventos.pop();
                }

            } else {
                if (tipoEvento == "1") {
                    //limpiar modelo espera marea ant
                    //este modelo se llena cuando se abre la vista crear evento espera
                }
            }

            if (eliminarEvento) {
                var listaEventos = modelo.getProperty("/Eventos/Lista");
                listaEventos.pop();
            }

            var validarMareaEventos = await sap.ui.controller("com.tasa.registroeventospescav2.controller.DetalleEvento").validarMareaEventos(this);
            if (!validarMareaEventos) {
                this.setVisibleBtnSave(false, false);
                modelo.setProperty("/Config/readOnlyMotMarea", false);
            }

            modelo.refresh();
            console.log("MODELO: ", modelo);
            BusyIndicator.hide();
        },

        verificarCambiosDescarga: async function () {
            let mod = this.getOwnerComponent().getModel("DetalleMarea");
            mod.setProperty("/Utils/TipoConsulta", "E");
            let listaEventos = mod.getProperty("/Eventos/Lista");
            mod.setProperty("/Eventos/LeadSelEvento", listaEventos.length - 1);
            await sap.ui.controller("com.tasa.registroeventospescav2.controller.DetalleEvento").cargarEstrucuturas(this);
            await sap.ui.controller("com.tasa.registroeventospescav2.controller.DetalleEvento").cargarServiciosPreEvento(this);
            let bol = await sap.ui.controller("com.tasa.registroeventospescav2.controller.DetalleEvento").verificarCambiosDescarga_eve(listaEventos.length - 1, this);
            //VALIDAR CON ERICK ESTE METODO POR QUE ES DE EVENTOCUST
            return bol;
        },

        anularDescarga: function () {
            //VALIDAR CON ERICK ESTE METODO POR QUE ES DE EVENTOCUST
            return true;
        },

        getNuevoEvento: function () {
            if (!this.oDialog) {
                this.oDialog = sap.ui.xmlfragment("com.tasa.registroeventospescav2.view.fragments.NuevoEvento", this);
                this.getView().addDependent(this.oDialog);
            }
            return this.oDialog;
        },

        onCrearEvento: function () {
            let mod = this.getOwnerComponent().getModel("DetalleMarea");
            mod.setProperty("/Utils/TipoConsulta", "C");
            mod.setProperty("/Utils/DescTipoEvento", sap.ui.getCore().byId("ne_tipoEvn").getSelectedItem().getText());
            //mod.setProperty("/Utils/TipoEvento","6");
            var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.Session);
            oStore.put("FlagCargaInicial", false);
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("DetalleEvento");
            //mod.setProperty("/Utils/TipoEvento", null);
            //sap.ui.getCore().byId("ne_tipoEvn").setValue(null);
            mod.refresh();
            this.getNuevoEvento().close();

        },

        onCerrarCrearEvento: function () {
            this.getNuevoEvento().close();

        },

        validarReservaCombustible: function () {
            var usuario = this.getCurrentUser();
            var modeloDetalleMarea = this.getOwnerComponent().getModel("DetalleMarea");
            var dataDetalleMarea = modeloDetalleMarea.getData();
            var indicadorPro = dataDetalleMarea.Form.INPRP;
            var motivoResCombu = ["1", "2", "4", "5", "6", "7", "8"]; // Motivos de marea que pueden reservar combustible
            var motivo = dataDetalleMarea.Form.CDMMA;
            var numeroMarea = dataDetalleMarea.Form.NRMAR;
            var estMar = dataDetalleMarea.Form.ESMAR;
            var eventos = dataDetalleMarea.Eventos.Lista;
            if (eventos) {
                var ultimoEvento = eventos[eventos.length - 1];
                var tipoUltEvento = ultimoEvento.CDTEV;
                if (indicadorPro == "P" && motivoResCombu.includes(motivo)) {
                    TasaBackendService.obtenerNroReserva(numeroMarea, usuario).then(function (response) {
                        dataDetalleMarea.Config.visibleTabReserva = true;
                        var numeroReserva = response.data[0].NRRSV;
                        var mostrarTab = numeroReserva ? true : false;
                        var mareaCerrada = estMar == "C";
                        if (!mareaCerrada) {
                            if (motivo == "3" || motivo == "7" || motivo == "8") {
                                mostrarTab = true;
                            } else {
                                if ((tipoUltEvento == "4" || tipoUltEvento == "5" || tipoUltEvento == "6") && !mostrarTab) {
                                    mostrarTab = true;
                                }

                            }
                        }
                        if (mostrarTab) {
                            if (!mareaCerrada) {


                            } else {

                            }

                        }
                        modeloDetalleMarea.refresh();
                    }).catch(function (error) {
                        console.log("Error: DetalleMarea.validarReservaCombustible - ", error);
                    });
                }
            }


        },

        cargarCombos: async function (context) {
            var me = context;
            var currentUser = await me.getCurrentUser();
            var modeloDetalleMarea = me.getOwnerComponent().getModel("DetalleMarea");
            var dataDetalleMarea = modeloDetalleMarea.getData();

            //combo departamentos
            var resDepartamentos = await TasaBackendService.obtenerDepartamentos(currentUser);
            if (resDepartamentos) {
                var departamentos = resDepartamentos.data;
                modeloDetalleMarea.setProperty("/Config/datosCombo/Departamentos", departamentos);
                //dataDetalleMarea.Config.datosCombo.Departamentos = departamentos;
            }

            var listaDominios = [{
                "domname": "ZCDMMA",
                "status": "A"
            }, {
                "domname": "ZDO_ZINUBC",
                "status": "A"
            }, {
                "domname": "ZDO_ZESMAR",
                "status": "A"
            }, {
                "domname": "ZCDTEV",
                "status": "A"
            }];

            var dominios = await TasaBackendService.obtenerDominioVarios(listaDominios);
            if (dominios) {
                var data = dominios.data;
                if (data.length > 0) {
                    //motivos de marea
                    var motivosMarea = data[0].data;
                    var inprp = modeloDetalleMarea.getProperty("/Form/INPRP");
                    var items = [];
                    if (inprp == "P") {
                        items = motivosMarea
                    } else {
                        for (let index = 0; index < motivosMarea.length; index++) {
                            const element = motivosMarea[index];
                            if (element.id == "1" || element.id == "2") {
                                items.push(element);
                            }
                        }
                    }
                    modeloDetalleMarea.setProperty("/Config/datosCombo/MotivosMarea", items);

                    //indicador de ubicacion
                    var indUbic = data[1].data;
                    modeloDetalleMarea.setProperty("/Config/datosCombo/UbicPesca", indUbic);

                    //estado de marea
                    var estadosMarea = data[2].data;
                    modeloDetalleMarea.setProperty("/Config/datosCombo/EstMar", estadosMarea);

                    //tipos evento
                    var tiposEvento = data[3].data;
                    modeloDetalleMarea.setProperty("/Config/datosCombo/ListaTipoEventos", tiposEvento);
                    dataDetalleMarea.Config.datosCombo.ListaTipoEventos = tiposEvento;
                    //me.validaComboTipoEvento(tiposEvento);
                    modeloDetalleMarea.refresh();
                }
            }
        },

        validaFechaNulaEvt: function (context) {
            var modeloDetalleMarea = context.getOwnerComponent().getModel("DetalleMarea");
            var dataDetalleMarea = modeloDetalleMarea.getData();
            var eventos = dataDetalleMarea.Eventos.Lista;
            if (eventos) {
                for (let index = 0; index < eventos.length; index++) {
                    const element = eventos[index];
                    if (element.FIEVN) {
                        element.FECHOINI = element.FIEVN + " " + element.HIEVN;
                    } else {
                        element.FECHOINI = "";
                    }
                    if (element.FFEVN) {
                        element.FECHOFIN = element.FFEVN + " " + element.HFEVN;
                    } else {
                        element.FECHOFIN = "";
                    }
                }
            }
            modeloDetalleMarea.refresh();
        },

        obtenerDatosDistribFlota: async function (ctx) {
            var me = ctx;
            var modeloDetalleMarea = me.getOwnerComponent().getModel("DetalleMarea");
            var dataDetalleMarea = modeloDetalleMarea.getData();
            var embarcacion = dataDetalleMarea.Form.CDEMB;
            var currentUser = await this.getCurrentUser();
            var distFlota = dataDetalleMarea.DistribFlota;
            TasaBackendService.obtenerDatosDstrFlota(embarcacion, currentUser).then(function (response) {
                for (var keyD in distFlota) {
                    if (response.hasOwnProperty(keyD)) {
                        distFlota[keyD] = response[keyD];
                    }
                }
            }).catch(function (error) {
                console.log("ERROR: DetalleMarea.obtenerDatosDistribFlota - ", error);
            });
        },

        obtenerDatosMareaAnt: async function () {
            var me = this;
            var modeloDetalleMarea = me.getOwnerComponent().getModel("DetalleMarea");
            var dataDetalleMarea = modeloDetalleMarea.getData();
            var estMar = dataDetalleMarea.Form.ESMAR;
            var currentUser = await this.getCurrentUser();
            console.log("Est Mar: " + estMar);
            if (estMar == "A") {
                var embarcacion = dataDetalleMarea.Form.CDEMB;
                var marea = dataDetalleMarea.Form.NRMAR;
                TasaBackendService.obtenerMareaAnterior(marea, embarcacion, currentUser).then(function (response) {
                    //preparar servicio para obtener marea anterior
                }).catch(function (error) {
                    console.log("ERROR: DetalleMarea.obtenerDatosMareaAnt - ", error);
                });
            }
        },

        onValidaMotivo: async function (evt) {
            BusyIndicator.show(0);
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            modelo.setProperty("/Utils/MessageItemsDM", []);
            var motivo = modelo.getProperty("/Form/CDMMA");
            modelo.setProperty("/Form/CDMMA", null)
            await this.onActionBuscarEmbarcacion();
            modelo.setProperty("/Form/CDMMA", motivo);
            await this.validarMotivoMarea();
            modelo.refresh();
            BusyIndicator.hide();
            
            var listaMensajes = modelo.getProperty("/Utils/MessageItemsDM");
            if(listaMensajes.length > 0){
                this.mostrarMessagePopover();
            }

            /*
            var oValidatedComboBox = evt.getSource();
            var motivo = oValidatedComboBox.getSelectedKey();
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var listaMotivos = modelo.getProperty("/Config/datosCombo/MotivosMarea");
            var objMotivo = listaMotivos.find(obj => obj.id == motivo);
            modelo.setProperty("/Form/DESC_CDMMA", objMotivo.descripcion);
            this.validarMotivoMarea();
            this.validarComboEventos();*/
        },

        onActionBuscarEmbarcacion: async function () {
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var campos = ["/Form/CDEMB"];
            var cdemb = modelo.getProperty("/Form/CDEMB");
            await this.validateFormFields(campos);
            await this.verificarCambiosCodigo("EMB", cdemb);
        },

        validarComboEventos: async function () {
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var motivo = modelo.getProperty("/Form/CDMMA");
            var tmpEventos = [];
            var response = await TasaBackendService.obtenerDominio("ZCDTEV");
            if (response) {
                var eventos = response.data[0].data;
                if (eventos) {
                    //console.log("Eventos: ", eventos);
                    if (motivo == "1" || motivo == "2" || motivo == "4" || motivo == "5" || motivo == "6") {
                        for (let index = 0; index < eventos.length; index++) {
                            const element = eventos[index];
                            if (element.id == "1" || element.id == "8") {
                                tmpEventos.push(element);
                            }
                        }
                    } else if (motivo == "3") {
                        for (let index = 0; index < eventos.length; index++) {
                            const element = eventos[index];
                            if (element.id == "8") {
                                tmpEventos.push(element);
                            }
                        }
                    } else if (motivo == "7" || motivo == "8") {
                        for (let index = 0; index < eventos.length; index++) {
                            const element = eventos[index];
                            if (element.id == "8" || element.id == "H" || element.id == "T") {
                                tmpEventos.push(element);
                            }
                        }
                    }
                }
                modelo.setProperty("/Config/datosCombo/TipoEventos", tmpEventos);
            }
        },

        validarLimiteVeda: function () {
            var me = this;
            var modeloDetalleMarea = me.getOwnerComponent().getModel("DetalleMarea");
            var dataDetalleMarea = modeloDetalleMarea.getData();
            var motMarea = dataDetalleMarea.Form.CDMMA;
            var estMarea = dataDetalleMarea.Form.ESMAR;
            if (motMarea == "8" && estMarea == "A") {
                //preparar servicio para validar limite de veda
            }
        },

        validarVista: async function (context) {
            //ocultar link armador
            //ocultar fecha horta eta
            //ocultar fecha inicio fecha fin
            var modelo = context.getOwnerComponent().getModel("DetalleMarea");
            var indProp = modelo.getProperty("/Form/INPRP");
            var esmar = modelo.getProperty("/Form/ESMAR");
            var indicador = modelo.getProperty("/Form/INDICADOR");

            if (indProp == "P") {
                modelo.setProperty("/Config/visibleLinkCrearArmador", false);
                modelo.setProperty("/Config/visibleBuscarArmador", false);
            } else {
                modelo.setProperty("/Config/visibleLinkCrearArmador", true);
                modelo.setProperty("/Config/visibleBuscarArmador", true);
                if (indicador == "N") {
                    modelo.setProperty("/Form/CDEMP", "");
                    modelo.setProperty("/Form/NAME1", "");
                }
            }

            modelo.setProperty("/Utils/MessageItemsDM", []);
            console.log("BORRA FECHA ETA AQUI 1");
            modelo.setProperty("/Config/visibleFecHoEta", false);
            modelo.setProperty("/Config/visibleFechIni", false);
            modelo.setProperty("/Config/visibleFechFin", false);
            modelo.setProperty("/Config/visibleUbiPesca", false);
            //modelo.setProperty("/Config/visibleTabReserva", false);
            //modelo.setProperty("/Config/visibleTabVenta", false);
            modelo.setProperty("/Config/visibleTabSepComb", false);
            modelo.setProperty("/Config/visibleBtnGuardar", true);
            modelo.setProperty("/Config/visibleBtnSiguiente", false);
            if (indicador == "N") {
                modelo.setProperty("/Config/readOnlyMotMarea", true);
                modelo.setProperty("/Config/visibleTabReserva", false);
                modelo.setProperty("/Config/visibleTabSepComb", false);
                modelo.setProperty("/Config/visibleTabVenta", false);
                //modelo.setProperty("/Config/visibleBtnGuardar", true);
                modelo.setProperty("/Config/visibleBtnSiguiente", false);
            } else {
                var motivoMarea = modelo.getProperty("/Form/CDMMA");
                context.validarMotivo(motivoMarea);
                //modelo.setProperty("/Config/visibleBtnGuardar", true);
                modelo.setProperty("/Config/readOnlyMotMarea", false);
                await context.validaDescargas();
            }

            if (esmar == "C") {
                modelo.setProperty("/Config/enableBtnArmador", false);
                modelo.setProperty("/Config/visibleAgregarEvento", false);
                modelo.setProperty("/Config/visibleEliminarEvento", false);
                modelo.setProperty("/Config/readOnlyMotMarea", false);
                modelo.setProperty("/Config/visibleBtnGuardar", false);
                modelo.setProperty("/Config/visibleBtnSiguiente", false);
                modelo.setProperty("/Config/visibleLinkCrearArmador", false);
                modelo.setProperty("/Config/readOnlyMotMarea", false);
                modelo.setProperty("/Config/readOnlyUbicPesca", false);
                modelo.setProperty("/Config/readOnlyEstaMar", false);
                modelo.setProperty("/Config/readOnlyObs", false);
                modelo.setProperty("/Config/readOnlyFechaEta", false);
                modelo.setProperty("/Config/readOnlyHoraEta", false);
                modelo.setProperty("/Config/readOnlyFechIni", false);
                modelo.setProperty("/Config/readOnlyFechFin", false);
                modelo.refresh();
            }
        },

        onSelectTabMarea: async function (evt) {
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var soloLectura = modelo.getProperty("/DataSession/SoloLectura");
            var key = evt.getParameter("key");
            var previousKey = evt.getParameter("previousKey");
            var iconTabBar = this.getView().byId("itbDetalleMarea");
            if (key == "itfEventos" && previousKey == "itfDatosGenerales") {
                if(!soloLectura){
                    var bOk = await this.validarDatosMarea();
                    if(!bOk){
                        iconTabBar.setSelectedKey("itfDatosGenerales");
                        this.mostrarMessagePopover();
                    }
                }
            }
        },

        validarMotivoUbiPesca: function () {
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var motivo = modelo.getProperty("/Form/CDMMA");
            var ubicPesca = modelo.getProperty("/Form/INUBC");
            var bOk = true;
            if (!motivo) {
                modelo.setProperty("/Utils/MessageItemsDM", []);
                bOk = false;
                //iconTabBar.setSelectedKey("itfDatosGenerales");
                var mssg = this.oBundle.getText("MISSMOTMAR");
                //MessageBox.error(mssg);
                var objMessage = {
                    type: 'Error',
                    title: 'Mensaje de Error',
                    activeTitle: false,
                    description: mssg,
                    subtitle: mssg,
                    counter: 1
                };
                var messageItems = modelo.getProperty("/Utils/MessageItemsDM");
                messageItems.push(objMessage);
                modelo.refresh();

                var oButton = this.getView().byId("messagePopoverBtn");
                oMessagePopover.getBinding("items").attachChange(function (oEvent) {
                    oMessagePopover.navigateBack();
                    oButton.setType(this.buttonTypeFormatter("DM"));
                    oButton.setIcon(this.buttonIconFormatter("DM"));
                    oButton.setText(this.highestSeverityMessages("DM"));
                }.bind(this));

                setTimeout(function () {
                    oMessagePopover.openBy(oButton);
                    oButton.setType(this.buttonTypeFormatter("DM"));
                    oButton.setIcon(this.buttonIconFormatter("DM"));
                    oButton.setText(this.highestSeverityMessages("DM"));
                }.bind(this), 100);

            } else {
                if (motivo == "3" || motivo == "7" || motivo == "8") {
                    if (!ubicPesca) {
                        bOk = false;
                        //iconTabBar.setSelectedKey("itfDatosGenerales");
                        var mssg = this.oBundle.getText("MISSUBICPESCA");
                        MessageBox.error(mssg);
                    }
                }
            }
            return bOk;
        },

        onNavEventos: function (evt) {
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var object = evt.getSource().getParent().getBindingContext("DetalleMarea").getObject();
            var indexEvento = object.NREVN - 1;
            modelo.setProperty("/Utils/TipoConsulta", "E");
            modelo.setProperty("/Eventos/LeadSelEvento", indexEvento);
            modelo.setProperty("/Utils/DescTipoEvento", object.DESC_CDTEV);
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("DetalleEvento");
        },

        onSave: async function () {
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var validarMareaEventos = sap.ui.controller("com.tasa.registroeventospescav2.controller.DetalleEvento").validarMareaEventos(this);
            var tieneErrores = modelo.getProperty("/Form/TERRORES");
            if (validarMareaEventos) {
                if (!tieneErrores) {
                    modelo.setProperty("/Utils/VisibleObsvComb", false);
                    var bOk = await this.validarDatosMarea();
                    if(bOk){
                        this.prepararVistaConfirm();
                        this.getConfirmDialog().open();
                    }else{
                        this.mostrarMessagePopover();
                    }
                }
            }
            //this.getConfirmSaveDialogTest().open();
        },

        onCloseConfirmMarea: async function () {
            this.getConfirmDialog().close();
            await this.SaveGeneral();
            // var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            // var visbleObsComb = modelo.getProperty("/Utils/VisibleObsvComb");
            // var obsComb = modelo.getProperty("/Form/OBSCOMB");
            // if(visbleObsComb && !obsComb){
            //     var mssg = this.oBundle.getText("MISSOBSCOMB");;
            //     MessageBox.error(mssg);
            // }else{
            //     await this.guardarCambios();
            // }
        },

        getConfirmDialog: function () {
            if (!this.oDialogConfirm) {
                this.oDialogConfirm = sap.ui.xmlfragment("com.tasa.registroeventospescav2.view.fragments.ConfirmMarea", this);
                this.getView().addDependent(this.oDialogConfirm);
            }
            return this.oDialogConfirm;
        },

        onCancelConfirmMarea: function () {
            this.getConfirmDialog().close();
        },

        validarDatosMarea: async function () {
            BusyIndicator.show(0);
            var bOk = true;
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var motivo = modelo.getProperty("/Form/CDMMA");
            var estado = modelo.getProperty("/Form/ESMAR");
            var esNuevo = modelo.getProperty("/Form/EsNuevo");
            var motivoSinZarpe = ["3", "7", "8"];
            var embarcacion = modelo.getProperty("/Form/CDEMB");
            modelo.setProperty("/Utils/MessageItemsDM", []);
            var campos = [];
            if (esNuevo) {
                campos = ["/Form/CDEMB", "/Form/CDMMA", "/Form/INUBC"];
                if (!motivoSinZarpe.includes(motivo)) {
                    var nuevoArmadorFlag = modelo.getProperty("/Form/NUEVOARM");
                    if (nuevoArmadorFlag) {
                        campos = ["/Form/RUC", "/Form/RAZON", "/Form/CALLE", "/Form/DISTRITO",
                            "/Form/PROVINCIA", "/Form/DEPARTAMENTO", "/Form/CDEMB", "/Form/CDMMA"];
                    } else {
                        campos = ["/Form/CDEMB", "/Form/CDEMP", "/Form/CDMMA"];
                    }
                }
                if(motivoSinZarpe.includes(motivo)){
                    campos = ["/Form/FIMAR"];
                    if (estado == "C") {
                        campos = ["/Form/FIMAR", "/Form/FFMAR"];
                    }
                }
                if (campos.length > 0) {
                    await this.verificarCambiosCodigo("EMB", embarcacion);
                    await this.validarFechaIniFin();
                }
            } else {
                if (motivoSinZarpe.includes(motivo) && estado == "C") {
                    campos = ["/Form/HIMAR", "/Form/FFMAR"];
                    await this.validarFechaIniFin();
                }
            }
            this.validateFormFields(campos);
            modelo.refresh();
            BusyIndicator.hide();
            var listaMensajes = modelo.getProperty("/Utils/MessageItemsDM");
            if(listaMensajes.length > 0){
                bOk = false;
            }
            return bOk;
        },

        validateFormFields: function (campos) {
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var listaMensajes = modelo.getProperty("/Utils/MessageItemsDM");
            for (let index = 0; index < campos.length; index++) {
                const path = campos[index];
                var value = modelo.getProperty(path);
                var nroMensaje = 0;
                if (!value) {
                    nroMensaje++;
                    var etiqueta = Utils.getEtiqueta(path);
                    var mssg = this.oBundle.getText("MISSFORMFIELD", [etiqueta]);
                    var objMessage = {
                        type: 'Error',
                        title: 'Mensaje de Validación',
                        activeTitle: false,
                        description: mssg,
                        subtitle: mssg,
                        counter: nroMensaje
                    };
                    listaMensajes.push(objMessage);
                    modelo.refresh();
                }
            }
        },

        prepararVistaConfirm: function () {
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            modelo.setProperty("/Utils/VisibleEstCierre", false);
            var texto = this.oBundle.getText("CONFIRMSAVEMESSAGE");
            modelo.setProperty("/Utils/TextoConfirmacion", texto);
            this.verificarCierreMarea();
        },

        verificarCierreMarea: function () {
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var eventos = modelo.getProperty("/Eventos/Lista");
            var estadoMarea = modelo.getProperty("/Form/ESMAR");
            var ultimoEvento = eventos[eventos.length - 1];
            var cantTotalDeclMarea = sap.ui.controller("com.tasa.registroeventospescav2.controller.DetalleEvento").obtenerCantTotalPescaDecla(0, this);
            var cantTotalDeclDescMarea = sap.ui.controller("com.tasa.registroeventospescav2.controller.DetalleEvento").obtenerCantTotalPescaDeclDesc(0, this);
            var motivoMarea = modelo.getProperty("/Form/CDMMA");
            var motivoMarPesca = ["1", "2"];
            var motivoCalaSDes = ["4", "5", "6"];
            var listaMensajes = modelo.getProperty("/Utils/MessageItemsDM");
            if (ultimoEvento) {
                var tipoEvento = ultimoEvento.CDTEV;
                var verEstCierre = false;
                if (tipoEvento == "8") {
                    verEstCierre = true;
                } else if (motivoMarPesca.includes(motivoMarea)) {
                    if ((tipoEvento == "5" || tipoEvento == "6") && cantTotalDeclMarea == cantTotalDeclDescMarea) {
                        verEstCierre = true;

                    } else if (estadoMarea == "C" && tipoEvento == "5" && cantTotalDeclMarea > 0 && cantTotalDeclDescMarea > 0) {
                        verEstCierre = true;
                        var mssg = this.oBundle.getText("CERRPDECMAYPDESC");
                        var index = listaMensajes.length + 1;
                        var objMessage = {
                            type: 'Warning',
                            title: 'Mensaje de Validación',
                            activeTitle: false,
                            description: mssg,
                            subtitle: mssg,
                            counter: index
                        };
                        listaMensajes.push(objMessage);
                        modelo.refresh();
                        ///MessageBox.warning(mssg);
                        var texto = mssg + " " + this.oBundle.getText("CONFIRMSAVEMESSAGE");
                        modelo.setProperty("/Utils/TextoConfirmacion", texto);
                    }
                } else if (motivoCalaSDes.includes(motivoMarea) && tipoEvento == "5") {
                    verEstCierre = true;
                }
                if (verEstCierre) {
                    //sap.ui.getCore().byId("estadoMar").setSelectedKey("C");
                    modelo.setProperty("/Form/ESMAR", "C");
                    modelo.setProperty("/Utils/VisibleEstCierre", true);
                    modelo.refresh();
                }
                return verEstCierre;
            }
            return false;
        },

        onPressNuevoSuministro: function () {
            this.getNuevaMareaDialog().open();
        },

        onCancelNuevaMarea: function () {
            this.getNuevaMareaDialog().close();
        },

        onProcesarSum: async function () {
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var inprp = modelo.getProperty("/Form/INPRP");
            console.log("IND PROPIEDAD: ", inprp);
            if (inprp == "P") {
                await this.onReservar()
            }

            if (inprp == "T") {
                await this.onVender();
            }
        },

        onReservar: async function () {
            BusyIndicator.show(0);
            var validar = await this.validarCabeceraSuministro();
            if (validar) {
                var mssg = this.oBundle.getText("CONFIRMSAVEMESSAGE");
                var me = this;
                MessageBox.confirm(mssg, {
                    title: me.oBundle.getText("CONFIRMSAVETITLE"),
                    actions: ["Aceptar", "Cancelar"],
                    initialFocus: "Aceptar",
                    emphasizedAction: "Aceptar",
                    onClose: async function (evt) {
                        console.log(evt);
                        if (evt == "Aceptar") {
                            BusyIndicator.hide();
                            await me.SaveReserva();
                            me.getNuevaMareaDialog().close();
                        }else{
                            BusyIndicator.hide();
                        }
                    }
                })
            } else {
                BusyIndicator.hide();
            }
        },

        onVender: async function () {
            BusyIndicator.show(0);
            var validar = await this.validarCabeceraSuministro();
            if (validar) {
                var mssg = this.oBundle.getText("CONFIRMSAVEMESSAGE");
                var me = this;
                MessageBox.confirm(mssg, {
                    title: me.oBundle.getText("CONFIRMSAVETITLE"),
                    actions: ["Aceptar", "Cancelar"],
                    initialFocus: "Aceptar",
                    emphasizedAction: "Aceptar",
                    onClose: async function (evt) {
                        console.log(evt);
                        if (evt == "Aceptar") {
                            BusyIndicator.hide();
                            await me.SaveVentaComb();
                            me.getNuevaMareaDialog().close();
                        }else{
                            BusyIndicator.hide();
                        }
                    }
                })
            } else {
                BusyIndicator.hide();
            }
        },

        SaveReserva: async function () {
            BusyIndicator.show(0);
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var val = await this.crearReserva();
            if (val) {
                var me = this;
                var nroReserva = modelo.getProperty("/Utils/NumeroReservaGen");
                var mssg = this.oBundle.getText("NRORESERVAGEN", [nroReserva]);
                MessageBox.success(mssg, {
                    title: "Exito",
                    onClose: async function () {
                        BusyIndicator.hide();
                        await me.obtenerReservas(true);
                        me.getReviewDialog().close();
                    }
                });
            } else {
                BusyIndicator.hide();
            }
        },

        SaveVentaComb: async function () {
            BusyIndicator.show(0);
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var val = await this.crearVentaComb();
            if (val) {
                var me = this;
                var nroPedido = modelo.getProperty("/Utils/NumeroPedidoGen");
                var mssg = this.oBundle.getText("NROPEDIDOGEN", [nroPedido]);
                MessageBox.success(mssg, {
                    title: "Exito",
                    onClose: async function () {
                        BusyIndicator.hide();
                        await me.obtenerVentas(true);
                        me.getNuevaResVenDialog().close();
                    }
                });
            } else {
                BusyIndicator.hide();
            }
        },

        validarCabeceraSuministro: async function () {
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var emba = modelo.getProperty("/Form/CDEMB");
            var bOk = true;
            if (emba) {
                var cantSuministro = modelo.getProperty("/Suministro/0/CNSUM");
                if (cantSuministro) {
                    var cantSuministro = modelo.getProperty("/Suministro/0/CNSUM");
                    if (!isNaN(cantSuministro)) {
                        if (Number(cantSuministro) > 0) {
                            var capTanque = modelo.getProperty("/EmbaComb/CDTAN");
                            var stockComb = modelo.getProperty("/EmbaComb/STCMB");
                            var cantCombTotal = 0;
                            var cantSumProp = 0;
                            if (!isNaN(stockComb) && !isNaN(capTanque)) {
                                cantCombTotal = Number(cantSuministro) + Number(stockComb);
                                cantSumProp = Number(capTanque) - Number(stockComb);
                            }
                            if (cantCombTotal > capTanque) {
                                bOk = false;
                                var mssg = this.oBundle.getText("CAPTANQUESUP", [cantSumProp]);
                                MessageBox.error(mssg);
                            }
                        } else {
                            bOk = false;
                            var mssg = this.oBundle.getText("CANTSUMNOCERO");
                            MessageBox.error(mssg);
                        }
                    } else {
                        bOk = false;
                        var mssg = this.oBundle.getText("CANTSUMNOINT");
                        MessageBox.error(mssg);
                    }
                } else {
                    bOk = false;
                    MessageBox.error("Debe ingresar la cantidad del suministro.");
                }
            } else {
                bOk = false;
                MessageBox.error("No tiene embarcación.");
            }
            return bOk;
        },

        getNuevaMareaDialog: function () {
            if (!this.oDialogNuevoSum) {
                this.oDialogNuevoSum = sap.ui.xmlfragment("com.tasa.registroeventospescav2.view.fragments.NuevoSuministro", this);
                this.getView().addDependent(this.oDialogNuevoSum);
            }
            return this.oDialogNuevoSum;
        },

        onSelectAlmacen: function (evt) {
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var descAlmacen = evt.getParameter("value");
            modelo.setProperty("/Suministro/0/DSALM", descAlmacen);
        },

        onAnularReservas: async function () {
            BusyIndicator.show(0);
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var reservasCombustible = modelo.getProperty("/ReservasCombustible");
            var listReservas = [];
            var indiReservas = [];
            for (let index = 0; index < reservasCombustible.length; index++) {
                const element = reservasCombustible[index];
                if (element.CHKDE) {
                    var obj = {
                        NRRSV: element.NRRSV,
                        NRMAR: element.NRMAR
                    };
                    listReservas.push(obj);
                    indiReservas.push(index);
                }
            }
            if (listReservas.length > 0) {
                var me = this;
                var mssg = this.oBundle.getText("ANULARESERMES");
                var title = this.oBundle.getText("ANULARESERTITLE");
                MessageBox.confirm(mssg, {
                    title: title,
                    onClose: async function (evt) {
                        BusyIndicator.hide();
                        if (evt == "OK") {
                            await me.anularReservas(listReservas, indiReservas);
                        }
                    }
                })
            } else {
                BusyIndicator.hide();
                var mssg = this.oBundle.getText("NORESERVASSELEC");
                MessageBox.error(mssg);
            }
        },

        getReviewDialog: function () {
            if (!this.oDialogReview) {
                this.oDialogReview = sap.ui.xmlfragment("com.tasa.registroeventospescav2.view.fragments.ReviewReserva", this);
                this.getView().addDependent(this.oDialogReview);
            }
            return this.oDialogReview;
        },

        onAbrirDetalleSuministro: async function (evt) {
            var reserva = evt.getSource().getParent().getBindingContext("DetalleMarea").getObject();
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            if (reserva.NRMAR && reserva.NRRSV) {
                var nrmar = reserva.NRMAR;
                var nrrsv = reserva.NRRSV;
                var indProp = modelo.getProperty("/Form/INPRP");
                if (indProp == "P") {
                    modelo.setProperty("/Utils/TituloReviewReVe", "Detalle de la Reserva");
                } else {
                    modelo.setProperty("/Utils/TituloReviewReVe", "Detalle de la Venta");
                }
                var abrirPopup = await this.obtenerDetalleSuministro(nrmar, nrrsv);
                if (abrirPopup) {
                    this.getReviewDialog().open();
                } else {
                    MessageBox.error("No hay detalles de la reserva.");
                }
            } else {
                MessageBox.error("ERROR: No se obtuvo datos");
            }
        },

        onCloseReviewRes: function () {
            this.getReviewDialog().close();
        },

        onAnulaVentaComb: async function () {
            BusyIndicator.show(0);
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var ventasCombustible = modelo.getProperty("/VentasCombustible");
            var listVentas = [];
            var indiVentas = [];
            for (let index = 0; index < ventasCombustible.length; index++) {
                const element = ventasCombustible[index];
                if (element.CHKDE) {
                    var obj = {
                        p_vbeln: element.NRRSV,
                        p_nrmar: element.NRMAR,
                        p_user: await this.getCurrentUser()
                    };
                    listVentas.push(obj);
                    indiVentas.push(index);
                }
            }
            if (listVentas.length > 0) {
                var me = this;
                var mssg = this.oBundle.getText("ANULARESERMES");
                var title = this.oBundle.getText("ANULARPEDIDOTITLE");
                MessageBox.confirm(mssg, {
                    title: title,
                    onClose: async function (evt) {
                        if (evt == "OK") {
                            BusyIndicator.hide();
                            await me.anularVentas(listVentas, indiVentas);

                        }
                    }
                });
            } else {
                BusyIndicator.hide();
                var mssg = this.oBundle.getText("NOPEDIDOSELEC");
                MessageBox.error(mssg);
            }
        },

        onNuevaVentaComb: function () {

        },



        onNuevaReserva: async function () {
            BusyIndicator.show(0);
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var inprp = modelo.getProperty("/Form/INPRP");
            if (inprp == "P") {
                modelo.setProperty("/Config/TxtNuevaVentaRes", "Nueva Reserva");
            }
            if (inprp == "T") {
                modelo.setProperty("/Config/TxtNuevaVentaRes", "Nueva Venta");
            }

            await this.obtenerNuevoSuministro(false);
            BusyIndicator.hide();
            this.getNuevaResVenDialog().open();
        },


        getNuevaResVenDialog: function () {
            if (!this.oDialogNuevaResVent) {
                this.oDialogNuevaResVent = sap.ui.xmlfragment("com.tasa.registroeventospescav2.view.fragments.NuevaReservaVenta", this);
                this.getView().addDependent(this.oDialogNuevaResVent);
            }
            return this.oDialogNuevaResVent;
        },

        onCancelNuevaResVent: function () {
            this.getNuevaResVenDialog().close();
        },

        onNext: function () {
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var valMotUbicPesca = this.validarMotivoUbiPesca();
            var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.Session);
            if (valMotUbicPesca) {
                modelo.setProperty("/Utils/TipoConsulta", "C");
                modelo.setProperty("/Utils/TipoEvento", "1");
                modelo.setProperty("/Utils/DescTipoEvento", "Zarpe");
                oStore.put("FlagCargaInicial", false);
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("DetalleEvento");
                this.getNuevoEvento().close();
            }
        },

        onMostrarFechaFin: function (evt) {
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            //hacer que se limpie si ingresa un calor incorrecto  //EACOSTA 
            let estMarea = modelo.getProperty("/Form/ESMAR");
            modelo.setProperty("/Form/ESMAR", null)
            modelo.setProperty("/Form/ESMAR", estMarea);
            modelo.refresh();
            //*********************************************** */
            var motivoMarea = modelo.getProperty("/Form/CDMMA");
            var estadoMarea = modelo.getProperty("/Form/ESMAR");
            //var listaMensajes = modelo.getProperty("/Utils/MessageItemsDM");
            var motivoSinZarpe = ["3", "7", "8"];
            var cerrar = true;
            modelo.setProperty("/Utils/MessageItemsDM", []);
            if (motivoSinZarpe.includes(motivoMarea)) {
                modelo.setProperty("/Form/FEARR", null);
                modelo.setProperty("/Form/HEARR", null);
                var visibleFecHorFin = modelo.getProperty("/Config/visibleFechFin");
                if (visibleFecHorFin == false) {
                    modelo.setProperty("/Form/FFMAR", null);
                    modelo.setProperty("/Form/HFMAR", null);
                }
                if (estadoMarea == "C") {
                    modelo.setProperty("/Config/visibleFechFin", true);
                    var fechFinMar = modelo.getProperty("/Form/FFMAR");
                    var horFinMar = modelo.getProperty("/Form/HFMAR");
                    if((!fechFinMar && !horFinMar) || (horFinMar == "00:00")){
                        var mssg = this.oBundle.getText("MISSFECHAFINMAREA");
                        MessageBox.error(mssg, {
                            onClose: function(){
                                modelo.setProperty("/Form/ESMAR", "A");
                                modelo.refresh();
                            }
                        });
                    }
                } else {
                    modelo.setProperty("/Config/visibleFechFin", false);
                }
            } else {
                modelo.setProperty("/Form/FIMAR", null);
                modelo.setProperty("/Form/HIMAR", null);
                modelo.setProperty("/Form/FFMAR", null);
                modelo.setProperty("/Form/HFMAR", null);
                modelo.setProperty("/Config/visibleFechFin", false);
                if (estadoMarea == "C") {
                    cerrar = this.verificarCierreMarea();
                    modelo.refresh();
                }
            }

            var listaMensajes = modelo.getProperty("/Utils/MessageItemsDM");
            if (!cerrar) {
                var mssg = this.oBundle.getText("EVENTOSNOCOMPLE");
                /*var indice = listaMensajes.length + 1;
                var objMessage = {
                    type: 'Error',
                    title: 'Mensaje de Validación',
                    activeTitle: false,
                    description: mssg,
                    subtitle: mssg,
                    counter: indice
                };
                listaMensajes.push(objMessage);*/
                MessageBox.error(mssg, {
                    onClose: function(){
                        modelo.setProperty("/Form/ESMAR", "A");
                        modelo.refresh();
                    }
                });
            }

            if (listaMensajes.length > 0) {
                this.mostrarMessagePopover();
            }

        },

        onAbrirArmadorHelp: async function (oEvent) {
            /*var modeloUndefined = new JSONModel();
            this.getOwnerComponent().setModel(modeloUndefined, undefined);*/
            BusyIndicator.show(0);
            var modeloConst = this.getOwnerComponent().getModel("DetalleMarea");
            var usuario = await this.getCurrentUser();
            modeloConst.setProperty("/user/name", usuario);

            //let sIdInput = oEvent.getSource().getId(),
            let host = modeloConst.getProperty("/HelpHost"),
                oView = this.getView(),
                //oModel = this.getModel(),
                sUrl = host + ".AyudasBusqueda.busqarmadores-1.0.0",
                nameComponent = "busqarmadores",
                idComponent = "busqarmadores",
                oInput = this.getView().byId("idArmadorComercial_R");
            modeloConst.setProperty("/input", oInput);

            if (!this.DialogComponent) {
                this.DialogComponent = sap.ui.xmlfragment("com.tasa.registroeventospescav2.view.fragments.NuevoArmador", this);
                oView.addDependent(this.DialogComponent);
            }
            modeloConst.setProperty("/idDialogComp", this.DialogComponent.getId());

            let compCreateOk = function () {
                BusyIndicator.hide()
            }
            if (this.DialogComponent.getContent().length === 0) {
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
                this.DialogComponent.addContent(oContainer);
            }

            BusyIndicator.hide();
            this.DialogComponent.open();
        },

        onCloseDialogArmador: function (oEvent) {
            oEvent.getSource().getParent().close();
        },

        onCallUsuario: function () {

            /*var sUrl = "https://current-user-qas.cfapps.us10.hana.ondemand.com/getuserinfo";
            $.ajax({
                type: "GET",
                url: sUrl,
                async: true,
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                error: function (err) {
                    console.log("ERROR USER INFO: ", err);
                },
                success: function (data, textStatus, jqXHR) {
                    console.log("USER INFO: ", data);
                }

            });*/

        },

        getConfirmSaveDialogTest: function () {
            if (!this.oDialogConfirmSave) {
                this.oDialogConfirmSave = sap.ui.xmlfragment("com.tasa.registroeventospescav2.view.fragments.EventoFinalizado", this);
                this.getView().addDependent(this.oDialogConfirmSave);
            }
            return this.oDialogConfirmSave;
        },

        mostrarMessagePopover: function () {
            var oButton = this.getView().byId("messagePopoverBtn");
            oMessagePopover.getBinding("items").attachChange(function (oEvent) {
                oMessagePopover.navigateBack();
                oButton.setType(this.buttonTypeFormatter("DM"));
                oButton.setIcon(this.buttonIconFormatter("DM"));
                oButton.setText(this.highestSeverityMessages("DM"));
            }.bind(this));

            setTimeout(function () {
                oMessagePopover.openBy(oButton);
                oButton.setType(this.buttonTypeFormatter("DM"));
                oButton.setIcon(this.buttonIconFormatter("DM"));
                oButton.setText(this.highestSeverityMessages("DM"));
            }.bind(this), 100);
        },


    });
});