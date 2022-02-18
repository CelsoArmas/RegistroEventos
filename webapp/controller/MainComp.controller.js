sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "./Utils",
    "../Service/TasaBackendService",
    "sap/m/MessageBox",
    "sap/ui/core/BusyIndicator"
], function (Controller, Utils, TasaBackendService, MessageBox, BusyIndicator) {
    "use strict";

    return Controller.extend("com.tasa.registroeventospescav2.controller.MainComp", {

        existeHormAveriados: false,
        horometrosAveriados: {},

        /**
         * Convenience method for accessing the router.
         * @public
         * @returns {sap.ui.core.routing.Router} the router for this component
         */
        getRouter: function () {
            return sap.ui.core.UIComponent.getRouterFor(this);
        },

        /**
         * Convenience method for getting the view model by name.
         * @public
         * @param {string} [sName] the model name
         * @returns {sap.ui.model.Model} the model instance
         */
        getModel: function (sName) {
            return sap.ui.getCore().getModel(sName);
        },

        /**
         * Convenience method for setting the view model.
         * @public
         * @param {sap.ui.model.Model} oModel the model instance
         * @param {string} sName the model name
         * @returns {sap.ui.mvc.View} the view instance
         */
        setModel: function (oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },

        /**
         * Getter for the resource bundle.
         * @public
         * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
         */
        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        /**
         * Metodo para inicializar variables
         */

        getCurrentUser: async function () {
            const oUserInfo = await this.getUserInfoService();
            const sUserEmail = oUserInfo.getEmail(); //fgarcia@tasa.com.pe
            var emailSplit = sUserEmail.split("@");
            var usuario = emailSplit[0].toUpperCase();
            if (emailSplit[1] == "xternal.biz") {
                usuario = "FGARCIA";
            }
            return usuario;
            //return "FGARCIA";
        },

        getUserInfoService: function () {
            return new Promise(resolve => sap.ui.require([
                "sap/ushell/library"
            ], oSapUshellLib => {
                const oContainer = oSapUshellLib.Container;
                const pService = oContainer.getServiceAsync("UserInfo"); // .getService is deprecated!
                resolve(pService);
            }));
        },

        guardarCambios: async function () {
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var motivoMarea = modelo.getProperty("/Form/CDMMA");
            var estadoMarea = modelo.getProperty("/Form/ESMAR");
            var indPropiedad = modelo.getProperty("/Form/INPRP");
            var mareaReabierta = modelo.getProperty("/DataSession/MareaReabierta");
            var eventos = modelo.getProperty("/Eventos/Lista");
            var eventoIni = null;
            var eventoFin = null;
            var tipoEventoIni = null;
            var tipoEventoFin = null;
            var motivoSinZarpe = ["3", "7", "8"];
            if (motivoSinZarpe.includes(motivoMarea)) {
                var plantaDistrFlota = modelo.getProperty("/DistribFlota/CDPTA");
                modelo.setProperty("/Form/CDPTA", plantaDistrFlota);
            } else {
                eventoIni = eventos[0];
                eventoFin = eventos[eventos.length - 1];
                tipoEventoIni = eventoIni.CDTEV;
                tipoEventoFin = eventoFin.CDTEV;
                modelo.setProperty("/Form/CDPTA", eventoFin.CDPTA);
                modelo.setProperty("/Form/FIMAR", eventoIni.FIEVN);
                modelo.setProperty("/Form/HIMAR", eventoIni.HIEVN);
            }

            if (estadoMarea == "C") {
                if (!mareaReabierta) {
                    modelo.setProperty("/Form/ESCMA", "T");
                }
                if (!motivoSinZarpe.includes(motivoMarea)) {
                    var fechaActual = new Date();
                    var eveVisFechaFin = ["3", "6", "7"];
                    if (eveVisFechaFin.includes(tipoEventoFin)) {
                        modelo.setProperty("/Form/FFMAR", eventoFin.FFEVN);
                        modelo.setProperty("/Form/HFMAR", eventoFin.HFEVN);
                    } else {
                        modelo.setProperty("/Form/FFMAR", eventoFin.FIEVN);
                        modelo.setProperty("/Form/HFMAR", eventoFin.HIEVN);
                    }
                    if (!mareaReabierta) {
                        var existeDesc = false;
                        for (let index = eventos.length - 1; index >= 0; index--) {
                            const element = eventos[index];
                            if (element.CDTEV == "6") {
                                existeDesc = true;
                                let fechContab = element.ListaPescaDescargada[0].FECCONMOV;
                                var fechaContabilizacion = Utils.strDateToDate(fechContab);//pasar fecha de contabilizacion de modelo pesca descargada
                                var diffDays = Utils.daysBetween(fechaContabilizacion, fechaActual);
                                console.log("FECHA CONT: ", fechContab);
                                if (diffDays >= 0) {
                                    modelo.setProperty("/Form/ESCMA", "P");
                                }
                            }
                        }
                        if (!existeDesc && indPropiedad == "P" && !motivoSinZarpe.includes(motivoMarea)) {
                            modelo.setProperty("/Form/ESCMA", "P");
                        }
                    }
                }
            }

            await this.guardarMarea();
            //actualizar obs comb
        },

        guardarMarea: async function () {
            var guardarDatosMarea = await this.guardarDatosMarea();
            if (guardarDatosMarea) {
                var modelo = this.getOwnerComponent().getModel("DetalleMarea");
                var nodMensajes = modelo.getProperty("/Utils/CrearMarea");
                var messageItems = modelo.getProperty("/Utils/MessageItemsDM");
                var nuevo = true;
                var mareaReabierta = true;
                var mensaje = this.getResourceBundle().getText("SUCCESSSAVE");
                var marea = modelo.getProperty("/Form/NRMAR");
                var success = false;
                var warning = false;
                var error = false;

                modelo.setProperty("/Utils/MessageItemsEP", []);
                for (let index = 0; index < nodMensajes.length; index++) {
                    const element = nodMensajes[index];
                    var type = element.cmin;
                    var desc = element.dsmin;

                    if (type == "E") {
                        error = true;
                        var objMessage = {
                            type: 'Error',
                            title: 'Mensaje de Error',
                            activeTitle: false,
                            description: desc,
                            subtitle: desc,
                            counter: index
                        };
                        messageItems.push(objMessage);
                    } else if (type == "W") {
                        warning = true;
                        var objMessage = {
                            type: 'Warning',
                            title: 'Mensaje de Advertencia',
                            activeTitle: false,
                            description: desc,
                            subtitle: desc,
                            counter: index
                        };
                        messageItems.push(objMessage);
                    } else if (type == "S") {
                        success = true;
                    } else if (nuevo && type == "C") {
                        var intMarea = !isNaN(desc) ? parseInt(desc) : 0;
                        modelo.setProperty("/Form/NRMAR", intMarea);
                        success = true;
                        marea = intMarea;

                    }
                }

                var descMotivoMarea = modelo.getProperty("/Form/DESC_CDMMA");
                var codEmba = modelo.getProperty("/Form/CDEMB");
                var nmemb = modelo.getProperty("/Form/NMEMB");
                var txtMareaConfirm = marea + " " + descMotivoMarea;
                var txtEmbaConfirm = codEmba + " " + nmemb;
                modelo.setProperty("/Utils/TxtMareaConfirm", txtMareaConfirm);
                modelo.setProperty("/Utils/TxtEmbaConfirm", txtEmbaConfirm);
                this.getConfirmSaveDialog().open();

                /*
                if(nuevo){
                    modelo.setProperty("/Form/NRMAR", marea);222222
                    mensaje += " " + this.getResourceBundle().getText("NROMAREAGEN") + " " + modelo.getProperty("/Form/NRMAR");
                }

                if(success){
                    var objMessage = {
                        type: 'Success',
                        title: 'Mensaje de Exito',
                        activeTitle: false,
                        description: mensaje,
                        subtitle: mensaje,
                        counter: 1
                    };
                    messageItems.push(objMessage);
                }else{
                    var objMessage = {
                        type: 'Warning',
                        title: 'Mensaje de Advertencia',
                        activeTitle: false,
                        description: mensaje,
                        subtitle: mensaje,
                        counter: 1
                    };
                    messageItems.push(objMessage);
                }
                var oButton = this.getView().byId("messagePopoverBtn");
                oMessagePopover.getBinding("items").attachChange(function (oEvent) {
                    oMessagePopover.navigateBack();
                    oButton.setType(this.buttonTypeFormatter("DM"));
                    oButton.setIcon(this.buttonIconFormatter("DM"));
                    oButton.setText(this.highestSeverityMessages("DM"));
                }.bind(this));

                setTimeout(function () {
                    oMessagePopover.openBy(oButton);
                    oMessagePopover.navigateBack();
                    oButton.setType(this.buttonTypeFormatter("DM"));
                    oButton.setIcon(this.buttonIconFormatter("DM"));
                    oButton.setText(this.highestSeverityMessages("DM"));
                }.bind(this), 100);
                
                */
                //await this.enviarCorreosSiniestro();

            }
        },

        getConfirmSaveDialog: function () {
            if (!this.oDialogConfirmSave) {
                this.oDialogConfirmSave = sap.ui.xmlfragment("com.tasa.registroeventospescav2.view.fragments.EventoFinalizado", this);
                this.getView().addDependent(this.oDialogConfirmSave);
            }
            return this.oDialogConfirmSave;
        },

        prepararDataTree: function (dataTipoEmba, dataPlantas) {
            var modelo = this.getOwnerComponent().getModel("PlantasModel");
            var iconTipoEmba = "sap-icon://sap-box";
            var iconPlantas = "sap-icon://factory";
            var dataTree = [];
            for (let index = 0; index < dataTipoEmba.length; index++) {
                var tmpNodes = [];
                const element = dataTipoEmba[index];
                for (let index1 = 0; index1 < dataPlantas.length; index1++) {
                    const element1 = dataPlantas[index1];
                    var plantasNode = {
                        text: element1.DESCR,
                        ref: iconPlantas,
                        cdtem: element.cdtem,
                        cdpta: element1.CDPTA,
                        descr: element.descr
                    };
                    tmpNodes.push(plantasNode);
                }
                var tipoEmbaNode = {
                    text: element.descr,
                    ref: iconTipoEmba,
                    nodes: tmpNodes
                };
                dataTree.push(tipoEmbaNode);
            }
            modelo.setProperty("/Items", dataTree);
            modelo.refresh();
            /*
            var modelTree = new JSONModel(dataTree);
            this.getView().byId("navigationList").setModel(modelTree);*/
        },

        onNavInicio: async function (evt) {
            BusyIndicator.show(0);
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var modeloAydBusqEmba = this.getOwnerComponent().getModel("DetalleMarea");//busquedaEmba
            modeloAydBusqEmba.setProperty("/Utils/BuscarEmba", false);
            //var view = evt.getSource().getParent().getParent().getProperty("viewName");
            //await this.onActualizaMareas();
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
            var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.Session);
            var cdpta = oStore.get("CDPTA");
            var cdtem = oStore.get("CDTEM");
            this.filtarMareas(cdtem, cdpta);

            var initData = oStore.get('InitData');
            modelo.setData(initData);
            modelo.refresh();

            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("Main");

            BusyIndicator.hide();
        },

        onNavVerMarea: async function (evt) {
            BusyIndicator.show(0);
            var view = evt.getSource().getParent().getParent().getProperty("viewName");
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var modeloAydBusqEmba = this.getOwnerComponent().getModel("DetalleMarea");//busquedaEmba
            modeloAydBusqEmba.setProperty("/Utils/BuscarEmba", false);
            var marea = modelo.getProperty("/Form/NRMAR");
            /*var estadoMarea = modelo.getProperty("/Form/ESMAR");
            var embarcacion = modelo.getProperty("/Form/CDEMB");
            var currentUser = await this.getCurrentUser();*/
            var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.Session);
            var initData = oStore.get('InitData');
            modelo.setData(initData);
            modelo.refresh();
            this.getConfirmSaveDialog().close();
            BusyIndicator.hide();
            await this.editRecord(marea);
            /*var response = await TasaBackendService.obtenerDetalleMarea(marea, currentUser);
            if (response) {
                await this.setDetalleMarea(response, false);
            }*/
            //await this.cargarMarea(marea, estadoMarea, embarcacion, false);
            //BusyIndicator.hide();
            /*var viewName = view.split(".")[4];
            if (viewName == "DetalleMarea") {
                this.getConfirmSaveDialog().close();
                //history.go(-1);
            } else {
                this.getConfirmSaveDialog().close();
                history.go(-1);
            }*/
            //console.log(evt.getSource().getParent().getParent().getProperty("viewName"));
            //this.getConfirmSaveDialog().close();
        },

        setDetalleMarea: async function (data, navegar) {
            BusyIndicator.show(0);
            var me = this;
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            var modeloDetalleMarea = me.getOwnerComponent().getModel("DetalleMarea");
            var dataDetalleMarea = modeloDetalleMarea.getData();
            var marea = data.s_marea[0];
            var eventos = data.s_evento;
            var incidental = data.str_pscinc;
            var biometria = data.str_flbsp;
            var biometriaRes = data.str_flbsp_matched; // AJUSTE DE BIOMETRIA ----EACOSTA
            var motivoResCombu = ["1", "2", "4", "5", "6", "7", "8"];
            var motivoSinZarpe = ["3", "7", "8"];
            await this.clearAllData();//inicalizar valores
            modeloDetalleMarea.setProperty("/Form/INDICADOR", "E");
            //setear cabecera de formulario
            //var cabecera = dataDetalleMarea.Form;
            var cabecera = modeloDetalleMarea.getProperty("/Form");
            for (var keyC in cabecera) {
                if (marea.hasOwnProperty(keyC)) {
                    cabecera[keyC] = marea[keyC];
                }
            }

            //setear pestania datos generales
            //var datsoGenerales = dataDetalleMarea.Form;
            var datsoGenerales = modeloDetalleMarea.getProperty("/Form");
            for (var keyC in datsoGenerales) {
                if (marea.hasOwnProperty(keyC)) {
                    datsoGenerales[keyC] = marea[keyC];
                }
            }

            //cargar dsitribucion de flota
            var codigo = modeloDetalleMarea.getProperty("/Form/CDEMB");
            await this.obtenerDatosDistribFlotaMarea(codigo);


            var estMarea = modeloDetalleMarea.getProperty("/Form/ESMAR");
            var marea = modeloDetalleMarea.getProperty("/Form/NRMAR");
            if (estMarea == "A") {
                await this.obtenerDatosMareaAnt(marea, codigo);
            }



            //setear lista de eventos
            modeloDetalleMarea.setProperty("/Eventos/TituloEventos", "Eventos (" + eventos.length + ")")
            //dataDetalleMarea.Eventos.TituloEventos = "Eventos (" + eventos.length + ")";

            for (let index1 = 0; index1 < eventos.length; index1++) {
                const element = eventos[index1];
                element.Indicador = "E";
                element.LatitudD = Utils.getDegrees(element.LTGEO);
                element.LatitudM = Utils.getMinutes(element.LTGEO);
                element.LongitudD = Utils.getDegrees(element.LNGEO);
                element.LongitudM = Utils.getMinutes(element.LNGEO)
            }

            //dataDetalleMarea.Eventos.Lista = eventos;
            console.log("LISTA EVENTOS: ", eventos);
            modeloDetalleMarea.setProperty("/Eventos/Lista", eventos);
            modeloDetalleMarea.setProperty("/Eventos/BiometriaRest", biometriaRes);   // AJUSTE DE BIOMETRIA ----EACOSTA
            //dataDetalleMarea.Incidental = incidental;
            modeloDetalleMarea.setProperty("/Incidental", incidental);
            //dataDetalleMarea.Biometria = biometria;
            modeloDetalleMarea.setProperty("/Biometria", biometria);

            modeloDetalleMarea.setProperty("/Config/visibleTabReserva", false);
            modeloDetalleMarea.setProperty("/Config/visibleTabVenta", false);
            modeloDetalleMarea.refresh();
            var inprp = modeloDetalleMarea.getProperty("/Form/INPRP");
            var motivo = modeloDetalleMarea.getProperty("/Form/CDMMA");
            if (inprp == "P" && motivoResCombu.includes(motivo)) {
                await this.obtenerReservasCombustible(marea, codigo);
            }

            if (inprp == "T") {
                await this.obtenerVentasCombustible(marea);
            }

            var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.Session);
            var cdpta = oStore.get("CDPTA");
            modeloDetalleMarea.setProperty("/Form/CDPTA", cdpta);
            modeloDetalleMarea.setProperty("/Form/CDPTA", cdpta);
            modeloDetalleMarea.setProperty("/Form/EsNuevo", false);

            if (motivoSinZarpe.includes(motivo)) {
                modeloDetalleMarea.setProperty("/Config/readOnlyFechIni", false);
                console.log("BORRA FECHA ETA AQUI 2");
                modeloDetalleMarea.setProperty("/Config/visibleFecHoEta", false);
                modeloDetalleMarea.setProperty("/Config/visibleFechIni", true);
                modeloDetalleMarea.setProperty("/Config/visibleFechFin", true);
                if (estMarea == "A" && motivo == "8") {

                }
            }

            //la pestania de reserva de combustible y venta de combustible se setean en el Detalle

            //setear config inicial
            /*dataDetalleMarea.Config.visibleLinkSelecArmador = false;
            dataDetalleMarea.Config.visibleArmadorRuc = false;
            dataDetalleMarea.Config.visibleArmadorRazon = false;
            dataDetalleMarea.Config.visibleArmadorCalle = false;
            dataDetalleMarea.Config.visibleArmadorDistrito = false;
            dataDetalleMarea.Config.visibleArmadorProvincia = false;
            dataDetalleMarea.Config.visibleArmadorDepartamento = false;*/

            //refrescar modelo y navegar al detalle
            modeloDetalleMarea.refresh();
            BusyIndicator.hide();
            if (navegar) {
                modeloDetalleMarea.setProperty("/Config/initSelectKeyTab", "itfDatosGenerales");
                oStore.put("FlagCargaInicial", true);
                oRouter.navTo("DetalleMarea");
            } else {
                BusyIndicator.show(0);
                sap.ui.controller("com.tasa.registroeventospescav2.controller.DetalleMarea").validaFechaNulaEvt(this);
                await sap.ui.controller("com.tasa.registroeventospescav2.controller.DetalleMarea").cargarCombos(this);
                await sap.ui.controller("com.tasa.registroeventospescav2.controller.DetalleMarea").validarVista(this);
                BusyIndicator.hide();
            }
            //me.navToExternalComp();
        },

        guardarDatosMarea: async function () {
            var bOk = true;
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var marea = {
                p_user: await this.getCurrentUser(),
                p_indir: modelo.getProperty("/Form/INDICADOR"),
                p_newpr: modelo.getProperty("/Form/NUEVOARM"),
                p_stcd1: modelo.getProperty("/Form/RUC"),
                p_name1: modelo.getProperty("/Form/RAZON"),
                p_stras: modelo.getProperty("/Form/CALLE"),
                p_orto2: modelo.getProperty("/Form/DISTRITO"),
                p_orto1: modelo.getProperty("/Form/PROVINCIA"),
                p_regio: modelo.getProperty("/Form/DEPARTAMENTO"),
                p_dsmma: modelo.getProperty("/Form/CDMMA") == "1" ? "CHD" : null,
                str_marea: [],
                str_evento: [],
                str_equip: [],
                str_horom: [],
                str_psbod: [],
                str_psdec: [],
                str_flbsp_c: [],
                str_flbsp_e: [],
                str_pscinc: [],
                str_desca: [],
                str_simar: [],
                str_prema: [],
                str_disfl: [],
                str_esper: []
            };

            var objMarea = {
                INDTR: modelo.getProperty("/Form/INDICADOR"),
                NRMAR: modelo.getProperty("/Form/NRMAR"),
                CDEMB: modelo.getProperty("/Form/CDEMB"),
                CDEMP: modelo.getProperty("/Form/CDEMP"),
                CDMMA: modelo.getProperty("/Form/CDMMA"),
                INUBC: modelo.getProperty("/Form/INUBC"),
                FEARR: Utils.strDateToDate(modelo.getProperty("/Form/FEARR")),
                //HEARR: modelo.getProperty("/Form/HEARR"),
                HEARR: Utils.strHourToSapHo(modelo.getProperty("/Form/HEARR")),
                OBMAR: modelo.getProperty("/Form/OBMAR"),
                ESMAR: modelo.getProperty("/Form/ESMAR"),
                //FEMAR: Utils.strDateToDate(modelo.getProperty("/Form/FEMAR")),
                //HAMAR: modelo.getProperty("/Form/HAMAR"),
                //HAMAR: Utils.strHourToSapHo(modelo.getProperty("/Form/HAMAR")),
                FIMAR: Utils.strDateToDate(modelo.getProperty("/Form/FIMAR")),
                //HIMAR: modelo.getProperty("/Form/HIMAR"),
                HIMAR: Utils.strHourToSapHo(modelo.getProperty("/Form/HIMAR")),
                FFMAR: Utils.strDateToDate(modelo.getProperty("/Form/FFMAR")),
                //HFMAR: modelo.getProperty("/Form/HFMAR"),
                HFMAR: Utils.strHourToSapHo(modelo.getProperty("/Form/HFMAR")),
                CDPTA: modelo.getProperty("/Form/CDPTA"),
                ESCMA: modelo.getProperty("/Form/ESCMA"),
                FCCRE: Utils.strDateToDate(modelo.getProperty("/Form/FCCRE")),
                //HRCRE: modelo.getProperty("/Form/HRCRE"),
                HRCRE: Utils.strHourToSapHo(modelo.getProperty("/Form/HRCRE")),
                ATCRE: modelo.getProperty("/Form/ATCRE"),
                FCMOD: Utils.strDateToDate(modelo.getProperty("/Form/FCMOD")),
                //HRMOD: modelo.getProperty("/Form/HRMOD"),
                HRMOD: Utils.strHourToSapHo(modelo.getProperty("/Form/HRMOD")),
                ATMOD: modelo.getProperty("/Form/ATMOD")
            };

            var estadoMarea = modelo.getProperty("/Form/ESMAR");
            if (estadoMarea == "C") {
                var currentDate = new Date();
                objMarea.FXMAR = currentDate;
                objMarea.HXMAR = Utils.strHourToSapHo(Utils.dateToStrHours(currentDate)),
                    objMarea.AXMAR = await this.getCurrentUser();
            }

            var esNuevo = modelo.getProperty("/Form/EsNuevo");
            if (esNuevo) {
                var currentDate = new Date();
                objMarea.FEMAR = currentDate;
                objMarea.HAMAR = Utils.strHourToSapHo(Utils.dateToStrHours(currentDate)),
                    objMarea.AAMAR = await this.getCurrentUser();
            }

            marea.str_marea.push(objMarea);
            var equipamientos = [];
            var horometros = [];
            var pescaDeclarada = [];
            var pescaBodega = [];
            var pescaDescargada = [];
            var siniestros = [];
            var eventos = modelo.getProperty("/Eventos/Lista");
            var motivoMarea = modelo.getProperty("/Form/CDMMA");
            var eveVisTabEquip = ["1", "5"];
            var eveVisTabHorom = ["1", "5", "6", "H", "T"];
            var flagSaveEventos = modelo.getProperty("/Utils/TipoConsulta");
            var eventosEliminados = modelo.getProperty("/Eventos/EvenEliminados");
            var nroMarea = modelo.getProperty("/Form/NRMAR");

            for (let index1 = 0; index1 < eventosEliminados.length; index1++) {
                const element1 = eventosEliminados[index1];
                var horoElim = element1.EEHorometros;
                var bodElim = element1.EEBodegas;
                var pescDeclElim = element1.EEPescaDeclarada;
                var pescDescElim = element1.EEPescaDescargada;
                var evtElim = {
                    INDTR: "D",
                    NRMAR: nroMarea,
                    NREVN: element1.NREVN
                };
                marea.str_evento.unshift(evtElim);

                for (let index2 = 0; index2 < horoElim.length; index2++) {
                    const element2 = horoElim[index2];
                    var objHoroElim = {
                        INDTR: "D",
                        NRMAR: nroMarea,
                        NREVN: element1.NREVN,
                        CDTHR: element2.CDTHR
                    };
                    marea.str_horom.unshift(objHoroElim);
                }

                for (let index3 = 0; index3 < bodElim.length; index3++) {
                    const element3 = bodElim[index3];
                    var objBodElim = {
                        INDTR: "D",
                        NRMAR: nroMarea,
                        NREVN: element1.NREVN,
                        CDBOD: element3.CDBOD
                    };
                    marea.str_psbod.unshift(objBodElim);
                }

                for (let index4 = 0; index4 < pescDeclElim.length; index4++) {
                    const element4 = pescDeclElim[index4];
                    var objPescDeclElim = {
                        INDTR: "D",
                        NRMAR: nroMarea,
                        NREVN: element1.NREVN,
                        CDSPC: element4.CDSPC
                    };
                    marea.str_psdec.unshift(objPescDeclElim);
                }

                for (let index5 = 0; index5 < pescDescElim.length; index5++) {
                    const element5 = pescDescElim[index5];
                    var objPescDesc = {
                        INDTR: "D",
                        INDJ: null,
                        NRDES: element5.NRDES
                    };
                    marea.str_desca.unshift(objPescDesc);
                }

            }

            for (let index = 0; index < eventos.length; index++) {
                let obs = "";
                var element = eventos[index];


                if ((element.KMEVN != "" && element.KMEVN != undefined) && (element.ObseAdicional != "" && element.ObseAdicional != undefined)) {
                    obs = element.KMEVN + " " + element.ObseAdicional;
                } else if (element.KMEVN != "") {
                    obs = element.KMEVN;
                } else {
                    obs = element.ObseAdicional ? element.ObseAdicional : "";
                }

                var evt = {
                    INDTR: element.INDTR == "N" ? "N" : "E",
                    NRMAR: element.NRMAR,
                    NREVN: element.NREVN,
                    CDTEV: element.CDTEV,
                    FIEVN: Utils.strDateToSapDate(element.FIEVN), //yyyyMMdd
                    HIEVN: Utils.strHourToSapHo(element.HIEVN),
                    FFEVN: Utils.strDateToSapDate(element.FFEVN),
                    HFEVN: Utils.strHourToSapHo(element.HFEVN),
                    FICAL: Utils.strDateToSapDate(element.FICAL),
                    HICAL: Utils.strHourToSapHo(element.HICAL),
                    FFCAL: Utils.strDateToSapDate(element.FFCAL),
                    HFCAL: Utils.strHourToSapHo(element.HFCAL),
                    CDZPC: element.CDZPC,
                    CDPTO: element.CDPTO,
                    CDPTA: element.CDPTA,
                    CDEMP: element.CDEMP,
                    CDMNP: element.CDMNP,
                    ESOPE: element.ESOPE,
                    ESTSF: element.ESTSF,
                    CDMLM: element.CDMLM,
                    STCMB: element.STCMB,
                    LTGEO: element.Latitud ? element.Latitud : element.LTGEO,
                    LNGEO: element.Longitud ? element.Longitud : element.LNGEO,
                    TEMAR: element.TEMAR,
                    CDTDS: element.CDTDS,
                    TMESP: element.TMESP,
                    CDMES: element.CDMES,
                    MUEST: element.MUEST,
                    ESEVN: element.ESEVN,
                    FCEVN: Utils.strDateToSapDate(element.FCEVN),
                    HCEVN: Utils.strHourToSapHo(element.HCEVN),
                    ACEVN: element.ACEVN,
                    FMEVN: Utils.strDateToSapDate(element.FMEVN),
                    HMEVN: Utils.strHourToSapHo(element.HMEVN),
                    AMEVN: element.AMEVN,
                    NRDES: element.NRDES,
                    ESTSF: element.ESTSF,
                    KMEVN: obs
                };

                if (flagSaveEventos == "C" || flagSaveEventos == "E") {
                    if (eveVisTabEquip.includes(element.CDTEV)) {
                        equipamientos = this.obtenerEquipamientos(element)
                    }

                    if (eveVisTabHorom.includes(element.CDTEV)) {
                        horometros = this.obtenerHorometrosRFC(element,horometros);
                    }

                    if (element.CDTEV == "3") {
                        pescaDeclarada = this.obtenerPescaDeclaradaRFC(element, pescaDeclarada);
                        if (motivoMarea == "1") {
                            pescaBodega = this.obtenerPescaBodegaRFC(element, pescaBodega);
                        }
                    }

                    if (element.CDTEV == "6") {
                        pescaDescargada = this.obtenerPescaDescargadaRFC(element, pescaDescargada);
                    }

                    if (element.CDTEV == "8") {
                        siniestros = this.obtenerSiniestros(element);
                    }
                }

                marea.str_evento.push(evt);
            }

            if (flagSaveEventos == "C" || flagSaveEventos == "E") {
                marea.str_flbsp_c = this.guardarDatosBiometria();
                marea.str_flbsp_e = this.eliminarDatosBiometria();
                marea.str_pscinc = this.guardarDatosIncidental();
                marea.str_simar = siniestros;
                marea.str_desca = marea.str_desca.concat(pescaDescargada);
                marea.str_psbod = marea.str_psbod.concat(pescaBodega);
                marea.str_psdec = marea.str_psdec.concat(pescaDeclarada);
                marea.str_equip = equipamientos;
                marea.str_horom = marea.str_horom.concat(horometros);
                marea.str_disfl = this.obtenerALDistribFlota();
            }

            console.log("GUARDAR MAREA: ", marea);

            try {
                var guardar = await TasaBackendService.crearActualizarMarea(marea);
                if (guardar.length > 0) {
                    modelo.setProperty("/Utils/CrearMarea", guardar);
                    bOk = true;
                }
            } catch (error) {
                bOk = false;
                let msg = this.getResourceBundle().getText("ERRORRFCSAVE");
                let msg2 = msg + " " + modelo.getProperty("/Utils/NumeroMarea") + ": " + error;
                MessageBox.error(msg);
            }

            if (bOk) {
                this.informarHorometroAveriado();
            }

            return bOk;

        },

        obtenerALDistribFlota: function () {
            let modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var distrFlota = modelo.getProperty("/DistribFlota");
            var distrFlotaElim = modelo.getProperty("/Eventos/DistribFlotaElim");
            var listaDistrFlota = [];
            if (distrFlotaElim.CDEMB) {
                var objDistrFlotaElim = {
                    INDTR: "D",
                    CDEMB: distrFlotaElim.CDEMB
                };
                listaDistrFlota.push(objDistrFlotaElim);
            }

            if ((distrFlota.Indicador && distrFlota.Indicador == "N")) {
                var objDistrFlota = {
                    INDTR: distrFlota.Indicador,
                    CDEMB: modelo.getProperty("/Form/CDEMB"),
                    CDPTA: distrFlota.CDPTA,
                    FEARR: Utils.strDateToDate(distrFlota.FEARR),
                    HEARR: Utils.strHourToSapHo(distrFlota.HEARR)
                };
                listaDistrFlota.push(objDistrFlota);
            }

            return listaDistrFlota;
        },

        informarHorometroAveriado: async function () { // errror
            let mod = this.getOwnerComponent().getModel("DetalleMarea");
            let ListaEventos = mod.getProperty("/Eventos/Lista");
            let Cabecera = mod.getProperty("/Form");
            let listaHoroAveCorreo = [];
            ListaEventos.forEach(element => {
                if(true){
                    let LenghtHoro = element.ListaHorometros ? element.ListaHorometros.length : 0;
                    if(LenghtHoro > 0){
                        let ListHoro = element.ListaHorometros;
                        let ListHoroAve = ListHoro.filter(elem => elem.Chk_averiado == true);
                        if (ListHoroAve.length > 0) {
                            let obj = {
                                horometrosAveriados: ListHoroAve,
                                nroEvento: element.NREVN
                            };
                            listaHoroAveCorreo.push(obj);
                        }
                    }
                }

            });

            if (listaHoroAveCorreo > 0) {
                //llama al servicio de envio de correo
                let serv_correoHoroAve = TasaBackendService.envioCorreoHoroAve(Cabecera.NMEMB, listaHoroAveCorreo);
                let that = this;
                await Promise.resolve(serv_correoHoroAve).then(values => {
                    console.log(values);
                }).catch(reason => {

                });
            }

        },
        enviarCorreosSiniestro: function () {

        },

        obtenerSiniestros: function (element) {
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var listaSiniestros = [];//modelo sinistros
            var siniestros = [];
            return siniestros;
        },

        obtenerEquipamientos: function (element) {
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            //let elementSel = modelo.getProperty("/Eventos/LeadSelEvento");
           // let ListaEventos = modelo.getProperty("/Eventos/Lista");
            var listaEquipamientos = element.ListaEquipamiento ? element.ListaEquipamiento : [];//modelo equipamientos del evento (element)
            var equipamientos = [];
            if(listaEquipamientos){
                for (let index = 0; index < listaEquipamientos.length; index++) {
                    const element = listaEquipamientos[index];
                    var obj = {
                        CDEMB: modelo.getProperty("/Form/CDEMB"),
                        CDEQP: element.CDEQP,
                        CNEPE: element.CNEPE
                    };
                    equipamientos.push(obj);
                }
            }
            return equipamientos;
        },

        obtenerHorometrosRFC: function (element,horometros_model) {
            let mod = this.getOwnerComponent().getModel("DetalleMarea");
            let elementSel = mod.getProperty("/Eventos/LeadSelEvento");
            let ListaEventos = mod.getProperty("/Eventos/Lista");
            var horometros = element.ListaHorometros ? element.ListaHorometros : []; //modelo de horometros de la lista de eventos (element)
            var lista = horometros_model;
            for (let index = 0; index < horometros.length; index++) {
                const element2 = horometros[index];
                var listHorometros = {
                    INDTR: element2.indicador,
                    NRMAR: element.NRMAR,
                    NREVN: element.NREVN,
                    CDTHR: element2.tipoHorometro,
                    LCHOR: element2.lectura,
                    NORAV: element2.Chk_averiado  === false ? "" : "A"
                };
                lista.push(listHorometros);
            }
            return lista;
        },

        guardarDatosBiometria: function () {
            let mod = this.getOwnerComponent().getModel("DetalleMarea");
            let ListaEventos = mod.getProperty("/Eventos/Lista");
            let motivoMarea = mod.getProperty("/Form/CDMMA");
            let t_max = Number(mod.getProperty("/Utils/TallaMax"));
            let t_min = Number(mod.getProperty("/Utils/TallaMin"));
            var biom_list = [];
            var ListaBiomTemp = [];//modelo de biometria Temp
            // if (ListaBiom.length > 0) {
            //     //this.cargarRegistroBiometria();
            // }
            for (let index1 = 0; index1 < ListaEventos.length; index1++) {
                const element1 = ListaEventos[index1];
                if (element1.CDTEV == "3") {
                    let ListaBiom = element1.ListaBiometria ? element1.ListaBiometria : [];
                    for (let index = 0; index < ListaBiom.length; index++) {
                        const element = ListaBiom[index];
                        if (motivoMarea == "2") {
                            let v_talla_bio = Number(0);
                            for (let k = t_min; k <= t_max; k = k + Number(0.5)) {
                                if (k == t_min) {
                                    v_talla_bio = t_min;
                                } else {
                                    v_talla_bio++;
                                }

                                var Biometria = {
                                    NRMAR: ListaEventos[index1].NRMAR,
                                    NREVN: ListaEventos[index1].NREVN,
                                    CDSPC: element.CodEspecie,
                                    TMMED: k,
                                    CNSPC: element['col_' + v_talla_bio]
                                };
                                biom_list.push(Biometria);
                            }

                        } else if (motivoMarea == "1") {

                            for (let k = t_min; k <= t_max; k++) {
                                var Biometria = {
                                    NRMAR: ListaEventos[index1].NRMAR,
                                    NREVN: ListaEventos[index1].NREVN,
                                    CDSPC: element.CodEspecie,
                                    TMMED: k,
                                    CNSPC: element['col_' + k]
                                };
                                biom_list.push(Biometria);
                            }

                        }

                    }
                }

            }

            return biom_list;
        },

        eliminarDatosBiometria: function () {
            var ListaBiomElim = [];//modelo de lista de biometria eliminados
            var biom_list = [];
            for (let index = 0; index < ListaBiomElim.length; index++) {
                const element = ListaBiomElim[index];
                var Biometria = {
                    NRMAR: element.NRMAR,
                    NREVN: element.NREVN
                };
                biom_list.push(Biometria);
            }
            return biom_list;
        },

        guardarDatosIncidental: function () {
            let mod = this.getOwnerComponent().getModel("DetalleMarea");
            let elementSel = mod.getProperty("/Eventos/LeadSelEvento");
            let ListaEventos = mod.getProperty("/Eventos/Lista");
            var pscinc_list = [];
            for (let index1 = 0; index1 < ListaEventos.length; index1++) {
                const element1 = ListaEventos[index1];
                var IncidenReg = element1.ListaIncidental ? element1.ListaIncidental.length : 0;
                if(IncidenReg != 0 ){
                    let lstIncidental = element1.ListaIncidental;
                    for (let index = 0; index < lstIncidental.length; index++) {
                        const element = lstIncidental[index];
                        var incidental = {
                            CDSPC: element.CDSPC,
                            DSSPC: element.DSSPC,
                            NREVN: element1.NREVN,
                            NRMAR: element1.NRMAR,
                            PCSPC: element.PCSPC
                        };
                        pscinc_list.push(incidental);
                    }
                }
                
                
            }
            
            return pscinc_list;
        },

        obtenerPescaBodegaRFC: function (elementParam, pescaBodega_model) {
            let mod = this.getOwnerComponent().getModel("DetalleMarea");
            //let elementSel = mod.getProperty("/Eventos/LeadSelEvento");
            let ListaEventos = mod.getProperty("/Eventos/Lista");
            var bodegas = elementParam.ListaBodegas ? elementParam.ListaBodegas  : [];//modelo de bodegas
            var lista = pescaBodega_model;
            for (let index = 0; index < bodegas.length; index++) {
                const element = bodegas[index];
                var listBodegas = {
                    INDTR: element.INDTR ? element.INDTR : "N",
                    NRMAR: elementParam.NRMAR,
                    NREVN: elementParam.NREVN,
                    CDBOD: element.CDBOD,
                    CNPCM: element.CantPesca
                };
                lista.push(listBodegas);
            }
            return lista;
        },

        obtenerPescaDeclaradaRFC: function (elementParam, pescaDeclarada_model) {
            let mod = this.getOwnerComponent().getModel("DetalleMarea");
            let elementSel = mod.getProperty("/Eventos/LeadSelEvento");
            let ListaEventos = mod.getProperty("/Eventos/Lista");
            let pescaDeclarada = elementParam.ListaPescaDeclarada ? elementParam.ListaPescaDeclarada : [];//modelo pesca declarada
            let elimpescaDeclarada = elementParam.eListaPescaDeclarada ? elementParam.eListaPescaDeclarada : [];//modelo pesca declarada
            var lista = pescaDeclarada_model;
            for (let index = 0; index < pescaDeclarada.length; index++) {
                const element = pescaDeclarada[index];
                var listPescaDeclarada = {
                    INDTR: element.INDTR ? element.INDTR : "N",
                    //NRMAR: ListaEventos[elementSel].NRMAR,
                    NRMAR: elementParam.NRMAR,
                    //NREVN: ListaEventos[elementSel].NREVN,
                    NREVN: elementParam.NREVN,
                    CDSPC: element.CDSPC,
                    CNPCM: element.CNPCM,
                    CDUMD: element.UnidMedida,
                    ZMODA: element.ZMODA,
                    OBSER: element.OBSER,
                };
                lista.push(listPescaDeclarada);
            }

            //recorrido de los eliminados 
            for (let index = 0; index < elimpescaDeclarada.length; index++) {
                const element = elimpescaDeclarada[index];
                var elistPescaDeclarada = {
                    INDTR: element.INDTR,
                    NRMAR: element.NRMAR,
                    NREVN: element.NREVN,
                    CDSPC: element.CDSPC
                };
                lista.push(elistPescaDeclarada);
            }
            
            return lista;
        },

        obtenerPescaDescargadaRFC: function (element,pescaDescargada_model) {
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var pescaDescargada = element.ListaPescaDescargada[0];//modelo pesca descargada
            var ePescaDescargada = element.ListaPescaDescargadaElim ? element.ListaPescaDescargadaElim : [];//modelo pesca descargada eliminada
            var lista = pescaDescargada_model;
            if (ePescaDescargada.length > 0) {
                var EListPescaDescargada = {
                    INDTR: ePescaDescargada.INDTR,
                    INDEJ: ePescaDescargada.INDEJ,
                    NRDES: ePescaDescargada.NRDES
                };
                lista.push(EListPescaDescargada);
            }


            var listPescaDescargada = {
                INDTR: pescaDescargada.INDTR,
                INDEJ: pescaDescargada.INDEJ,
                NRMAR: element.NRMAR,
                NREVN: element.NREVN,
                NRDES: pescaDescargada.NRDES ? pescaDescargada.NRDES : pescaDescargada.Nro_descarga,
                TICKE: pescaDescargada.TICKE,
                CDEMB: modelo.getProperty("/Form/CDEMB"),
                CDPTA: pescaDescargada.CDPTA,
                INPRP: element.INPRP,
                CDSPC: pescaDescargada.CDSPC,
                CDLDS: pescaDescargada.CDLDS,
                CDPDG: pescaDescargada.CDPDG,
                CNPCM: pescaDescargada.CNPCM,
                CNPDS: pescaDescargada.CNPDS,
                PESACUMOD: pescaDescargada.PESACUMOD,
                FECCONMOV: Utils.strDateToSapDate(pescaDescargada.FECCONMOV),
                FIDES: Utils.strDateToSapDate(element.FIEVN),
                HIDES: Utils.strHourToSapHo(element.HIEVN),
                FFDES: Utils.strDateToSapDate(element.FFEVN),
                HFDES: Utils.strHourToSapHo(element.HFEVN),
                CDTPC: pescaDescargada.CDTPC,
                TPDES: pescaDescargada.TPDES ? pescaDescargada.TPDES : pescaDescargada.TipoDesc
            };

            lista.push(listPescaDescargada);
            return lista;
        },

        MainObtenerReservasCombustible: async function () {

        },

        crearReserva: async function () {
            var bOk = true;
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var posiciones = this.obtenerPosiciones();
            var fechaReserva = modelo.getProperty("/Form/FIEVN")
            var bodyReserva = {
                p_cdemb: modelo.getProperty("/Form/CDEMB"),
                p_fhrsv: fechaReserva ? Utils.strDateToSapDate(fechaReserva) : "",
                p_lgort: modelo.getProperty("/Suministro/0/CDALE"),
                p_nrevn: modelo.getProperty("/Form/NREVN"),
                p_user: await this.getCurrentUser(),
                str_rcb: posiciones
            };
            var crearReserva = await TasaBackendService.crearReserva(bodyReserva);
            if (crearReserva) {
                var t_mensaje = crearReserva.t_mensaje;
                modelo.setProperty("/Utils/NumeroReservaGen", crearReserva.p_reserva)
                if (t_mensaje.length) {
                    if (t_mensaje[0].CMIN == "E") {
                        bOk = false;
                        MessageBox.error(t_mensaje[0].DSMIN);
                    }
                }
            } else {
                bOk = false;
            }
            return bOk;
        },

        crearVentaComb: async function () {
            var bOk = true;
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var posiciones = this.obtenerPosiciones();
            var fechaReserva = Utils.dateToStrDate(new Date());
            var bodyReserva = {
                p_cdemb: modelo.getProperty("/Form/CDEMB"),
                p_fhrsv: fechaReserva ? Utils.strDateToSapDate(fechaReserva) : "",
                p_lgort: modelo.getProperty("/Suministro/0/CDALE"),
                p_nrevn: modelo.getProperty("/Form/NREVN"),
                p_nrmar: modelo.getProperty("/Form/NRMAR"),
                p_user: await this.getCurrentUser(),
                p_werks: modelo.getProperty("/Suministro/0/WERKS"),
                str_rcb: posiciones
            };
            var crearVenta = await TasaBackendService.crearVenta(bodyReserva);
            if (crearVenta) {
                var t_mensaje = crearVenta.t_mensaje;
                modelo.setProperty("/Utils/NumeroPedidoGen", crearVenta.p_pedido)
                if (t_mensaje.length) {
                    if (t_mensaje[0].CMIN == "E") {
                        bOk = false;
                        MessageBox.error(t_mensaje[0].DSMIN);
                    }
                }
            } else {
                bOk = false;
            }
            return bOk;
        },

        obtenerPosiciones: function () {
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var lista = [];
            var suministros = modelo.getProperty("/Suministro");
            var almacenes = modelo.getProperty("/ConfigReservas/Almacenes");
            var indProp = modelo.getProperty("/Form/INPRP");
            for (let index = 0; index < suministros.length; index++) {
                const element = suministros[index];
                var almacen = almacenes.find(function (param) {
                    return param.CDALE == element.CDALE;
                });
                var obj = {
                    NRMAR: modelo.getProperty("/Form/NRMAR"),
                    NRPOS: element.NRPOS,
                    CDSUM: element.CDSUM ? element.CDSUM : "",
                    CNSUM: element.CNSUM,
                    CDUMD: element.CDUMD ? element.CDUMD : "",
                    CDPTA: indProp == "P" ? element.CDPTA : element.WERKS,
                    CDALM: indProp == "P" && almacen.CDALM ? almacen.CDALM : element.CDALE
                };
                lista.push(obj);
            }
            return lista;
        },

        obtenerReservas: async function (visibleNuevo) {
            BusyIndicator.show(0);
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var marea = modelo.getProperty("/Form/NRMAR");
            var usuario = await this.getCurrentUser();
            var mareaCerrada = modelo.getProperty("/Form/ESMAR") == "C" ? true : false;
            var response = await TasaBackendService.obtenerReservas(marea, null, null, usuario);
            modelo.setProperty("/Config/visibleReserva1", false);
            modelo.setProperty("/Config/visibleReserva2", false);
            modelo.setProperty("/Utils/TxtBtnSuministro", "Reservar");
            if (response) {
                var reservas = response.t_reservas;
                //if (reservas.length != 0) {
                    modelo.setProperty("/Config/visibleReserva2", true);
                    if (visibleNuevo) {
                        modelo.setProperty("/Config/visibleBtnNuevaReserva", true);
                    } else {
                        modelo.setProperty("/Config/visibleBtnNuevaReserva", false);
                    }
                    for (let index = 0; index < reservas.length; index++) {
                        const element = reservas[index];
                        element.CHKDE = false;
                    }
                    modelo.setProperty("/ReservasCombustible", reservas);
                    if (mareaCerrada) {
                        modelo.setProperty("/Config/visibleBtnNuevaReserva", false);
                        modelo.setProperty("/Config/visibleAnulaReserva", false);
                        modelo.setProperty("/Config/visibleCheckReserva", false);
                    } else {
                        modelo.setProperty("/Config/visibleBtnNuevaReserva", true);
                        modelo.setProperty("/Config/visibleAnulaReserva", true);
                        modelo.setProperty("/Config/visibleCheckReserva", true);
                    }
                modelo.refresh();
                /*} else {
                    await this.obtenerNuevoSuministro(true);
                }*/
            }
            BusyIndicator.hide();
        },

        obtenerReservasCombustible: async function (marea, codigo) {
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var listaEventos = modelo.getProperty("/Eventos/Lista");
            var motivoSinZarpe = ["3", "7", "8"];
            var eveReserCombus = ["4", "5", "6"];
            var visibleNuevo = true;
            var mostrarTab = false;
            var mareaCerrada = modelo.getProperty("/Form/ESMAR") == "C" ? true : false;
            var usuario = await this.getCurrentUser();
            var response = await TasaBackendService.obtenerNroReserva(marea, usuario);
            var motivoMarea = modelo.getProperty("/Form/CDMMA");
            var embarcacion = modelo.getProperty("/Form/CDEMB");
            modelo.setProperty("/Config/visibleReserva1", false);
            modelo.setProperty("/Config/visibleReserva2", false);
            modelo.setProperty("/Config/visibleReserva3", false);
            if (response) {
                if (response.data.length > 0) {
                    mostrarTab = true;
                }
            }
            if (!mareaCerrada) {
                if (!motivoSinZarpe.includes(motivoMarea)) {
                    var ultimoEvento = listaEventos[listaEventos.length - 1];
                    var tipoUltEvnt = ultimoEvento.CDTEV;
                    visibleNuevo = eveReserCombus.includes(tipoUltEvnt);
                    if (!mostrarTab && visibleNuevo) {
                        mostrarTab = true;
                    }
                } else {
                    mostrarTab = true;
                }
            }
            modelo.setProperty("/Config/visibleTabReserva", mostrarTab);
            modelo.setProperty("/Config/visibleAlmacenReserva", false);
            if (mostrarTab) {
                modelo.setProperty("/Config/visibleAlmacenReserva", true);
                var configReservas = await TasaBackendService.obtenerConfigReservas(usuario);
                if (configReservas) {
                    modelo.setProperty("/ConfigReservas/BWART", configReservas.bwart);
                    modelo.setProperty("/ConfigReservas/MATNR", configReservas.matnr);
                    modelo.setProperty("/ConfigReservas/WERKS", configReservas.werks);
                    modelo.setProperty("/ConfigReservas/Almacenes", configReservas.almacenes);
                }
                var embaComb = await TasaBackendService.obtenerEmbaComb(usuario, embarcacion);
                if (embaComb) {
                    if (embaComb.data) {
                        var emba = embaComb.data[0];
                        var objEmbComb = modelo.getProperty("/EmbaComb");
                        for (var key in emba) {
                            if (objEmbComb.hasOwnProperty(key)) {
                                objEmbComb[key] = emba[key];
                            }
                        }
                    }
                }
                await this.obtenerReservas(visibleNuevo);
            }
        },

        obtenerVentasCombustible: async function (marea) {
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var listaEventos = modelo.getProperty("/Eventos/Lista");
            var mostrarTab = false;
            var mareaCerrada = modelo.getProperty("/Form/ESMAR") == "C" ? true : false;
            var usuario = await this.getCurrentUser();
            var embarcacion = modelo.getProperty("/Form/CDEMB");
            var nroVenta = await TasaBackendService.obtenerNroReserva(marea, usuario);
            if (nroVenta) {
                mostrarTab = true;
            }
            var primerRegVenta = !mostrarTab;
            var regVenta = false;
            var tipoEvento = "";
            if (!mareaCerrada) {
                for (let index = 0; index < listaEventos.length; index++) {
                    const element = listaEventos[index];
                    tipoEvento = element.CDTEV;
                    if (tipoEvento == "5") {
                        regVenta = true;
                        break;
                    }
                }
                if (regVenta) {
                    mostrarTab = true;
                } else {
                    mostrarTab = false;
                }
            }

            modelo.setProperty("/Config/visibleTabVenta", mostrarTab);
            modelo.setProperty("/Config/visibleAlmacenExterno", false);
            if (mostrarTab) {
                var configReservas = await TasaBackendService.obtenerConfigReservas(usuario);
                if (configReservas) {
                    modelo.setProperty("/ConfigReservas/BWART", configReservas.bwart);
                    modelo.setProperty("/ConfigReservas/MATNR", configReservas.matnr);
                    modelo.setProperty("/ConfigReservas/WERKS", configReservas.werks);
                    modelo.setProperty("/ConfigReservas/Almacenes", configReservas.almacenes);
                }

                var almExt = await TasaBackendService.obtenerAlmExterno(usuario);
                if (almExt) {
                    modelo.setProperty("/ConfigReservas/AlmacenesExt", almExt.data);
                    modelo.setProperty("/Config/visibleAlmacenExterno", true);
                }
                var embaComb = await TasaBackendService.obtenerEmbaComb(usuario, embarcacion);
                if (embaComb) {
                    if (embaComb.data) {
                        var emba = embaComb.data[0];
                        var objEmbComb = modelo.getProperty("/EmbaComb");
                        for (var key in emba) {
                            if (objEmbComb.hasOwnProperty(key)) {
                                objEmbComb[key] = emba[key];
                            }
                        }
                    }
                }
                await this.obtenerVentas(primerRegVenta);
            }
        },

        obtenerNuevoSuministro: async function (visible) {
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var usuario = await this.getCurrentUser();
            var eventos = modelo.getProperty("/Eventos/Lista");
            var indProp = modelo.getProperty("/Form/INPRP")
            modelo.setProperty("/Config/visibleReserva1", visible);
            modelo.setProperty("/Config/visibleVenta2", visible);
            var ultimoEvento = eventos.length > 0 ? eventos[eventos.length - 1] : null;
            var descEvento = ultimoEvento ? ultimoEvento.DESC_CDTEV : "";
            var fechIniEve = ultimoEvento ? ultimoEvento.FIEVN : "";
            var numeroEvt = ultimoEvento ? ultimoEvento.NREVN : "";
            modelo.setProperty("/Form/NREVN", numeroEvt);
            modelo.setProperty("/Form/DESC_CDTEV", descEvento);
            modelo.setProperty("/Form/FIEVN", fechIniEve);
            var planta = ultimoEvento ? ultimoEvento.CDPTA : "";
            var descr = ultimoEvento ? ultimoEvento.DESCR : "";
            var centro = modelo.getProperty("/ConfigReservas/WERKS");
            if (indProp == "T") {
                for (let index1 = 0; index1 < eventos.length; index1++) {
                    const element = eventos[index1];
                    if (element.CDTEV == "5") {
                        centro = element.WERKS;
                        break;
                    }
                }
            }
            var material = modelo.getProperty("/ConfigReservas/MATNR");
            var data = await TasaBackendService.obtenerSuministro(usuario, material);
            if (data) {
                var almacenes = modelo.getProperty("/ConfigReservas/Almacenes");
                var suministro = data.data[0];
                var dsalm = "";
                var cdale = "";
                if (indProp == "P") {
                    for (let index = 0; index < almacenes.length; index++) {
                        const element = almacenes[index];
                        if (element.DSALM == descr) {
                            dsalm = element.DSALM;
                            cdale = element.CDALE;
                        }
                    }
                } else {
                    var almExt = await TasaBackendService.obtenerAlmExterno(usuario);
                    if (almExt) {
                        modelo.setProperty("/ConfigReservas/AlmacenesExt", almExt.data);
                        var almacen = almExt.data[0];
                        dsalm = almacen.DESCR;
                        cdale = almacen.VAL01;
                    }
                }
                var listaSuministro = [{
                    NRPOS: "001",
                    CDSUM: suministro.CDSUM,
                    CNSUM: 0,
                    MAKTX: suministro.MAKTX,
                    CDUMD: suministro.CDUMD,
                    DSUMD: suministro.DSUMD,
                    CDPTA: planta,
                    DESCR: descr,
                    WERKS: centro,
                    DSALM: dsalm,
                    CDALE: cdale
                }];
                modelo.setProperty("/Suministro", listaSuministro);
            }
        },

        anularReservas: async function (reservas, indices) {
            BusyIndicator.show(0);
            var objAnular = {
                p_user: await this.getCurrentUser(),
                str_rsc: reservas
            };
            var anular = await TasaBackendService.anularReservas(objAnular);
            if (anular) {
                var me = this;
                var mssg = this.getResourceBundle().getText("ANULARESEXITO");
                MessageBox.success(mssg, {
                    title: "Exito",
                    onClose: async function () {
                        BusyIndicator.hide();
                        await me.obtenerReservas(true);
                    }
                });
            }
        },

        anularVentas: async function (ventas, indices) {
            BusyIndicator.show(0);
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var obj = {
                p_ventas: ventas
            };
            var anular = await TasaBackendService.anularVenta(obj);
            if (anular) {
                var me = this;
                var mensajes = anular.t_mensaje;
                var messageItems = modelo.getProperty("/Utils/MessageItemsDM");
                for (let index = 0; index < mensajes.length; index++) {
                    const element = mensajes[index];
                    var objMessage = {
                        type: element.CMIN == 'S' ? 'Success' : 'Error',
                        title: element.CMIN == 'S' ? 'Mensaje de Éxito' : 'Mensaje de Error',
                        activeTitle: false,
                        description: element.DSMIN,
                        subtitle: element.DSMIN,
                        counter: index
                    };
                    messageItems.push(objMessage);
                }
                /*
                var oButton = this.getView().byId("messagePopoverBtn");
                oMessagePopover.getBinding("items").attachChange(function (oEvent) {
                    oMessagePopover.navigateBack();
                    oButton.setType(this.buttonTypeFormatter("DM"));
                    oButton.setIcon(this.buttonIconFormatter("DM"));
                    oButton.setText(this.highestSeverityMessages("DM"));
                }.bind(this));

                setTimeout(function () {
                    oMessagePopover.openBy(oButton);
                    oMessagePopover.navigateBack();
                    oButton.setType(this.buttonTypeFormatter("DM"));
                    oButton.setIcon(this.buttonIconFormatter("DM"));
                    oButton.setText(this.highestSeverityMessages("DM"));
                }.bind(this), 100);*/

                BusyIndicator.hide();
                await me.obtenerVentas(true);
            } else {
                BusyIndicator.hide();
            }

        },

        obtenerDetalleSuministro: async function (nrmar, nrrsv) {
            BusyIndicator.show(0);
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var usuario = await this.getCurrentUser();
            var bOk = false;
            var indProp = modelo.getProperty("/Form/INPRP");
            var almacenesExterno = modelo.getProperty("/ConfigReservas/AlmacenesExt");
            var detalleSuministro = await TasaBackendService.obtenerReservas(nrmar, nrrsv, "X", usuario);
            if (detalleSuministro) {
                var reserva = detalleSuministro.t_reservas[0];
                var objReserva = modelo.getProperty("/DetalleSuministro");
                for (var key in reserva) {
                    if (objReserva.hasOwnProperty(key)) {
                        objReserva[key] = reserva[key];
                    }
                }
                var detalles = detalleSuministro.t_detalle;
                if (detalles.length > 0) {
                    for (let index = 0; index < detalles.length; index++) {
                        const element = detalles[index];
                        if (!element.DSALM && indProp == "T") {
                            var almExt = almacenesExterno.find(function (param) {
                                return param.VAL01 == element.CDALM;
                            });
                            element.DSALM = almExt.DESCR;
                        }
                    }
                    modelo.setProperty("/DetalleSuministro/Lista", detalles);
                    bOk = true;
                }
            }
            BusyIndicator.hide();
            return bOk;
        },

        obtenerVentas: async function (primerRegVenta) {
            BusyIndicator.show(0);
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var marea = modelo.getProperty("/Form/NRMAR");
            var usuario = await this.getCurrentUser();
            var mareaCerrada = modelo.getProperty("/Form/ESMAR") == "C" ? true : false;
            modelo.setProperty("/Config/visibleVenta1", false);
            modelo.setProperty("/Config/visibleVenta2", false);
            modelo.setProperty("/Utils/TxtBtnSuministro", "Vender");
            var response = await TasaBackendService.obtenerReservas(marea, null, null, usuario);
            if (response) {
                var ventas = response.t_reservas;
                //if (ventas.length != 0) {
                    modelo.setProperty("/Config/visibleVenta1", true);
                    if (primerRegVenta) {
                        modelo.setProperty("/Config/visibleBtnNuevaVenta", true);
                    } else {
                        modelo.setProperty("/Config/visibleBtnNuevaVenta", false);
                    }
                    for (let index = 0; index < ventas.length; index++) {
                        const element = ventas[index];
                        element.CHKDE = false;
                    }
                    modelo.setProperty("/VentasCombustible", ventas);
                    if (mareaCerrada) {
                        modelo.setProperty("/Config/visibleBtnNuevaVenta", false);
                        modelo.setProperty("/Config/visibleAnulaVenta", false);
                        modelo.setProperty("/Config/visibleCheckVenta", false);
                    } else {
                        modelo.setProperty("/Config/visibleBtnNuevaVenta", true);
                        modelo.setProperty("/Config/visibleAnulaVenta", true);
                        modelo.setProperty("/Config/visibleCheckVenta", true);
                    }
                    modelo.refresh();
                /*} else {
                    await this.obtenerNuevoSuministro(true);
                }*/
            }

            BusyIndicator.hide();
        },

        SaveGeneral: async function () {
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var visbleObsComb = modelo.getProperty("/Utils/VisibleObsvComb");
            var obsComb = modelo.getProperty("/Form/OBSCOMB");
            if (visbleObsComb && !obsComb) {
                var mssg = this.getResourceBundle().getText("MISSOBSCOMB");;
                MessageBox.error(mssg);
            } else {
                await this.guardarCambios();
            }
        },
        buttonIconFormatter: function (vista) {
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var sIcon;
            var aMessages = modelo.getProperty("/Utils/MessageItems" + vista);

            aMessages.forEach(function (sMessage) {
                switch (sMessage.type) {
                    case "Error":
                        sIcon = "sap-icon://error";
                        break;
                    case "Warning":
                        sIcon = sIcon !== "sap-icon://error" ? "sap-icon://alert" : sIcon;
                        break;
                    case "Success":
                        sIcon = "sap-icon://error" && sIcon !== "sap-icon://alert" ? "sap-icon://sys-enter-2" : sIcon;
                        break;
                    default:
                        sIcon = !sIcon ? "sap-icon://information" : sIcon;
                        break;
                }
            });
            return sIcon;
        },
        highestSeverityMessages: function (vista) {
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var sHighestSeverityIconType = this.buttonTypeFormatter(vista);
            var sHighestSeverityMessageType;
            var aMessages = modelo.getProperty("/Utils/MessageItems" + vista);

            switch (sHighestSeverityIconType) {
                case "Negative":
                    sHighestSeverityMessageType = "Error";
                    break;
                case "Critical":
                    sHighestSeverityMessageType = "Warning";
                    break;
                case "Success":
                    sHighestSeverityMessageType = "Success";
                    break;
                default:
                    sHighestSeverityMessageType = !sHighestSeverityMessageType ? "Information" : sHighestSeverityMessageType;
                    break;
            }

            return aMessages.reduce(function (iNumberOfMessages, oMessageItem) {
                return oMessageItem.type === sHighestSeverityMessageType ? ++iNumberOfMessages : iNumberOfMessages;
            }, 0);
        },
        buttonTypeFormatter: function (vista) {
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var sHighestSeverityIcon;
            var aMessages = modelo.getProperty("/Utils/MessageItems" + vista);

            aMessages.forEach(function (sMessage) {
                switch (sMessage.type) {
                    case "Error":
                        sHighestSeverityIcon = "Negative";
                        break;
                    case "Warning":
                        sHighestSeverityIcon = sHighestSeverityIcon !== "Negative" ? "Critical" : sHighestSeverityIcon;
                        break;
                    case "Success":
                        sHighestSeverityIcon = sHighestSeverityIcon !== "Negative" && sHighestSeverityIcon !== "Critical" ? "Success" : sHighestSeverityIcon;
                        break;
                    default:
                        sHighestSeverityIcon = !sHighestSeverityIcon ? "Neutral" : sHighestSeverityIcon;
                        break;
                }
            });

            return sHighestSeverityIcon;
        },

        navToExternalComp: function () {
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var dataModelo = modelo.getData();
            var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.Session);
            oStore.put("DataModelo", dataModelo);
            oStore.put("AppOrigin", "registroeventospescav2");
            var oCrossAppNav = sap.ushell.Container.getService("CrossApplicationNavigation");
            oCrossAppNav.toExternal({
                target: {
                    semanticObject: "mareaevento",
                    action: "display"
                }
            });
        },

        clearAllData: async function () {
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.Session);
            var initData = oStore.get('InitData');
            modelo.setData(initData);
            modelo.refresh();
            modelo.setProperty("/Utils/bckEmbarcacion", null);
            modelo.setProperty("/Utils/bckArmador", null);
            modelo.setProperty("/Form/ESMAR", "A");
            modelo.setProperty("/Form/INDICADOR", "N");
            modelo.setProperty("/Utils/SetInitTab", "itfDatosGenerales");
            modelo.setProperty("/Utils/TextoErrorMarea", null);
            modelo.setProperty("/Form/EsNuevo", true);
            modelo.setProperty("/Form/FCCRE", Utils.strDateToSapDate(Utils.dateToStrDate(new Date())));
            modelo.setProperty("/Form/HRCRE", Utils.strHourToSapHo(Utils.dateToStrHours(new Date())));
            modelo.setProperty("/Form/ATCRE", await this.getCurrentUser());
            modelo.setProperty("/Form/CDPTA", oStore.get('CDPTA')); //EACOSTA -- se adiciona campo por q se limpia cuando entra a este metodo
            modelo.setProperty("/Config/visibleArmador", true);
            modelo.setProperty("/Config/visibleBtnArmador", true);
            modelo.setProperty("/Config/visibleBtnEventos", true);
            modelo.setProperty("/Config/visibleEnlNueArmador", true);
            modelo.setProperty("/Config/visibleBusArmador", true);
            modelo.setProperty("/Config/visibleNueArmador", false);
            modelo.setProperty("/Config/visibleUbiPesca", false);
            modelo.setProperty("/Config/visibleFecHoEta", false);
            modelo.setProperty("/Config/visibleFechIni", false);
            modelo.setProperty("/Config/visibleFechFin", false);
            modelo.setProperty("/Config/visibleEnlDetalleEvento", true);
            modelo.setProperty("/Config/visibleTabReserva", false);
            modelo.setProperty("/Config/visibleTabVenta", false);
            modelo.setProperty("/Config/visibleTabSepComb", false);
            modelo.refresh();
            this.cambiarValoresMotivo();
            await this.obtenerArmadorPropietario();
            //clearData Evento cust

        },

        validarErroresDescargaMarea: async function (nroDescarga) {
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var messageItems = modelo.getProperty("/Utils/MessageItemsDM");
            var usuario = await this.getCurrentUser();
            var erroresDescarga = await TasaBackendService.validarErroresDescarga(nroDescarga, usuario);
            if (erroresDescarga) {
                var mensajes = erroresDescarga.data;
                var indice = messageItems.length;
                for (let index = 0; index < mensajes.length; index++) {
                    const element = mensajes[index];
                    if (element.CMIN == "E") {
                        var title = this.getResourceBundle().getText("PROGGENERAR");
                        if (element.TPROG == "A") {
                            title = this.getResourceBundle().getText("PROGANULAR");
                        }
                        //mssg += ": " + element.DSMEN;
                        indice++;
                        var objMessage = {
                            type: 'Error',
                            title: title,
                            activeTitle: false,
                            description: element.DSMEN,
                            subtitle: element.DSMEN,
                            counter: indice
                        };
                        messageItems.push(objMessage);
                    }
                }
                modelo.refresh();
            }
        },

        setVisibleBtnSave: function (btnSave, btnNext) {
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            if (btnSave) {
                modelo.setProperty("/Config/visibleBtnGuardar", true);
            } else {
                modelo.setProperty("/Config/visibleBtnGuardar", false);
            }

            if (btnNext) {
                modelo.setProperty("/Config/visibleBtnSiguiente", true);
            } else {
                modelo.setProperty("/Config/visibleBtnSiguiente", false);
            }
            modelo.refresh();
        },

        anularMarea: async function (marea) {
            BusyIndicator.show(0);
            var bOk = true;
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var anularMarea = await TasaBackendService.anularMarea(marea);
            if (anularMarea) {
                var mensajes = anularMarea.t_mensaje;
                modelo.setProperty("/Utils/MessageItemsMA", []);
                var messageItems = modelo.getProperty("/Utils/MessageItemsMA");
                for (let index = 0; index < mensajes.length; index++) {
                    const element = mensajes[index];
                    if (element.CMIN == "E") {
                        bOk = false;
                    }
                    var objMessage = {
                        type: element.CMIN == 'S' ? 'Success' : 'Error',
                        title: element.CMIN == 'S' ? 'Mensaje de Éxito' : 'Mensaje de Error',
                        activeTitle: false,
                        description: element.DSMIN,
                        subtitle: element.DSMIN,
                        counter: index
                    };
                    messageItems.push(objMessage);
                }
                modelo.refresh();
            }
            BusyIndicator.hide();
            return bOk;
        },

        anularDescargaMarea: async function (nroDescarga, anularEvento, nroEvento) {
            var bOk = await this.anulaDescRfc(nroDescarga);
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var marea = modelo.getProperty("/Form/NRMAR");
            var usuario = await this.getCurrentUser();
            if (bOk) {
                if (anularEvento) {
                    await TasaBackendService.eliminarPescaDescargada(marea, nroEvento, usuario);
                } else {
                    await TasaBackendService.actualizarPescaDescargada(marea, nroEvento, usuario);
                }
            }
            return bOk;
        },

        anulaDescRfc: async function (nroDescarga) {
            var bOk = true;
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var anularDescarga = await TasaBackendService.anularDescargaRFC(nroDescarga);
            if (anularDescarga) {
                var mensajes = anularDescarga.t_mensaje;
                modelo.setProperty("/Utils/MessageItemsDM", []);
                var messageItems = modelo.getProperty("/Utils/MessageItemsDM");
                for (let index = 0; index < mensajes.length; index++) {
                    const element = mensajes[index];
                    if (element.CMIN == "E") {
                        bOk = false;
                        var objMessage = {
                            type: 'Error',
                            title: 'Mensaje de Error',
                            activeTitle: false,
                            description: element.DSMIN,
                            subtitle: element.DSMIN,
                            counter: index
                        };
                        messageItems.push(objMessage);
                    }
                }
            }
            return bOk;
        },

        verificarCambiosCodigo: async function (tipo, codigo) {
            //var form = this.getModel("Form");
            BusyIndicator.show(0);
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var bckArmador = modelo.getProperty("/Utils/bckArmador");
            var bckEmbarcacion = modelo.getProperty("/Utils/bckEmbarcacion");
            if (codigo != null && codigo.trim().length > 0) {
                codigo = codigo.trim();
                if (tipo == "EMB") {
                    if (bckEmbarcacion == null || codigo != bckEmbarcacion) {
                        modelo.setProperty("/Form/CDMMA", null);
                        await this.buscarEmbarcacion(codigo);
                    }
                } else if (tipo == "ARM") {
                    if (bckArmador == null || codigo != bckArmador) {
                        bOk = await this.buscarArmador(codigo);
                    }
                }
            }
            BusyIndicator.hide();
        },

        validarBodegaCert: async function (codEmba, codPlanta) {
            var bOk = false;
            var usuario = await this.getCurrentUser();
            var response = await TasaBackendService.validarBodegaCert(codEmba, codPlanta, usuario);
            if (response) {
                bOk = response.estado;
            } else {
                bOk = null;
            }
            return bOk;
        },

        ValidacionMareaProduce: async function (codEmba, codPlanta) {
            var bOk = false;
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            modelo.setProperty("/Utils/MessageItemsMA", []);
            var response1 = await TasaBackendService.validarMareaProd(codEmba, codPlanta);
            if (response1) {
                if (response1.p_correcto == "X") {
                    bOk = true;
                } else {
                    bOk = false;
                    var mensajes = response1.t_mensaje;
                    var messageItems = modelo.getProperty("/Utils/MessageItemsMA");
                    for (let index = 0; index < mensajes.length; index++) {
                        const element = mensajes[index];
                        var mssg = element.DSMIN;
                        var objMessage = {
                            type: 'Error',
                            title: 'Mensaje de Validación',
                            activeTitle: false,
                            description: mssg,
                            subtitle: mssg,
                            counter: (index + 1)
                        };
                        messageItems.push(objMessage);
                    }
                    modelo.refresh();
                }
            } else {
                bOk = null;
            }
            return bOk;
        },

        cargarMarea: async function (marea, estadoMarea, embarcacion, navegar) {
            /*BusyIndicator.show(0);
            var currentUser = await this.getCurrentUser();
            var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.Session);
            if (estadoMarea == "A") {
                var response = await TasaBackendService.obtenerDetalleMarea(marea, currentUser);
                if (response) {
                    BusyIndicator.hide();
                    await this.setDetalleMarea(response, navegar);
                }
            } else {
                var emba = await this.consultarEmba(embarcacion);
                if (emba) {
                    var bOk = await this.verificarCambiosCodigo("EMB", embarcacion, emba[0]);
                    if (!bOk) {
                        var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.Session);
                        var modelo = this.getOwnerComponent().getModel("DetalleMarea");
                        var codemba = modelo.getProperty("/Form/CDEMB");
                        var codPlanta = modelo.getProperty("/Form/CDPTA") ? modelo.getProperty("/Form/CDPTA") : oStore.get("CDPTA");
                        var nmbemb = modelo.getProperty("/Form/NMEMB");
                        var validaBodCert = await this.validarBodegaCert(codemba, codPlanta);
                        if (validaBodCert) { //se puso la admiracion para pruebas
                            var valMareaProd = await this.ValidacionMareaProduce(codemba, codPlanta);
                            if (valMareaProd) {//se puso la admiracion para pruebas
                                modelo.setProperty("/Form/INDICADOR", "N");
                                modelo.setProperty("/Form/ESMAR", "A");
                                modelo.setProperty("/Form/EsNuevo", true);
                                modelo.setProperty("/Config/initSelectKeyTab", "itfDatosGenerales");
                                BusyIndicator.hide();
                                if (navegar) {
                                    oStore.put("FlagCargaInicial", true);
                                    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                                    oRouter.navTo("DetalleMarea");
                                }
                                //this.navToExternalComp();
                            }
                        } else {
                            BusyIndicator.hide();
                            MessageBox.error(this.getResourceBundle().getText("EMBANOPER", [nmbemb]));
                        }
                    }
                } else {
                    BusyIndicator.hide();
                    MessageBox.error(this.getResourceBundle().getText("NORESULTADOEMB"));
                }
            }*/
        },

        consultarEmba: async function (cdemb) {
            var options = [{
                "cantidad": "1",
                "control": "COMBOBOX",
                "key": "ESEMB",
                "valueHigh": "",
                "valueLow": "O"
            }, {
                "cantidad": "10",
                "control": "INPUT",
                "key": "CDEMB",
                "valueHigh": "",
                "valueLow": cdemb
            }];
            var emba = await TasaBackendService.obtenerEmbarcacion(options, []);
            return emba;
        },

        buscarArmador: async function (codigo) {
            var clearData = false;
            //var dataSesionModel = this.getModel("DataSession");
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var usuario = await this.getCurrentUser();
            var response = await TasaBackendService.buscarArmador(codigo, usuario);
            if (response) {
                //var form = this.getModel("Form");
                var data = response.data[0];
                modelo.setProperty("/Form/NAME1", data.DSEMP);
            } else {
                var mssg = this.getResourceBundle().getText("NORESULTADOARMADOR");
                MessageBox.information(mssg);
                clearData = true;
            }
            if (clearData) {
                modelo.setProperty("/Utils/bckArmador", null);
                modelo.setProperty("/Form/CDEMP", null);
                modelo.setProperty("/Form/NAME1", null);
            } else {
                modelo.setProperty("/Utils/bckArmador", codigo);
            }
        },

        buscarEmbarcacion: async function (codigo) {
            //var me = this;
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var indPropiedad = "";
            var clearData = false;
            //var form = this.getModel("Form");
            //var filtro = this.getModel("Filtro")
            //var dataSesionModel = this.getModel("DataSession");
            //var visibleModel = this.getModel("Visible");
            //var utils = this.getModel("Utils");
            var usuario = await this.getCurrentUser();
            var valFijoPlanta = modelo.getProperty("/Form/CDPTA");
            //visibleModel.setProperty("/EnlMarAnterior", false);
            var embarcacion = await this.consultarEmba(codigo);
            if (embarcacion) {
                await this.obtenerDatosMareaAnt(0, codigo);
                //var mareaAnterior = modelo.getProperty("/MareaAnterior");
                //console.log("Marea Anterior: ", mareaAnterior);
                //var estMarAnt = mareaAnterior.getProperty("/EstMarea");
                var estMarAnt = modelo.getProperty("/MareaAnterior/ESMAR");
                //var cieMarAnt = mareaAnterior.getProperty("/EstCierre");
                var cieMarAnt = modelo.getProperty("/MareaAnterior/ESCMA");
                var nrmarAnt = modelo.getProperty("/MareaAnterior/NRMAR");
                //var ce_embaElement = emba[0];
                var ce_embaElement = embarcacion[0];
                indPropiedad = ce_embaElement.INPRP;
                if (estMarAnt == "" ||  estMarAnt == "C") {
                    if (ce_embaElement.ESEMB == "O") {
                        var form = modelo.getProperty("/Form");
                        for (var key in ce_embaElement) {
                            if(form.hasOwnProperty(key)){
                                form[key] = ce_embaElement[key];
                            }
                        }

                        modelo.setProperty("/Form/CDEMP", ce_embaElement.LIFNR);

                        if (ce_embaElement.TCBPS) {
                            modelo.setProperty("/Form/CPPMS", ce_embaElement.CPPMS);
                            modelo.setProperty("/Form/TCBPS", ce_embaElement.TCBPS);
                            var sum = parseFloat(ce_embaElement.CPPMS) + parseFloat(ce_embaElement.TCBPS);
                            modelo.setProperty("/Form/CBODP", sum.toFixed(3));
                        }
                        
                        if (indPropiedad == "P") {
                            modelo.setProperty("/Form/WERKS", ce_embaElement.WERKS);
                            var obtenerDatosDistribFlota = await this.obtenerDatosDistribFlotaMarea(codigo);
                            if (obtenerDatosDistribFlota) {
                                var consultarPermisoZarpe = await this.consultarPermisoZarpe(codigo);
                                clearData = !consultarPermisoZarpe;
                            } else {
                                var mssg = codigo + " - " + ce_embaElement.NMEMB + ":" + this.getResourceBundle().getText("NOUBICENDISTRIB");
                                MessageBox.error(mssg);
                                clearData = true;
                            }
                        } else if (indPropiedad == "T") {
                            var obtenerDatosPlantaDist = await this.obtenerDatosPlantaDist(valFijoPlanta);
                            if (obtenerDatosPlantaDist) {
                                var consultarPermisoZarpe = await this.consultarPermisoZarpe(codigo);
                                clearData = !consultarPermisoZarpe;
                            } else {
                                var mssg = codigo + " - " + ce_embaElement.NMEMB + ":" + this.getResourceBundle().getText("SELECCPLANTA");
                                MessageBox.error(mssg);
                                clearData = true;
                            }
                        } else {
                            var mssg = codigo + " - " + ce_embaElement.NMEMB + ":" + this.getResourceBundle().getText("NOINDPROPIEDAD");
                            MessageBox.error(mssg);
                            clearData = true;
                        }

                        if (!clearData) {
                            var valPerPescSur = this.validarPermisoPescaSur();
                            clearData = !valPerPescSur;
                        }
                    } else {
                        var mssg = codigo + " - " + ce_embaElement.NMEMB + ":" + this.getResourceBundle().getText("EMBNOPERATIVO");
                        MessageBox.error(mssg);
                        clearData = true;
                    }
                } else if (estMarAnt == "A") {
                    if (!cieMarAnt) {
                        //visibleModel.setProperty("/EnlMarAnterior", true);
                        var mssg = codigo + " - " + ce_embaElement.NMEMB + ":" + this.getResourceBundle().getText("EMBMAREAABIERTA");
                        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                        var me = this;
                        MessageBox.error(mssg, {
                            actions: ["Ver Marea", MessageBox.Action.CLOSE],
                            onClose: async function (sAction) {
                                console.log("Action: ", sAction);
                                if (sAction == "Ver Marea") {
                                    BusyIndicator.show(0);
                                    var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.Session);
                                    var initData = oStore.get('InitData');
                                    modelo.setData(initData);
                                    modelo.refresh();
                                    await me.abrirDetalleMarea(nrmarAnt);
                                    var modeloListaMareas = me.getOwnerComponent().getModel("ListaMareas");
                                    var modeloPlantas = me.getOwnerComponent().getModel("PlantasModel");
                                    var constantsUtility = me.getOwnerComponent().getModel("ConstantsUtility");
                                    me.getOwnerComponent().setModel(modelo, "DataModelo");
                                    me.getOwnerComponent().setModel(modeloListaMareas, "ModeloListaMareas");
                                    me.getOwnerComponent().setModel(modeloPlantas, "ModeloPlantasModel");
                                    me.getOwnerComponent().setModel(constantsUtility, "ModeloConstants");
                                    oRouter.navTo("DetalleMareaExt");
                                    //await me.cargarMarea(nrmarAnt, "A", null, true);
                                    BusyIndicator.hide();
                                }
                            }
                        });
                        clearData = true;
                    } else {
                        var mssg = codigo + " - " + ce_embaElement.NMEMB + ":" + this.getResourceBundle().getText("MAREATRATADAADMIN");
                        MessageBox.error(mssg);
                        clearData = true;
                    }
                }
            } else {
                var mssg = this.getResourceBundle().getText("NORESULTADOEMB");
                MessageBox.information(mssg);
                clearData = true;
            }
            if (clearData) {
                modelo.setProperty("/Utils/bckEmbarcacion", null);
                //this.bckEmbarcacion = null;
                //form.setProperty("/Embarcacion", null);
                modelo.setProperty("/Form/CDEMB", null);
                //form.setProperty("/DescEmbarcacion", null);
                modelo.setProperty("/Form/NMEMB", null);
                //form.setProperty("/Armador", null);
                modelo.setProperty("/Form/CDEMP", null);
                //form.setProperty("/DescArmador", null);
                modelo.setProperty("/Form/NAME1", null);
                //form.setProperty("/SistPesca", null);
                modelo.setProperty("/Form/CDSPE", null);
                modelo.setProperty("/Form/DSSPE", null);
                //form.setProperty("/MotMarea", null);

                console.log("SETEA NULL AQUI 2");
                modelo.setProperty("/Form/CDMMA", null);
            } else {
                this.validarIndPropiedad(indPropiedad);
                modelo.setProperty("/Utils/bckEmbarcacion", codigo);
                //this.bckEmbarcacion = codigo;
            }
            //modelo.setProperty("/Form/VEDAVERIF", false);
            modelo.setProperty("/Utils/VedaVerificada", false);
            modelo.refresh();
            
            return !clearData;
        },

        validarIndPropiedad: function (ind) {
            //var visible = this.getModel("Visible");
            //var form = this.getModel("Form");
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");

            if (ind == null || (ind != null && ind == "T")) {
                modelo.setProperty("/Config/visibleBtnArmador", true);//activar ayuda de bsuqeuda de armador
                modelo.setProperty("/Config/visibleEnlNueArmador", true);
                modelo.setProperty("/Form/CDEMP", null);
                modelo.setProperty("/Form/NAME1", null);
                modelo.setProperty("/Form/INPRP", "T");
            } else {//setArmLectura
                modelo.setProperty("/Config/visibleBtnArmador", false);//DESACTIVAR  ayuda de bsuqeuda de armador
                modelo.setProperty("/Config/visibleEnlNueArmador", false);
                modelo.setProperty("/Form/INPRP", "P");
            }

            this.cambiarValoresMotivo();
        },

        validarPermisoPescaSur: function () {
            //var me = this;
            var bOk = true;
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            //var distribFlota = modelo.getProperty("/DistribFlota");
            //var form = this.getModel("Form");
            var constantes = this.getModel("Constantes");
            var ubicPlanta = modelo.getProperty("/DistribFlota/CDUPT");
            var permisoSur = modelo.getProperty("/Form/CNVPS");
            var fechaPerSur = modelo.getProperty("/Form/FCVPS");
            var fechaPermiso = Utils.strDateToDate(fechaPerSur);
            var fechaActual = new Date();
            if (ubicPlanta == constantes.getProperty("/CodUbicSur")) {
                if (permisoSur == "S") {
                    if (fechaActual > fechaPermiso) {
                        bOk = false;
                        var mssg = this.getResourceBundle().getText("PERMISOSURVENCIO", [fechaPerSur]);
                        MessageBox.error(mssg);
                    }
                } else {
                    bOk = false;
                    var mssg = this.getResourceBundle().getText("NOPERMISOSUR");
                    MessageBox.error(mssg);
                }
            }
            return bOk;
        },

        obtenerDatosPlantaDist: async function (planta) {
            //var me = this;
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            //var dataSesionModel = this.getModel("DataSession");
            //var usuario = dataSesionModel.getProperty("/User");
            var usuario = await this.getCurrentUser();
            //var distribFlota = this.getModel("DistribFlota");
            var distribFlota = modelo.getProperty("/DistribFlota");
            var constantsUtility = this.getOwnerComponent().getModel("ConstantsUtility");
            var caracterNuevo = constantsUtility.getProperty("/CARACTERNUEVO");
            var response = await TasaBackendService.obtenerDatosPlantaDist(planta, usuario);
            if (response) {
                for (var key in response) {
                    if (distribFlota.hasOwnProperty(key)) {
                        distribFlota[key] = response[key];
                    }
                }
                modelo.setProperty("/DistribFlota/Indicador", caracterNuevo);
                modelo.setProperty("/DistribFlota/IntLatPuerto", parseInt(response.LTGEO));
                modelo.setProperty("/DistribFlota/IntLonPuerto", parseInt(response.LNGEO));
                if (!response.DSEMP || !response.INPRP) {
                    var mssg = this.getResourceBundle().getText("PLANTASINEMPRESA");
                    MessageBox.error(mssg);
                    return false;
                } else {
                    return true;
                }
            } else {
                var mssg = this.getResourceBundle().getText("NODATOSPLANTA");
                MessageBox.error(mssg);
                return false;
            }
        },

        obtenerDatosDistribFlotaMarea: async function (codigo) {
            //var me = this;
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            //var dataSesionModel = this.getModel("DataSession");
            //var usuario = dataSesionModel.getProperty("/User");
            var usuario = await this.getCurrentUser();
            //var distribFlota = this.getModel("DistribFlota");
            var distribFlota = modelo.getProperty("/DistribFlota");
            var constantsUtility = this.getOwnerComponent().getModel("ConstantsUtility");
            var caracterEditar = constantsUtility.getProperty("/CARACTEREDITAR");
            var response = await TasaBackendService.obtenerDatosDstrFlota(codigo, usuario);
            if (response) {
                for (var key in response) {
                    if (distribFlota.hasOwnProperty(key)) {
                        distribFlota[key] = response[key];
                    }
                }
                modelo.setProperty("/DistribFlota/Indicador", caracterEditar);
                modelo.setProperty("/DistribFlota/IntLatPuerto", parseInt(response.LTGEO));
                modelo.setProperty("/DistribFlota/IntLonPuerto", parseInt(response.LNGEO));
                if (!response.DSEMP || !response.INPRP) {
                    var mssg = this.getResourceBundle().getText("PLANTASINEMPRESA");
                    MessageBox.warning(mssg);
                }
                modelo.refresh();
                console.log("DISTRIBUCION FLOTA: ", modelo.getProperty("/DistribFlota"));
                return true;
            } else {
                return false;
            }
        },

        obtenerDatosMareaAnt: async function (marea, codigo) {
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var mareaAnterior = modelo.getProperty("/MareaAnterior");
            //var utilitario = this.getModel("Utilitario");
            //var dataSesionModel = this.getModel("DataSession");
            var usuario = await this.getCurrentUser();
            var motivosSinZarpe = ["3", "7", "8"]; // motivos sin zarpe
            //var mareaAnterior = this.getModel("MareaAnterior");
            var response = await TasaBackendService.obtenerMareaAnterior(marea, codigo, usuario);
            if (response) {
                if (response.data.length > 0) {
                    var mareaAnt = response.data[0];
                    for (var key in mareaAnt) {
                        if (mareaAnterior.hasOwnProperty(key)) {
                            mareaAnterior[key] = mareaAnt[key];
                        }
                    }
                    if (!motivosSinZarpe.includes(mareaAnt.CDMMA)) {
                        var response1 = await TasaBackendService.obtenerEventoAnterior(parseInt(mareaAnt.NRMAR), usuario);
                        if (response1) {
                            var eventoAnt = response1.data[0];
                            if (eventoAnt) {
                                var evtMarAnt = modelo.getProperty("/MareaAnterior/EventoMarAnt");
                                for (var key in eventoAnt) {
                                    if (evtMarAnt.hasOwnProperty(key)) {
                                        evtMarAnt[key] = eventoAnt[key];
                                    }
                                }
                            }
                        }
                    }
                }
            }
            modelo.refresh();
        },

        consultarPermisoZarpe: async function (codigo) {
            //var me = this;
            //var dataSesionModel = this.getModel("DataSession");
            var usuario = await this.getCurrentUser();
            //var form = this.getModel("Form");
            var form = this.getOwnerComponent().getModel("DetalleMarea");
            var puedeZarpar = await TasaBackendService.obtenerPermisoZarpe(codigo, usuario).then(function (response) {
                var bOk = true;
                if (response.data) {
                    var permiso = response.data[0];
                    if (permiso.ESPMS != "V") {
                        form.setProperty("/Form/CDEMP", null);
                        form.setProperty("/Form/NAME1", null);
                        var mssg = codigo + " - " + ce_embaElement.NMEMB + ":" + this.getResourceBundle().getText("EMBSUSPENDIDA");
                        MessageBox.error(mssg);
                        bOk = false;
                    }
                }
                return bOk;
            }).catch(function (error) {
                console.log("ERROR: Main.consultarPermisoZarpe - ", error);
                return null;
            });
            return puedeZarpar;
        },

        validarDataMareas: function (sData) {
            var modelo = this.getOwnerComponent().getModel("ListaMareas");
            var str_di = sData.str_di;
            var propios = [];
            var terceros = [];
            var mareaSinNumero = [];
            for (let index = 0; index < str_di.length; index++) {
                const element = str_di[index];

                //if (element.ESMAR = "" || (element.ESMAR == "A" && element.ESCMA == "") || (element.ESMAR == "C" && element.ESCMA == "P")) {

                if (!element.ESMAR || (element.ESMAR == "A" && !element.ESCMA) || (element.ESMAR == "C" && element.ESCMA && element.ESCMA == "P")) {
                    if (element.INPRP == "P") {
                        propios.push(element);
                    } else if (element.INPRP == "T") {
                        terceros.push(element);
                    }
                }

                /*
                if (element.NRMAR == 0) {
                    mareaSinNumero.push(element);
                }
                */
                //}
            }

            /*
            var tmpPropios = Utils.removeDuplicateArray(propios, it => it.NRMAR);
            var tmpTerceros = Utils.removeDuplicateArray(terceros, it => it.NRMAR);
            */

            //agregamos las mareas sin numero
            /*for (let index1 = 0; index1 < mareaSinNumero.length; index1++) {
                const element1 = mareaSinNumero[index1];
                tmpPropios.push(element1);
            }*/

            modelo.setProperty("/Propios", propios);
            modelo.setProperty("/Terceros", terceros);
            modelo.setProperty("/Utils/readOnlyNuevaMarea", true);
            modelo.setProperty("/Utils/readOnlyActualizar", true);
            modelo.setProperty("/Utils/readOnlyPescDecl", true);
            modelo.refresh();

            /*
            var listaModelos = this.getOwnerComponent().getModel("ListaMareas");
            listaModelos.setProperty("/Utils/readOnlyNuevaMarea", true);
            listaModelos.setProperty("/Utils/readOnlyActualizar", true);
            listaModelos.setProperty("/Utils/readOnlyPescDecl", true);*/

            /*
            var jsonModelPropios = new JSONModel(propios);
            var jsonModelTerceros = new JSONModel(terceros);*/
            //console.log("Modelo Propios: ", jsonModelPropios);
            /*this.getView().setModel(jsonModelPropios, "Propios");
            this.getView().setModel(jsonModelTerceros, "Terceros");
            this.getView().getModel("Propios").refresh();
            this.getView().getModel("Terceros").refresh();*/
        },

        filtarMareas: function (cdtem, cdpta) {
            var modelo = this.getOwnerComponent().getModel("ListaMareas");
            var dataModeloPropios = modelo.getProperty("/Propios");
            var dataModeloTerceros = modelo.getProperty("/Terceros");
            var dataPropios = [];
            var dataTerceros = [];
            var num = 0;
            var num1 = 0;
            var totalPescaDeclarada = 0;

            //filtrar propios
            for (let index = 0; index < dataModeloPropios.length; index++) {
                const element = dataModeloPropios[index];
                /*if (element.NMEMB == "TASA 55") {
                    console.log("TASA 55 Filter: ", element);
                }*/

                if (element.CDTEM == cdtem && element.CDPTA == cdpta) {
                    num++;
                    var tmpElement = Object.assign({}, element);
                    tmpElement.NRO = num;
                    var fehoarr = ""
                    if (tmpElement.FEARR) {
                        //var tmpDate = new Date(tmpElement.FEARR);
                        var fearr = tmpElement.FEARR;
                        fehoarr = fearr + " " + tmpElement.HEARR;
                    }
                    tmpElement.FEHOARR = fehoarr;

                    if (tmpElement.ESMAR == 'C' || tmpElement.CDEED == "010" || (tmpElement.ESMAR == "A" && tmpElement.ESCMA)) {

                        if (tmpElement.CDEED == "010") {

                        } else {

                        }
                        tmpElement.visibleAnularMarea = false;
                        tmpElement.DESCLINK = "Crear";

                    } else {
                        tmpElement.visibleAnularMarea = true;
                        tmpElement.DESCLINK = "Editar";

                    }

                    /*
                    tmpElement.DESCESMAR = "";
                    if (tmpElement.ESMAR == "A" || tmpElement.ESMAR == 'C') {
                        tmpElement.DESCESMAR = tmpElement.ESMAR == "A" ? "Abierto" : "Cerrado"
                    }
                    */
                    //validar descripcion link
                    /*if (tmpElement.ESMAR == "C" || tmpElement.CDEED == "010" || (tmpElement.ESMAR == "A" && tmpElement.ESCMA != "")) {
                        tmpElement.DESCLINK = "Crear"
                    } else {
                        tmpElement.DESCLINK = "Editar"
                    }*/

                    totalPescaDeclarada += Number(tmpElement.CNPCM) ? Number(tmpElement.CNPCM) : 0;

                    dataPropios.push(tmpElement);
                }
            }
            console.log("DATA PROPIOS: ", dataPropios);
            modelo.setProperty("/PropiosFiltro", dataPropios);
            modelo.setProperty("/Utils/visibleRowsPropios", dataPropios.length);
            /*var modeloMareaPropios = new JSONModel(dataPropios);
            this.getView().byId("tblMareasPropios").setModel(modeloMareaPropios);*/
            //modelo.setProperty("/Mareas/Propios", dataPropios);
            modelo.setProperty("/Utils/CountPropios", dataPropios.length);
            //this.getView().byId("itfPropios").setCount(dataPropios.length);
            modelo.refresh();

            //filtrar terceros
            for (let index1 = 0; index1 < dataModeloTerceros.length; index1++) {
                const element1 = dataModeloTerceros[index1];
                if (element1.CDTEM == cdtem && element1.CDPTA == cdpta) {
                    num1++;
                    var tmpElement1 = Object.assign({}, element1);
                    tmpElement1.NRO = num1;

                    var fehoarr = ""
                    if (tmpElement1.FEARR) {
                        //var tmpDate = new Date(tmpElement1.FEARR);
                        var fearr = tmpElement1.FEARR;
                        fehoarr = fearr + " " + tmpElement1.HEARR;
                    }
                    tmpElement1.FEHOARR = fehoarr;


                    if (tmpElement1.ESMAR == 'C' || tmpElement1.CDEED == "010" || (tmpElement1.ESMAR == "A" && tmpElement1.ESCMA)) {

                        if (tmpElement1.CDEED == "010") {

                        } else {

                        }
                        tmpElement1.visibleAnularMarea = false;
                        tmpElement1.DESCLINK = "Crear";

                    } else {
                        tmpElement1.visibleAnularMarea = true;
                        tmpElement1.DESCLINK = "Editar";

                    }


                    /*
                    tmpElement1.DESCESMAR = "";
                    if (tmpElement1.ESMAR == "A" || tmpElement1.ESMAR == 'C') {
                        tmpElement1.DESCESMAR = tmpElement1.ESMAR == "A" ? "Abierto" : "Cerrado"
                    }

                    //validar descripcion link
                    if (tmpElement1.ESMAR == "C" || tmpElement1.CDEED == "010" || (tmpElement1.ESMAR == "A" && tmpElement1.ESCMA != "")) {
                        tmpElement1.DESCLINK = "Crear"
                    } else {
                        tmpElement1.DESCLINK = "Editar"
                    }*/

                    dataTerceros.push(tmpElement1);
                }
            }
            //console.log("DATA TERCEROS: ", dataTerceros);
            modelo.setProperty("/TercerosFiltro", dataTerceros);
            /*var modeloMareaTerceros = new JSONModel(dataTerceros);
            this.getView().byId("tblMareasTerceros").setModel(modeloMareaTerceros);*/
            //modelo.setProperty("/Mareas/Terceros", dataTerceros);
            //this.getView().byId("itfTerceros").setCount(dataTerceros.length);
            modelo.setProperty("/Utils/CountTerceros", dataTerceros.length);
            modelo.setProperty("/Utils/visibleRowsTerceros", dataTerceros.length);
            //setear header para total de pesca declarada
            var ttPescaDecl = totalPescaDeclarada.toString();
            //this.getView().byId("idObjectHeader").setNumber(ttPescaDecl);
            modelo.setProperty("/Utils/TotalPescDecl", ttPescaDecl);
            modelo.setProperty("/Utils/SelectedKey", "itfPropios");
            this.cargarDatosResumenMarea();
            //this.getView().byId("idIconTabBar").setSelectedKey("itfPropios");
            modelo.refresh();
        },

        onActualizaMareas: async function () {
            this.actualizarMareas(true);
            /*else {
                MessageBox.information(this.oBundle.getText("ERRORSLECCIONEPLANTA"));
            }*/
        },
        actualizarMareas : async function(msgActu){
            BusyIndicator.show(0);
            var me = this;
            var currentUser = await me.getCurrentUser();
            var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.Session);
            var cdpta = oStore.get("CDPTA");
            var cdtem = oStore.get("CDTEM");
            if (cdtem && cdpta) {
                var listaMareas = await TasaBackendService.cargarListaMareas(currentUser);
                //console.log("Lista Mareas: ", listaMareas);
                if (listaMareas) {
                    this.validarDataMareas(listaMareas);
                    this.filtarMareas(cdtem, cdpta);
                    BusyIndicator.hide();
                    if(msgActu){
                        MessageBox.success("Se actualizó correctamente...", {
                            title: "Exitoso"
                        });
                    }
                }
            } 
        },

        getSerachingHelpComponents: function (oModel, sAyudaBusqId) {
            let sUrlSubaccount = this.getHostSubaccount().url,
                aSearchingHelp = ["busqarmadores"],
                // iCountF = aSearchingHelp.length,
                // iCount = 0,
                oComponent,
                nameComponent,
                idComponent,
                urlComponent;

            // BusyIndicator.show(0);
            aSearchingHelp.forEach(elem => {
                // let comCreateOk = function(oEvent){
                // 	if(iCountF === iCount) BusyIndicator.hide();
                // };
                oComponent = {};
                nameComponent = elem;
                idComponent = elem;
                urlComponent = `${sUrlSubaccount}/${sAyudaBusqId}.AyudasBusqueda.${elem}-1.0.0`;
                oComponent = new sap.ui.core.ComponentContainer({
                    id: idComponent,
                    name: nameComponent,
                    url: urlComponent,
                    settings: {},
                    componentData: {},
                    propagateModel: true,
                    // componentCreated:comCreateOk,
                    height: '100%',
                    // manifest:true,
                    async: false
                });
                oModel.setProperty(`/${elem}`, oComponent)
                // iCount++
            });
        },

        getHostSubaccount: function () {

            var urlIntance = window.location.origin,

                sUrlSubaccount,

                sParam;



            if (urlIntance.indexOf('tasaqas') !== -1) {

                sUrlSubaccount = 'tasaqas'; // aputando a QAS

                sParam = "IDH4_QAS"

            } else if (urlIntance.indexOf('tasaprd') !== -1) {

                sUrlSubaccount = 'tasaprd'; // apuntando a PRD

                sParam = "IDH4_PRD"

            } else if (urlIntance.indexOf('localhost') !== -1) {

                sUrlSubaccount = 'tasadev'; // apuntando a DEV

                sParam = "IDH4_DEV"

            } else {

                sUrlSubaccount = 'tasadev'; // apuntando a DEV

                sParam = "IDH4_DEV"

            }



            return {

                url: `https://${sUrlSubaccount}.launchpad.cfapps.us10.hana.ondemand.com`,

                param: sParam

            };

        },

        onLocation: function () {

            var oRouter = window.location.origin;

            console.log(oRouter)

            var service = "";

            if (oRouter.indexOf("localhost") !== -1) {

                service = 'https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com/api/'

            }

            if (oRouter.indexOf("tasadev") !== -1) {

                service = 'https://cf-nodejs-cheerful-bat-js.cfapps.us10.hana.ondemand.com/api/'

            }

            if (oRouter.indexOf("tasaprd") !== -1) {

                service = 'https://cf-nodejs-prd.cfapps.us10.hana.ondemand.com/api/'

            }

            if (oRouter.indexOf("tasaqas") !== -1) {

                service = 'https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com/api/'

            }

            console.log(service);

            return service;

        },

        _getHelpSearch: function () {
            var oRouter = window.location.origin;
            var service = [];
            if (oRouter.indexOf("localhost") !== -1) {
                service.push({
                    url: "https://tasaqas.launchpad.cfapps.us10.hana.ondemand.com/",
                    parameter: "IDH4_QAS"
                })
            }
            if (oRouter.indexOf("tasadev") !== -1) {
                service.push({
                    url: "https://tasadev.launchpad.cfapps.us10.hana.ondemand.com/",
                    parameter: "IDH4_DEV"
                })
            }
            if (oRouter.indexOf("tasaprd") !== -1) {
                service.push({
                    url: "https://tasaprd.launchpad.cfapps.us10.hana.ondemand.com/",
                    parameter: "IDH4_PRD"
                })
            }
            if (oRouter.indexOf("tasaqas") !== -1) {
                service.push({
                    url: "https://tasaqas.launchpad.cfapps.us10.hana.ondemand.com/",
                    parameter: "IDH4_QAS"
                })
            }
            return service;
        },

        _getReusable: function(){
            var oRouter = window.location.origin;
            var service = [];
            if (oRouter.indexOf("localhost") !== -1) {
                service.push({
                    url: "https://tasaqas.launchpad.cfapps.us10.hana.ondemand.com/",
                    parameter: "IDEVT_QAS"
                })
            }
            if (oRouter.indexOf("tasadev") !== -1) {
                service.push({
                    url: "https://tasadev.launchpad.cfapps.us10.hana.ondemand.com/",
                    parameter: "IDEVT_DEV"
                })
            }
            if (oRouter.indexOf("tasaprd") !== -1) {
                service.push({
                    url: "https://tasaprd.launchpad.cfapps.us10.hana.ondemand.com/",
                    parameter: "IDEVT_PRD"
                })
            }
            if (oRouter.indexOf("tasaqas") !== -1) {
                service.push({
                    url: "https://tasaqas.launchpad.cfapps.us10.hana.ondemand.com/",
                    parameter: "IDEVT_QAS"
                })
            }
            return service;
        },

        validaComboTipoEvento: function (sData) {
            var oVal = [];
            var modeloDetalleMarea = this.getOwnerComponent().getModel("DetalleMarea");
            //var dataDetalleMarea = modeloDetalleMarea.getData();
            var motivoMarea = modeloDetalleMarea.getProperty("/Form/CDMMA");
            var eventos = modeloDetalleMarea.getProperty("/Eventos/Lista");
            var motivosSinZarpe = ["3", "7", "8"];
            var motivoEventoHo = ["7", "8"];
            var motivoCalaSDes = ["4", "5", "6"];
            if (motivosSinZarpe.includes(motivoMarea)) {
                if (motivoEventoHo.includes(motivoMarea)) {
                    var existeEveHoro = false;
                    for (let index = 0; index < eventos.length; index++) {
                        const element = eventos[index];
                        if (element.CDTEV == "H" || element.CDTEV == "T") {
                            existeEveHoro = true;
                            //llenamos solo siniestro
                            for (let index = 0; index < sData.length; index++) {
                                const element = sData[index];
                                if (element.id == "8") {
                                    oVal.push(element);
                                    break;
                                }
                            }
                            break;
                        }
                    }
                    if (!existeEveHoro) {
                        for (let index = 0; index < sData.length; index++) {
                            const element = sData[index];
                            if (element.id == "8" || element.id == "H" || element.id == "T") {
                                oVal.push(element);
                            }
                        }
                    }
                } else {
                    for (let index = 0; index < sData.length; index++) {
                        const element = sData[index];
                        if (element.id == "8") {
                            oVal.push(element);
                            break;
                        }
                    }
                }
            } else {
                if (eventos.length > 0) {
                    var ultimoEvento = eventos[eventos.length - 1];
                    var tipoEvento = ultimoEvento.CDTEV;
                    if (tipoEvento == "1" || tipoEvento == "4") {
                        for (let index = 0; index < sData.length; index++) {
                            const element = sData[index];
                            if (element.id == "2" || element.id == "5" || element.id == "8") {
                                oVal.push(element);
                            }
                        }
                    } else if (tipoEvento == "2" || tipoEvento == "3") {
                        for (let index = 0; index < sData.length; index++) {
                            const element = sData[index];
                            if (element.id == "3" || element.id == "4" || element.id == "8") {
                                oVal.push(element);
                            }
                        }
                    } else if (tipoEvento == "5" || tipoEvento == "6") {
                        if (tipoEvento == "5" && ultimoEvento.CDMNP || motivoCalaSDes.includes(motivoMarea)) {
                            for (let index = 0; index < sData.length; index++) {
                                const element = sData[index];
                                if (element.id == "1" || element.id == "7" || element.id == "8") {
                                    oVal.push(element);
                                }
                            }
                        } else {
                            for (let index = 0; index < sData.length; index++) {
                                const element = sData[index];
                                if (element.id == "1" || element.id == "6" || element.id == "7" || element.id == "8") {
                                    oVal.push(element);
                                }
                            }
                        }
                    } else if (tipoEvento == "7" || tipoEvento == "8") {
                        for (let index = 0; index < sData.length; index++) {
                            const element = sData[index];
                            if (element.id == "1" || element.id == "8") {
                                oVal.push(element);
                            }
                        }
                    }
                } else {
                    for (let index = 0; index < sData.length; index++) {
                        const element = sData[index];
                        if (element.id == "8" || element.id == "1") {
                            oVal.push(element);
                        }
                    }
                }
            }
            //var primerItem = oVal[0];
            //modeloDetalleMarea.setProperty("/Utils/TipoEvento", primerItem.id);
            modeloDetalleMarea.setProperty("/Config/datosCombo/TipoEventos", oVal);
            //dataDetalleMarea.Config.datosCombo.TipoEventos = oVal;
            modeloDetalleMarea.refresh();
        },

        validarMotivoMarea: async function () {
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var esNuevo = modelo.getProperty("/Form/EsNuevo");
            var motivo = modelo.getProperty("/Form/CDMMA");
            var estado = modelo.getProperty("/Form/ESMAR");
            var listaMotivos = modelo.getProperty("/Config/datosCombo/MotivosMarea");
            var objMotivo = listaMotivos.find(obj => obj.id == motivo);
            var motivoSinZarpe = ["3", "7", "8"];
            var listaMensajes = modelo.getProperty("/Utils/MessageItemsDM");
            modelo.setProperty("/Config/visibleFecHoEta", true);
            modelo.setProperty("/Config/visibleFechIni", false);
            modelo.setProperty("/Config/visibleFechFin", false);
            modelo.setProperty("/Config/visibleUbiPesca", false);
            modelo.setProperty("/Form/DESC_CDMMA", objMotivo.descripcion);
            modelo.setProperty("/Form/FEARR", null);
            modelo.setProperty("/Form/HEARR", null);
            modelo.setProperty("/Form/FIMAR", null);
            modelo.setProperty("/Form/HIMAR", null);
            modelo.setProperty("/Form/FFMAR", null);
            modelo.setProperty("/Form/HFMAR", null);
            if(motivoSinZarpe.includes(motivo)){
                var motivoAnt = modelo.getProperty("/MareaAnterior/CDMMA");
                var tipoEveAnt = modelo.getProperty("/MareaAnterior/EventoMarAnt/CDTEV");
                modelo.setProperty("/Config/visibleFecHoEta", false);
                modelo.setProperty("/Config/visibleFechIni", true);
                modelo.setProperty("/Config/readOnlyEstaMar", true);
                modelo.setProperty("/Config/readOnlyFechIni", false);
                if(estado == "C"){
                    modelo.setProperty("/Config/visibleFechFin", true);
                }
                if(motivoAnt){
                    var fechHorEve = true;
                    var fechaIni = modelo.getProperty("/MareaAnterior/EventoMarAnt/FIEVN");
                    var horaIni = modelo.getProperty("/MareaAnterior/EventoMarAnt/HIEVN");
                    var ultFechaHora = "";
                    var mensUltValid = "";
                    var eveVisFechaFin = ["3", "6", "7"];
                    if(eveVisFechaFin.includes(tipoEveAnt)){
                        fechaIni = modelo.getProperty("/MareaAnterior/EventoMarAnt/FFEVN");
                        horaIni = modelo.getProperty("/MareaAnterior/EventoMarAnt/HFEVN");
                    }
                    if(motivoSinZarpe.includes(motivoAnt)){
                        fechHorEve = false;
                        fechaIni = modelo.getProperty("/MareaAnterior/FIMAR");
                        horaIni = modelo.getProperty("/MareaAnterior/HIMAR");
                    }
                    ultFechaHora = fechaIni + " " + horaIni;
                    if(fechHorEve){
                        var cdtevMarAnt = modelo.getProperty("/MareaAnterior/EventoMarAnt/DESC_CDTEV");
                        mensUltValid = this.getResourceBundle().getText("ULTEVEFECHAHORA", [cdtevMarAnt, ultFechaHora]);
                    }else{
                        mensUltValid = this.getResourceBundle().getText("FECHAHORAFIN", [ultFechaHora]);
                    }
                    var descMarea = modelo.getProperty("/MareaAnterior/NRMAR") + " " + modelo.getProperty("/MareaAnterior/DESC_CDMMA");
                    var mssg = this.getResourceBundle().getText("MENSFECHORMARANT", [descMarea, mensUltValid]);
                    var indice = listaMensajes.length + 1;
                    var objMessage = {
                        type: 'Success',
                        title: 'Mensaje de Validación',
                        activeTitle: false,
                        description: mssg,
                        subtitle: mssg,
                        counter: indice
                    };
                    listaMensajes.push(objMessage);
                    modelo.setProperty("/Form/FIMAR", fechaIni);
                    modelo.setProperty("/Form/HIMAR", horaIni);
                    modelo.setProperty("/Config/readOnlyFechIni", false);
                    modelo.refresh();
                    var vedaVerificada = modelo.getProperty("/Utils/VedaVerificada");
                    if(motivo == "8" && !vedaVerificada){
                        await this.validarFechaVeda(fechaIni, true);
                    }
                }else{
                    modelo.setProperty("/Config/readOnlyFechIni", true);
                }
            }else{
                modelo.setProperty("/Form/ESMAR", "A");
                if(esNuevo){
                    modelo.setProperty("/Config/readOnlyEstaMar", false);
                }
            }

            var motivoMarPesca = ["1", "2"];
            if(motivoMarPesca.includes(motivo)){
                modelo.setProperty("/Form/INUBC", motivo);
            }else{
                modelo.setProperty("/Config/visibleUbiPesca", true);
            }

            if(esNuevo){
                if(motivoSinZarpe.includes(motivo)){
                    this.setVisibleBtnSave(true, false);
                }else{
                    this.setVisibleBtnSave(false, true);
                }
            }
            modelo.refresh();
        },

        validaDescargas: async function () {
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var listaEventos = modelo.getProperty("/Eventos/Lista");
            var motivoMarea = modelo.getProperty("/Form/CDMMA");
            var estadoMarea = modelo.getProperty("/Form/ESMAR");
            for (let index = 0; index < listaEventos.length; index++) {
                const element = listaEventos[index];
                if (element.CDTEV == "6") {
                    if (estadoMarea == "A" && motivoMarea == "2" && element.INPRP == "P" && element.NRDES) {
                        await this.verificarErroresMarea(element.NRDES);
                        break;
                    }
                }
            }
        },
        cargarDatosReutilizables:async function(){

            //CARGA DE MODELO UNA SOLA VEZ
            let modeloDetalleMarea = this.getOwnerComponent().getModel("DetalleMarea");
            let listaDominios = [{
                "domname": "1ZONAPESCA",
                "status": "A"
            }, {
                "domname": "ZESOPE",
                "status": "A"
            }, {
                "domname": "ZCDMLM",
                "status": "A"
            }, {
                "domname": "ZCDTDS",
                "status": "A"
            },{
                "domname": "ZCDMNP",
                "status": "A"
            },
            {
                "domname": "ZCDMES",
                "status": "A"
            },
            {
                "domname": "ZD_SISFRIO",
                "status": "A"
            },
            {
                "domname": "ESPECIE",
                "status": "A"
            }];
            let serv1 = TasaBackendService.obtenerConfiguracionEvento();
            let serv2 = TasaBackendService.obtenerDominioVarios(listaDominios);
            await Promise.all([serv1, serv2]).then(values => {
                modeloDetalleMarea.setProperty("/Eventos/ListaDominios", values[1]);
                modeloDetalleMarea.setProperty("/Eventos/ConfEventos", values[0]);
            }).catch(reason => {

            });
            //-----------
            
        },

        editRecord: async function(marea){
            BusyIndicator.show(0);
            var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.Session);
            var prepareEditRecord = await this.prepareEditRecord(marea);
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var modeloListaMareas = this.getOwnerComponent().getModel("ListaMareas");
            var modeloPlantas = this.getOwnerComponent().getModel("PlantasModel");
            var constantsUtility = this.getOwnerComponent().getModel("ConstantsUtility");
            if(prepareEditRecord){
                modelo.setProperty("/DataSession/Type", "EDIT");
                modelo.refresh();
                var dataBckpModelo = modelo.getData();
                oStore.put("DataModeloBckp", dataBckpModelo);
                this.getOwnerComponent().setModel(modelo, "DataModelo");
                this.getOwnerComponent().setModel(modeloListaMareas, "ModeloListaMareas");
                this.getOwnerComponent().setModel(modeloPlantas, "ModeloPlantasModel");
                this.getOwnerComponent().setModel(constantsUtility, "ModeloConstants");
                BusyIndicator.hide();
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                //oRouter.navTo("DetalleMarea");
                oRouter.navTo("DetalleEventoExt");
            }
        },

        prepareEditRecord: async function(marea){
            if(marea > 0){
                return await this.abrirDetalleMarea(marea);
            }
            return false;
        },

        abrirDetalleMarea: async function(marea){
            var bOk = false;
            var usuario = await this.getCurrentUser();
            var datosMarea = await TasaBackendService.obtenerDetalleMarea(marea, usuario);
            await this.clearAllData();
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            modelo.setProperty("/Form/EsNuevo", false);
            modelo.setProperty("/Config/visibleFecHoEta", true);
            modelo.setProperty("/Config/visibleTabReserva", false);
            modelo.setProperty("/Config/visibleTabVenta", false);
            modelo.setProperty("/Config/readOnlyMotMarea", false);
            modelo.setProperty("/Config/readOnlyEstaMar", true);
            modelo.setProperty("/Config/readOnlyFechIni", false);

            var mareaNode = datosMarea.s_marea;
            var nodoEventos = datosMarea.s_evento;

            var incidental = datosMarea.str_pscinc;
            var biometria = datosMarea.str_flbsp;
            var biometriaRes = datosMarea.str_flbsp_matched; // AJUSTE DE BIOMETRIA ----EACOSTA

            if(mareaNode.length > 0){
                bOk = true;
                var mareaElement = mareaNode[0];
                var form = modelo.getProperty("/Form");
                for (var key in mareaElement) {
                    if(form.hasOwnProperty(key)){
                        form[key] = mareaElement[key];
                    }
                }
                modelo.setProperty("/Form/INDICADOR", "E");
                modelo.setProperty("/Form/FCMOD", Utils.dateToStrDate(new Date()));
                modelo.setProperty("/Form/HRMOD", Utils.dateToStrHours(new Date()));
                modelo.setProperty("/Form/ATMOD", usuario);
                modelo.refresh();

                var cppms = modelo.getProperty("/Form/CPPMS");
                var tcbps = modelo.getProperty("/Form/TCBPS");
                if(!isNaN(cppms) && !isNaN(tcbps)){
                    var sumCapBodPerm = cppms + tcbps;
                    modelo.setProperty("/Form/CapBodegaPermiso", sumCapBodPerm);
                }

                var codigo = modelo.getProperty("/Form/CDEMB");
                await this.obtenerDatosDistribFlotaMarea(codigo);

                this.cambiarValoresMotivo();

                var fearr = modelo.getProperty("/Form/FEARR");
                if(!fearr){
                    modelo.setProperty("/Form/HEARR", "");
                }

                var esmar = modelo.getProperty("/Form/ESMAR");
                if(esmar == "A"){
                    await this.obtenerDatosMareaAnt(marea, codigo);
                }

                var motMar = modelo.getProperty("/Form/CDMMA");
                var motivoSinZarpe = ["3", "7", "8"];
                if(motivoSinZarpe.includes(motMar)){
                    modelo.setProperty("/Config/readOnlyFechIni", false);
                    modelo.setProperty("/Config/visibleFecHoEta", false);
                    modelo.setProperty("/Config/visibleFechIni", true);
                    modelo.setProperty("/Config/visibleFechFin", true);
                    if(esmar == "A" && motMar == "8"){
                        var fecInicio = modelo.getProperty("/Form/FIMAR");
                        await this.obtenerLimiteVeda(fecInicio, true);
                    }
                }

                var motivoMarPesca = ["1", "2"];
                if(!motivoMarPesca.includes(motMar)){
                    modelo.setProperty("/Config/visibleUbiPesca", true);
                }

                var indPropiedad = modelo.getProperty("/Form/INPRP");
                if(indPropiedad == "P"){
                    modelo.setProperty("/Config/visibleBtnArmador", false);
                    modelo.setProperty("/Config/visibleEnlNueArmador", false);
                }else{
                    modelo.setProperty("/Config/visibleBtnArmador", true);
                    modelo.setProperty("/Config/visibleEnlNueArmador", true);
                }

                for (let index1 = 0; index1 < nodoEventos.length; index1++) {
                    const element = nodoEventos[index1];
                    element.Indicador = "E";
                    element.LatitudD = Utils.getDegrees(element.LTGEO);
                    element.LatitudM = Utils.getMinutes(element.LTGEO);
                    element.LongitudD = Utils.getDegrees(element.LNGEO);
                    element.LongitudM = Utils.getMinutes(element.LNGEO)
                }

                modelo.setProperty("/Eventos/TituloEventos", "Eventos (" + nodoEventos.length + ")")
                modelo.setProperty("/Eventos/Lista", nodoEventos);
                modelo.setProperty("/Eventos/BiometriaRest", biometriaRes);   // AJUSTE DE BIOMETRIA ----EACOSTA
                modelo.setProperty("/Incidental", incidental);
                modelo.setProperty("/Biometria", biometria);
                modelo.refresh();

                var eventos = modelo.getProperty("/Eventos/Lista");
                for (let index = 0; index < eventos.length; index++) {
                    const element = eventos[index];
                    if(element.CDTEV == "6"){
                        modelo.setProperty("/Config/visibleBtnArmador", false);
                        modelo.setProperty("/Config/visibleEnlNueArmador", false);
                        if(esmar == "A" && motMar == "2" && element.INPRP == "P" && element.NRDES){
                            await this.verificarErroresMarea(element.NRDES);
                        }
                    }
                }

                var motivoResCombu = ["1", "2", "4", "5", "6", "7", "8"];
                if(indPropiedad == "P" && motivoResCombu.includes(motMar)){
                    await this.obtenerReservasCombustible(marea, codigo);
                }

                if(indPropiedad == "T"){
                    await this.obtenerVentasCombustible(marea);
                }

                if(esmar == "A"){
                    this.setVisibleBtnSave(true, false);
                }else if(esmar == "C"){
                    modelo.setProperty("/Config/readOnlyEstaMar", false);
                    modelo.setProperty("/Config/readOnlyFechFin", false);
                    modelo.setProperty("/Config/readOnlyHorFin", false);
                    modelo.setProperty("/Config/visibleBtnEventos", false);
                    modelo.setProperty("/Config/readOnlyUbicPesca", false);
                    modelo.setProperty("/Config/readOnlyObs", false);
                    modelo.refresh();
                    this.setVisibleBtnSave(false, false);
                }
                
                var soloLectura = modelo.getProperty("/DataSession/SoloLectura");
                if(soloLectura){
                    modelo.setProperty("/Config/visibleBtnEventos", false);
                    modelo.setProperty("/Config/readOnlyMotMarea", false);
                    modelo.setProperty("/Config/readOnlyUbicPesca", false);
                    modelo.setProperty("/Config/readOnlyEstaMar", false);
                    modelo.setProperty("/Config/readOnlyObs", false);
                    modelo.setProperty("/Config/readOnlyFechFin", false);
                    modelo.setProperty("/Config/readOnlyHorFin", false);
                    modelo.setProperty("/Config/readOnlyFecHoEta", false);
                    modelo.setProperty("/Config/readOnlyFechIni", false);
                    modelo.refresh();
                }
            }
            modelo.refresh();
            return bOk;
        },

        cambiarValoresMotivo: function(){
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var values = modelo.getProperty("/Utils/BckMotMarea");
            var inprp = modelo.getProperty("/Form/INPRP");
            var newValues = [];
            if(inprp){
                if(inprp == "P"){
                    newValues = values;
                }else{
                    var motivoMarPesca = ["1", "2"];
                    for (let index = 0; index < values.length; index++) {
                        const element = values[index];
                        if(motivoMarPesca.includes(element.id)){
                            newValues.push(element);
                        }
                    }
                }
                modelo.setProperty("/Config/datosCombo/MotivosMarea", newValues);
                modelo.refresh();
            }
        },

        obtenerArmadorPropietario: async function(){
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var usuario = await this.getCurrentUser();
            var armadores = await TasaBackendService.obtenerArmadorPropietario(usuario);
            if(armadores){
                modelo.setProperty("/Utils/ArmadorPropietario", armadores.data);
                modelo.refresh();
            }
        },

        obtenerLimiteVeda: async function (fechaIni, mostrar) {// dd/MM/yyyy - true/false
            var veda = true;
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var mareaReabierta = modelo.getProperty("/DataSession/MareaReabierta");
            //var fechaIni = modelo.getProperty("/Form/FIMAR");
            var dateFechaIni = Utils.strDateToDate(fechaIni);
            var fechaActual = new Date();
            if (fechaActual.getTime() > dateFechaIni.getTime()) {
                var fechaFinReal = dateFechaIni;
                dateFechaIni.setDate(dateFechaIni.getDate() + 1);
                modelo.setProperty("/Utils/VedaVerificada", true);
                veda = await this.validarTemporadaVeda(Utils.dateToStrDate(dateFechaIni));
                if (!veda) {
                    modelo.setProperty("/Utils/FecVedaMax", Utils.dateToStrDate(fechaFinReal));
                    if(mostrar){
                        modelo.setProperty("/Form/FFMAR", Utils.dateToStrDate(fechaFinReal));
                        modelo.setProperty("/Config/readOnlyHorFin", true);
                        modelo.setProperty("/Config/visibleFechFin", true);
                        if(fechaFinReal.getTime() >=  fechaActual.getTime()){
                            modelo.setProperty("/Config/readOnlyFechFin", false);
                        }
                        if(!mareaReabierta){
                            modelo.setProperty("/Form/HFMAR", null);
                        }
                    }
                    var mssg = this.getResourceBundle().getText("SOLOVEDAHASTA") + " " + Utils.dateToStrDate(fechaFinReal);
                    var messageItems = modelo.getProperty("/Utils/MessageItemsDM");
                    var index = messageItems.length + 1;
                    var objMessage = {
                        type: 'Information',
                        title: 'Mensaje de Validación',
                        activeTitle: false,
                        description: mssg,
                        subtitle: mssg,
                        counter: index
                    };
                    messageItems.push(objMessage);
                }
            }
            modelo.refresh();
        },

        mostrarErroresMarea: function(){
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            modelo.setProperty("/Config/visibleBtnEventos", false);
            modelo.setProperty("/Config/visibleEnlDetalleEvento", false);
            this.setVisibleBtnSave(false, false);
            modelo.refresh();
        },

        verificarErroresMarea: async function (nroDescarga) {
            await this.validarErroresDescargaMarea(nroDescarga);
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var messageItems = modelo.getProperty("/Utils/MessageItemsDM");
            if (messageItems.length > 0) {
                this.mostrarErroresMarea();
            } 
        },

        prepareNewRecord: async function(){
            await this.clearAllData();
            return true;
        },

        validarFechaVeda: async function (fechaIni, mostrar) {
            var veda = await this.validarTemporadaVeda(fechaIni);
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var listaMensajes = modelo.getProperty("/Utils/MessageItemsDM");
            //var fechaIni = modelo.getProperty("/Form/FIMAR");
            var puerto = modelo.getProperty("/DistribFlota/CDPTO");
            var descPuerto = modelo.getProperty("/DistribFlota/DESCR");
            if (veda) {
                modelo.setProperty("/Utils/BckFecInicio", fechaIni);
                await this.obtenerLimiteVeda(fechaIni, mostrar);
            } else {
                modelo.setProperty("/Form/CDMMA", null);
                modelo.setProperty("/Form/DESC_CDMMA", null)
                modelo.setProperty("/Form/FIMAR", null);
                modelo.setProperty("/Form/HIMAR", null);
                modelo.setProperty("/Form/FFMAR", null);
                modelo.setProperty("/Form/HFMAR", null);
                var strPuerto = puerto + " " + descPuerto;
                var mssg = this.getResourceBundle().getText("NOVEDFECHAPTO", [fechaIni, strPuerto]);
                var indice = listaMensajes.length + 1;
                var objMessage = {
                    type: 'Error',
                    title: 'Mensaje de Validación',
                    activeTitle: false,
                    description: mssg,
                    subtitle: mssg,
                    counter: indice
                };
                listaMensajes.push(objMessage);
                modelo.refresh();
                //MessageBox.error(mssg);
            }
            return veda;
        },

        validarTemporadaVeda: async function (fecha) { //dd/MM/yyyy
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var veda = false;
            var usuario = await this.getCurrentUser();
            var strFecha = Utils.strDateToSapDate(fecha);
            var response = await TasaBackendService.obtenerTemporadaVeda(strFecha, usuario);
            if (response.data) {
                var latVed = modelo.getProperty("/DistribFlota/IntLatPuerto");
                var litorales = response.data;
                for (let index = 0; index < litorales.length; index++) {
                    const element = litorales[index];
                    var latIni = parseInt(element.LTINI.replace('°', '').replace("'", ''));
                    var latFin = parseInt(element.LTFIN.replace('°', '').replace("'", ''));
                    var millas = parseFloat(element.MILLA).toFixed(3);
                    if (latVed >= latIni && latVed <= latFin && millas > 0) {
                        veda = true;
                        break;
                    }
                }
            }
            return veda;
        },

        validarFechaIniFin: async function () {
            var vFin = false;
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var motivo = modelo.getProperty("/Form/CDMMA");
            var estado = modelo.getProperty("/Form/ESMAR");
            var esNuevo = modelo.getProperty("/Form/EsNuevo");
            var motivoSinZarpe = ["3", "7", "8"];
            var fechHorIni = null;
            var fechHorActual = new Date();
            var listaMensajes = modelo.getProperty("/Utils/MessageItemsDM");
            if (esNuevo) {
                if (motivoSinZarpe.includes(motivo)) {
                    var fechaIni = modelo.getProperty("/Form/FIMAR");
                    var horaIni = modelo.getProperty("/Form/HIMAR");
                    fechHorIni = Utils.strDateHourToDate(fechaIni, horaIni);
                    if (estado == "C") {
                        vFin = true;
                    }
                    if (fechHorIni.getTime() > fechHorActual.getTime()) {
                        vFin = false;
                        var mssg = this.getResourceBundle().getText("FECINIMARMENOFECHACT");
                        var index = listaMensajes.length + 1;
                        var objMessage = {
                            type: 'Error',
                            title: 'Mensaje de Validación',
                            activeTitle: false,
                            description: mssg,
                            subtitle: mssg,
                            counter: index
                        };
                        listaMensajes.push(objMessage);
                        modelo.refresh();
                    }
                    if (vFin && motivo == "8") {
                        var bckFecIni = modelo.getProperty("/Utils/BckFecInicio");
                        var fechaIniM = modelo.getProperty("/Form/FIMAR");
                        if(!bckFecIni || (bckFecIni && bckFecIni != fechaIniM)){
                            vFin = await this.validarFechaVeda(fechaIniM, false);
                        }
                    }
                }
            } else {
                if (motivoSinZarpe.includes(motivo) && estado == "C") {
                    vFin = true;
                }
            }

            if (vFin) {
                var fechaIni = modelo.getProperty("/Form/FIMAR");
                var horaIni = modelo.getProperty("/Form/HIMAR");
                fechHorIni = Utils.strDateHourToDate(fechaIni, horaIni);
                var fechaFin = modelo.getProperty("/Form/FFMAR");
                var horaFin = modelo.getProperty("/Form/HFMAR");
                var fechHorFin = Utils.strDateHourToDate(fechaFin, horaFin);
                if (fechHorFin.getTime() > fechHorActual.getTime()) {
                    vFin = false;
                    var mssg = this.getResourceBundle().getText("FECFINMARMENOFECHACT");
                    var index = listaMensajes.length + 1;
                    var objMessage = {
                        type: 'Error',
                        title: 'Mensaje de Validación',
                        activeTitle: false,
                        description: mssg,
                        subtitle: mssg,
                        counter: index
                    };
                    listaMensajes.push(objMessage);
                    modelo.refresh();
                } else if (!motivoSinZarpe.includes(motivo) && fechHorFin.getTime() < fechHorIni.getTime()) {
                    vFin = false;
                    var mssg = this.getResourceBundle().getText("FECINIMARMENFECFINMAR");
                    var index = listaMensajes.length + 1;
                    var objMessage = {
                        type: 'Error',
                        title: 'Mensaje de Validación',
                        activeTitle: false,
                        description: mssg,
                        subtitle: mssg,
                        counter: index
                    };
                    listaMensajes.push(objMessage);
                    modelo.refresh();
                } else if (motivoSinZarpe.includes(motivo)) {
                    if (fechHorFin.getTime() < fechHorIni.getTime()) {
                        var mssg = this.getResourceBundle().getText("FECFINMARNOMENFECINIMAR");
                        var index = listaMensajes.length + 1;
                        var objMessage = {
                            type: 'Error',
                            title: 'Mensaje de Validación',
                            activeTitle: false,
                            description: mssg,
                            subtitle: mssg,
                            counter: index
                        };
                        listaMensajes.push(objMessage);
                        modelo.refresh();
                    }
                }
            }
            modelo.refresh();
        },

        verificarArmadorTercero: function(){
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var indProp = modelo.getProperty("/Form/INPRP");
            var listaArmadores = modelo.getProperty("/Utils/ArmadorPropietario");
            var armador = modelo.getProperty("/Form/CDEMP");
            if(indProp == "T" && listaArmadores.includes(armador)){
                modelo.setProperty("/Form/CDEMP", null);
                modelo.setProperty("/Form/NAME1", null);
                var mssg = this.getResourceBundle().getText("ARMADORNOTERCERO");
            }


        },
        cargarDatosResumenMarea :function(){
            let modeloMareas = this.getOwnerComponent().getModel("ListaMareas");
            let dataPropios = [];
            let dataTerceros = [];
            dataPropios = modeloMareas.getProperty("/PropiosFiltro");
            dataTerceros = modeloMareas.getProperty("/TercerosFiltro");
            let cantPropios = Number(0);
            let cantTerceros = Number(0);
            let cantPdclTotal = Number(0);

            if (dataPropios.length > 0) {
                for (let index = 0; index < dataPropios.length; index++) {
                    const element = dataPropios[index];
                    cantPropios += Number(element.CNPCM) ? Number(element.CNPCM) : 0;
                }
            }
            if (dataTerceros.length > 0) {
                for (let index = 0; index < dataTerceros.length; index++) {
                    const element = dataTerceros[index];
                    cantTerceros += Number(element.CNPCM) ? Number(element.CNPCM) : 0;
                }
            }
            cantPdclTotal = cantPropios + cantTerceros;



            modeloMareas.setProperty("/Utils/TotalPescDecl", cantPdclTotal);
            modeloMareas.setProperty("/Utils/CantEmbProp", dataPropios.length);
            modeloMareas.setProperty("/Utils/CantEmbTerc", dataTerceros.length);
            modeloMareas.setProperty("/Utils/PescaDclPropio", cantPropios);
            modeloMareas.setProperty("/Utils/PescaDclTercero", cantTerceros);
        }


    });

}
);