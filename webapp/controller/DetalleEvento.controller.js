sap.ui.define([
    "./MainComp.controller",
    "sap/ui/core/mvc/Controller",
    "./General",
    "./Distribucion",
    "./PescaDeclarada",
    "./PescaDescargada",
    "./Horometro",
    "./Equipamiento",
    "./Siniestro",
    "./Accidente",
    "./Biometria",
    "../model/textValidaciones",
    "../model/eventosModel",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/integration/library",
    "sap/ui/core/Fragment",
    "../Service/TasaBackendService",
    "sap/m/MessageBox",
    'sap/ui/core/BusyIndicator',
    "./Utils",
    "./DetalleMarea.controller",
    'sap/m/MessageItem',
    'sap/m/MessagePopover',
	"sap/ui/core/UIComponent",
    "sap/ui/core/routing/History"
], function (
    MainComp,
	Controller,
	General,
	Distribucion,
	PescaDeclarada,
	PescaDescargada,
	Horometro,
	Equipamiento,
	Siniestro,
	Accidente,
	Biometria,
	textValidaciones,
	eventosModel,
	JSONModel,
	MessageToast,
	library,
	Fragment,
	TasaBackendService,
	MessageBox,
	BusyIndicator,
	Utils,
	DetalleMarea,
	MessageItem,
	MessagePopover,
	UIComponent,
    History
) {
    "use strict";
    var oMessageEP;
    
    // window.location.hash="no-back-button";
    // window.location.hash="Again-No-back-button";//again because google chrome don't insert first hash into history
    // window.onhashchange=function(){window.location.hash="no-back-button";}

    return MainComp.extend("com.tasa.registroeventospescav2.controller.DetalleEvento", {

        /**
         * @override
         */


        onInit: function () {
            
            this._vista = "";
            this.router = this.getOwnerComponent().getRouter();
            this.router.getRoute("DetalleEvento").attachPatternMatched(this._onPatternMatched, this);
            var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.session);
            oStore.put("flagFragment", true);
            this.oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            console.log(this.getOwnerComponent().getModel("DetalleMarea"));
            this.cargarMessagePopover();
            //this.router.attachRouteMatched(this._onRouteMatched,this );

                
        },
        _onRouteMatched :async function(oEvent){
                let urlIntance = "" +  window.location;
                //console.log("vista : " + oEvent.getParameter("name") + " - URL : " + urlIntance);&& oEvent.getParameter("name") == 
                if(urlIntance.indexOf('DetalleEvento') !== -1 ){
                    this._vista = "DetalleEvento";
                }else{
                    if(this._vista === "DetalleEvento"){
                        //metodo de validacion hacia atras
                        this.resetearValidaciones();
                        let mod = this.getOwnerComponent().getModel("DetalleMarea");
                        mod.setProperty("/Utils/MessageItemsEP", []);
                        if(this.validacioncampos == false){

                        }else{
                            let bOk = await this.Dat_PescaDescargada.validarDatosEvento();
                            var detalleMarea = this._FormMarea;//modelo detalle marea
                            if (!bOk) {
                                var mensaje = this.oBundle.getText("DISCCHANEVENTMESSAGE");
                                this.agregarMensajeValid("Error", mensaje);
                                this.Dat_Horometro.mostrarEnlaces();
                                this.getView().getModel("eventos").updateBindings(true);
                                //NAVEGACION SI VALORES SON INCORRECTOS
                                this.router.navTo("DetalleEvento");
                            } else {
                                detalleMarea.FormEditado = true;
                                this.getView().byId("Tab_eventos").setSelectedKey("");
                                await this.cargarValoresFormateados();
                                console.log("MOD: ", mod);
                                this.getView().getModel("eventos").updateBindings(true);
                                //NAVEGACION SI VALORES SON CORRECTOS
                                this.router.navTo("DetalleMarea");
                                this._vista = "";
                            }
                        }
                        console.log("Saliendo de ventana de detalle evento");
                    }
                }
                // if (oEvent.getParameter("name") !== "DetalleMarea") {
                //                 return;
                // }
                // var oHasher = new sap.ui.core.routing.HashChanger();
                // var hash = oHasher.getHash();
                // oHasher.setHash("DetalleEvento");
                // let hashprev = History.getInstance().getPreviousHash();
                // if(hashprev !== undefined ){
                //     if (oEvent.getParameter("name") === "DetalleMarea") {       
                //         this.validacionReg();
                //         this.router.navTo("DetalleEvento");
                //     }
                // }
            
        },

        validacionReg : async function(){
                        this.resetearValidaciones();
                        let mod = this.getOwnerComponent().getModel("DetalleMarea");
                        this.setProperty("/Utils/MessageItemsEP", []);
                        
                            if(this.validacioncampos == false){

                            }else{
                                let bOk = await this.Dat_PescaDescargada.validarDatosEvento();
                                var detalleMarea = this._FormMarea;//modelo detalle marea
                                if (!bOk) {
                                    var mensaje = this.oBundle.getText("DISCCHANEVENTMESSAGE");
                                    this.agregarMensajeValid("Error", mensaje);
                                    this.Dat_Horometro.mostrarEnlaces();
                                    this.getView().getModel("eventos").updateBindings(true);
                                    //NAVEGACION SI VALORES SON INCORRECTOS
                                    window.location.hash="no-back-button";
                                } else {
                                    detalleMarea.FormEditado = true;
                                    this.getView().byId("Tab_eventos").setSelectedKey("");
                                    await this.cargarValoresFormateados();
                                    console.log("MOD: ", mod);
                                    this.getView().getModel("eventos").updateBindings(true);
                                    //NAVEGACION SI VALORES SON CORRECTOS
                                    this._vista = "";
                                    this.router.navTo("DetalleMarea");
                                    
                                }
                            }
        },
        
        pruebaRet :function(oEvent){
            console.log("navegacion :c");
        },
        _selectItemWithId : function(id) {
            //implementation
        },
        /**
         * @override
         */
        onExit: function() {
            console.log("SALIENDO DEL COMPONENTE DE EVENTOS");
            //MainComp.prototype.onExit.apply(this, arguments);
            
        
        },
        _onObjectMatched: async function (oEvent) {
            if (oEvent.getParameter("name") !== navigation.Constants.EventDetailFragment) {
                return;
            }
            
            // let urlIntance = "" +  window.location;
            // //console.log("vista : " + oEvent.getParameter("name") + " - URL : " + urlIntance);&& oEvent.getParameter("name") == 
            // if(urlIntance.indexOf('DetalleEvento') !== -1 ){
            //     this._vista = "DetalleEvento";
            // }else{
            //     if(this._vista === "DetalleEvento"){
            //         //window.location = "http://localhost:8080/index.html#/DetalleEvento";
            //         console.log("Saliendo de ventana de detalle evento");
            //         return;
            //     }
            //     this._vista = "";
            // }
        },
        
        cargarMessagePopover: function(){
            let oMessageTemplate = new MessageItem({
				type: '{DetalleMarea>type}',
				title: '{DetalleMarea>title}',
				activeTitle: "{DetalleMarea>active}",
				description: '{DetalleMarea>description}',
				subtitle: '{DetalleMarea>subtitle}',
				counter: '{DetalleMarea>counter}'
			});

            oMessageEP = new MessagePopover({
				items: {
					path: 'DetalleMarea>/Utils/MessageItemsEP',
					template: oMessageTemplate
				}
			});
            this.byId("messagePopoverDetalleEve").addDependent(oMessageEP);
        },
        handleMessagePopoverPress: function (oEvent) {
			oMessageEP.toggle(oEvent.getSource());
		},

        onBackDetalleMarea: function () {
            let o_iconTabBar = sap.ui.getCore().byId("__xmlview3--Tab_eventos");
            o_iconTabBar.setSelectedKey("");
            history.go(-1);
        },

        _onPatternMatched: async function (oEvent) {
            

            //modelo de alejandro
            BusyIndicator.show(0);
            var modeloDetalleMarea = this.getOwnerComponent().getModel("DetalleMarea");
            var dataDetalleMarea = modeloDetalleMarea.getData();
            let ListaEventos_cont = dataDetalleMarea.Eventos.Lista;
            let TipoCons = modeloDetalleMarea.getProperty("/Utils/TipoConsulta");
            modeloDetalleMarea.setProperty("/Utils/MessageItemsEP", []);
            await this.cargarEstrucuturas(this);

            var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.Session);
            oStore.put("ListaBck", ListaEventos_cont);
            this.getView().byId("Tab_eventos").setSelectedKey("");

            if(TipoCons == "E"){
                /************ Carga de fragments de los eventos **************/
                let self = this;
                await this.cargarServiciosPreEvento(this).then(r => {

                    if (r) {
                        self.getFragment();
                    } else {
                        BusyIndicator.hide();
                        alert("Error");
                    }

                })
            }else{
                this.cerrarCrearEvento();
            }

        },
        cargarEstrucuturas : function(v_this) {
            let that = v_this;
            var modeloDetalleMarea = that.getOwnerComponent().getModel("DetalleMarea");
            var dataDetalleMarea = modeloDetalleMarea.getData();
            let ListaEventos_cont = dataDetalleMarea.Eventos.Lista;
            let MareaAnterior_cont = dataDetalleMarea.MareaAnterior;
            let EsperaMareaAnt_cont = dataDetalleMarea.EsperaMareaAnt;
            let FormEvent_cont = dataDetalleMarea;
            let TipoCons = modeloDetalleMarea.getProperty("/Utils/TipoConsulta");
            if(TipoCons == "E"){

                /********* Carga de variables globales **********/
                v_this.calendarioPescaCHD = dataDetalleMarea.calendarioPescaCHD;
                v_this.calendarioPescaCHI = dataDetalleMarea.calendarioPescaCHI;
                v_this.calendarioPescaVED = dataDetalleMarea.calendarioPescaVED;
                v_this._listaIncidental = dataDetalleMarea.Incidental;
                v_this._elementAct = modeloDetalleMarea.getProperty("/Eventos/LeadSelEvento");//ESTE ES ITEM DE LA LISTA DE EVENTOS SELECCIONADO
                v_this._utilNroEventoBio = "001";
                v_this._utilNroEventoIncid = "001";
                v_this._motivoMarea = dataDetalleMarea.Form.CDMMA != "" ? dataDetalleMarea.Form.CDMMA : dataDetalleMarea.Form.CDMMA;
                v_this._tipoEvento = ListaEventos_cont[v_this._elementAct].CDTEV;
                v_this._nroEvento = ListaEventos_cont[v_this._elementAct].NREVN;//ESTE ES EL NUMERO DEL EVENTO SELECCIONADO DE LA LISTA DE DETALLE
                v_this._nroMarea = FormEvent_cont.Form.NRMAR + "" == "" ? "0" : FormEvent_cont.Form.NRMAR + "";//"165728";
                v_this._nroDescarga = ListaEventos_cont[v_this._elementAct].NRDES;//"TCHI001444";
                v_this._indicador = "E"//ListaEventos_cont[this._elementAct].INPRP;//"E";
                v_this._indicadorPropXPlanta = ListaEventos_cont[v_this._elementAct].INPRP;
                v_this._codPlanta = FormEvent_cont.Form.CDPTA ? FormEvent_cont.Form.CDPTA : dataDetalleMarea.Form.CDPTA;
                v_this._embarcacion = FormEvent_cont.Form.CDEMB;//"0000000012";
                v_this._indicadorProp = FormEvent_cont.Form.INPRP;
                v_this._soloLectura = FormEvent_cont.DataSession.SoloLectura;//data de session solo lectura obtenida desde el principal
                v_this._EsperaMareaAnt = EsperaMareaAnt_cont;//[{ "id": "0" }, { "id": "1" }]; 
                v_this._listaEventos = ListaEventos_cont;
                v_this._FormMarea = FormEvent_cont.Form;
                v_this._mareaReabierta = FormEvent_cont.DataSession.MareaReabierta;
                v_this._zonaPesca = ListaEventos_cont[v_this._elementAct].CDZPC;
                v_this._IsRolRadOpe = true; //ESTO ES VALORES DE SON DE ROLES QUE VIENE DE MAREA
                v_this._IsRolIngComb = false;//ESTO ES VALORES DE SON DE ROLES QUE VIENE DE MAREA
                v_this._tipoPreservacion = ""; //viene de la consulta al servicio
                v_this._opSistFrio = FormEvent_cont.Utils.OpSistFrio; //VALOR DE UTILITARIO DE LA VISTA GLOBAL
                v_this._listasServicioCargaIni;
                v_this._listaEventosBkup;
                v_this._listaMareaAnterior = MareaAnterior_cont;
                v_this._eventoNuevo = "5"; //VALOR DEL ID DEL EVENTO NUEVO DE LA LISTA PRINCIPAL
                v_this._validBodegas = false;
                v_this._listaBiometriaRFC =  dataDetalleMarea.Eventos.BiometriaRest;
                v_this._confEventoMain = dataDetalleMarea.Eventos.ConfEventos;
                v_this._DominiosEvn = dataDetalleMarea.Eventos.ListaDominios;
                this.cargarListasEventoSelVacias(v_this);
                /************ Listas iniciales vacias **************/
                v_this._ConfiguracionEvento = {};
                v_this._cmbPuntosDescarga = [];
                v_this.validacioncampos = true;

                // var cardManifests = new JSONModel();
                var EventosModelo = new JSONModel();
                var oProductsModel = new JSONModel();
                var ModeloVisible = new JSONModel();

                that.getView().setModel(ModeloVisible, "visible");
                that.getView().setModel(oProductsModel, "products");
                that.getView().setModel(EventosModelo, "eventos");

                ModeloVisible.setData(textValidaciones.visible);
                EventosModelo.setData(v_this._listaEventos[v_this._elementAct]);
                oProductsModel.setData(eventosModel);
                oProductsModel.setProperty("/enabledEspecie", true);

                EventosModelo.setProperty("/enabledBodCantpesca", true);
                EventosModelo.setProperty("/enabledCantPescDeclarada", true);

                EventosModelo.setProperty("/enabledCantPescDescargada", true);
                EventosModelo.setProperty("/enabledCantPescDeclDesc", true);
                EventosModelo.setProperty("/enabledPuntoDescarga", true);
                EventosModelo.setProperty("/enabledFechProdDesc", true);
                EventosModelo.setProperty("/enabledAveriado", true);
                EventosModelo.setProperty("/enabledCantEquipamiento", true);

                v_this.modeloVisibleModel = that.getView().getModel("visible");
                v_this.modeloVisible = v_this.modeloVisibleModel.getData();
                v_this.modeloVisible.LinkRemover = false;
                v_this.modeloVisible.LinkDescartar = false

            }else{
                /********* Carga de variables globales **********/
                v_this.calendarioPescaCHD = dataDetalleMarea.calendarioPescaCHD;
                v_this.calendarioPescaCHI = dataDetalleMarea.calendarioPescaCHI;
                v_this.calendarioPescaVED = dataDetalleMarea.calendarioPescaVED;
                v_this._listaIncidental = dataDetalleMarea.Incidental;
                v_this._utilNroEventoBio = "001";
                v_this._utilNroEventoIncid = "001";
                v_this._motivoMarea = dataDetalleMarea.Form.CDMMA != "" ? dataDetalleMarea.Form.CDMMA : dataDetalleMarea.Form.CDMMA;
                v_this._tipoEvento = "";
                v_this._nroEvento = "";
                v_this._nroMarea = FormEvent_cont.Form.NRMAR + "" == "" ? "0" : FormEvent_cont.Form.NRMAR + "";//"165728";
                v_this._nroDescarga = "";
                v_this._indicadorPropXPlanta = "";
                v_this._indicador = "N"
                v_this._codPlanta = FormEvent_cont.Form.CDPTA ? FormEvent_cont.Form.CDPTA : FormEvent_cont.Form.CDPTA;
                v_this._embarcacion = FormEvent_cont.Form.CDEMB;//"0000000012";
                v_this._indicadorProp = FormEvent_cont.Form.INPRP;
                v_this._soloLectura = FormEvent_cont.DataSession.SoloLectura;//data de session solo lectura obtenida desde el principal
                v_this._EsperaMareaAnt = EsperaMareaAnt_cont;//[{ "id": "0" }, { "id": "1" }]; 
                v_this._listaEventos = ListaEventos_cont;
                v_this._elementAct = v_this._listaEventos.length;
                modeloDetalleMarea.setProperty("/Eventos/LeadSelEvento",v_this._elementAct);
                v_this._FormMarea = FormEvent_cont.Form;
                v_this._mareaReabierta = FormEvent_cont.DataSession.MareaReabierta;;
                v_this._zonaPesca = "";
                v_this._IsRolRadOpe = true; //ESTO ES VALORES DE SON DE ROLES QUE VIENE DE MAREA
                v_this._IsRolIngComb = false;//ESTO ES VALORES DE SON DE ROLES QUE VIENE DE MAREA
                v_this._tipoPreservacion = ""; //viene de la consulta al servicio
                v_this._opSistFrio = FormEvent_cont.Utils.OpSistFrio; //VALOR DE UTILITARIO DE LA VISTA GLOBAL
                v_this._listasServicioCargaIni;
                v_this._listaEventosBkup;
                v_this._listaMareaAnterior = MareaAnterior_cont;
                v_this._eventoNuevo = "";
                v_this._confEventoMain = dataDetalleMarea.Eventos.ConfEventos;
                v_this._DominiosEvn = dataDetalleMarea.Eventos.ListaDominios;
                /************ Listas iniciales vacias **************/
                v_this._ConfiguracionEvento = {};
                v_this._cmbPuntosDescarga = [];
                v_this.validacioncampos = true;

                var ModeloVisible = new JSONModel();
                v_this.getView().setModel(ModeloVisible, "visible");
                ModeloVisible.setData(textValidaciones.visible);

                v_this.modeloVisibleModel = v_this.getView().getModel("visible");
                v_this.modeloVisible = v_this.modeloVisibleModel.getData();
                v_this.modeloVisible.LinkRemover = false;
                v_this.modeloVisible.LinkDescartar = false
            }
        },
        cargarListasEventoSelVacias: function (v_this) {
            v_this._listaEventos[v_this._elementAct].TallaMin = v_this._listaEventos[v_this._elementAct].TallaMin ? v_this._listaEventos[v_this._elementAct].TallaMin : "0";
            v_this._listaEventos[v_this._elementAct].TallaMax = v_this._listaEventos[v_this._elementAct].TallaMax ? v_this._listaEventos[v_this._elementAct].TallaMax : "0";
            v_this._listaEventos[v_this._elementAct].ESOPE = v_this._listaEventos[v_this._elementAct].ESOPE ? v_this._listaEventos[v_this._elementAct].ESOPE : "";
            v_this._listaEventos[v_this._elementAct].STCMB = v_this._listaEventos[v_this._elementAct].STCMB ? v_this._listaEventos[v_this._elementAct].STCMB : "";
            v_this._listaEventos[v_this._elementAct].ESTSF = v_this._listaEventos[v_this._elementAct].ESTSF ? v_this._listaEventos[v_this._elementAct].ESTSF : "";
            v_this._listaEventos[v_this._elementAct].CDMLM = v_this._listaEventos[v_this._elementAct].CDMLM ? v_this._listaEventos[v_this._elementAct].CDMLM : "";
            v_this._listaEventos[v_this._elementAct].CDZPC = v_this._listaEventos[v_this._elementAct].CDZPC ? v_this._listaEventos[v_this._elementAct].CDZPC : "";
            v_this._listaEventos[v_this._elementAct].INDTR = v_this._listaEventos[v_this._elementAct].INDTR ? v_this._listaEventos[v_this._elementAct].INDTR : "E";
            v_this._listaEventos[v_this._elementAct].HFEVN = v_this._listaEventos[v_this._elementAct].HFEVN ? v_this._listaEventos[v_this._elementAct].HFEVN : "";
            v_this._listaEventos[v_this._elementAct].FFEVN = v_this._listaEventos[v_this._elementAct].FFEVN ? v_this._listaEventos[v_this._elementAct].FFEVN : "";
            v_this._listaEventos[v_this._elementAct].NRMAR = v_this._nroMarea;
            v_this._listaEventos[v_this._elementAct].LatitudD = v_this._listaEventos[v_this._elementAct].LatitudD ? v_this._listaEventos[v_this._elementAct].LatitudD : "000";
            v_this._listaEventos[v_this._elementAct].LatitudM = v_this._listaEventos[v_this._elementAct].LatitudM ? v_this._listaEventos[v_this._elementAct].LatitudM : "00";
            v_this._listaEventos[v_this._elementAct].LongitudD = v_this._listaEventos[v_this._elementAct].LongitudD ? v_this._listaEventos[v_this._elementAct].LongitudD : "000";
            v_this._listaEventos[v_this._elementAct].LongitudM = v_this._listaEventos[v_this._elementAct].LongitudM ? v_this._listaEventos[v_this._elementAct].LongitudM : "00";
            v_this._listaEventos[v_this._elementAct].CDMNP = v_this._listaEventos[v_this._elementAct].CDMNP ? v_this._listaEventos[v_this._elementAct].CDMNP : "";
            v_this._listaEventos[v_this._elementAct].ListaBodegas = v_this._listaEventos[v_this._elementAct].ListaBodegas ? v_this._listaEventos[v_this._elementAct].ListaBodegas : [];
            v_this._listaEventos[v_this._elementAct].ListaBiometria = v_this._listaEventos[v_this._elementAct].ListaBiometria ? v_this._listaEventos[v_this._elementAct].ListaBiometria : [];
            v_this._listaEventos[v_this._elementAct].ListaPescaDeclarada = v_this._listaEventos[v_this._elementAct].ListaPescaDeclarada ? v_this._listaEventos[v_this._elementAct].ListaPescaDeclarada : [];
            v_this._listaEventos[v_this._elementAct].ListaPescaDescargada = v_this._listaEventos[v_this._elementAct].ListaPescaDescargada ? v_this._listaEventos[v_this._elementAct].ListaPescaDescargada : [];
            v_this._listaEventos[v_this._elementAct].ListaHorometros = v_this._listaEventos[v_this._elementAct].ListaHorometros ? v_this._listaEventos[v_this._elementAct].ListaHorometros : [];
            v_this._listaEventos[v_this._elementAct].ListaEquipamiento = v_this._listaEventos[v_this._elementAct].ListaEquipamiento ? v_this._listaEventos[v_this._elementAct].ListaEquipamiento :[];
            v_this._listaEventos[v_this._elementAct].ListaAccidente = [];
            v_this._listaEventos[v_this._elementAct].ListaSiniestros = v_this._listaEventos[v_this._elementAct].ListaSiniestros ? v_this._listaEventos[v_this._elementAct].ListaSiniestros : [];
            v_this._listaEventos[v_this._elementAct].ListaIncidental = v_this._listaEventos[v_this._elementAct].ListaIncidental ? v_this._listaEventos[v_this._elementAct].ListaIncidental : v_this._listaIncidental;
            v_this._listaEventos[v_this._elementAct].eListaPescaDeclarada = v_this._listaEventos[v_this._elementAct].eListaPescaDeclarada ? v_this._listaEventos[v_this._elementAct].eListaPescaDeclarada : [];
            v_this._listaEventos[v_this._elementAct].EspePermitida = [];
            v_this._listaEventos[v_this._elementAct].EspeZonaPesca = [];
            v_this._listaEventos[v_this._elementAct].EspeVeda = [];
        },

        obtenerTab: function (event) {
            let tab_evento_sel = event.getParameter("selectedItem").getProperty("text");
            console.log(event.getParameter("selectedItem").getProperty("text"));
            this.Dat_General.onActionSelectTab(tab_evento_sel,event);
        },
        cargaModelos: function (v_this) {
            let that = v_this

            this.getView().getModel("eventos").setProperty("/ListaBodegas", this._listaEventos[this._elementAct].ListaBodegas);
            let lst_PescaDescargada = this._listaEventos[this._elementAct].ListaPescaDescargada;
            let lst_Horometro = this._listaEventos[this._elementAct].ListaHorometros;
            if (lst_PescaDescargada.length > 0) { lst_PescaDescargada[0].Nro_descarga = this._nroDescarga; }

            //combo Zona de Pesca
            var combZonaPesca = new JSONModel(this._DominiosEvn.data[0]);
            this.getView().setModel(combZonaPesca, "combZonaPesca");
            this.getView().getModel("combZonaPesca").updateBindings(true);

            //combo Estado Operacion
            var combEstadoOperacion = new JSONModel(this._DominiosEvn.data[1]);
            this.getView().setModel(combEstadoOperacion, "combEstadoOperacion");
            this.getView().getModel("combEstadoOperacion").updateBindings(true);

            //combo Motivo Limitacion
            var combMotivoLim = new JSONModel(this._DominiosEvn.data[2]);
            this.getView().setModel(combMotivoLim, "combMotivoLim");
            this.getView().getModel("combMotivoLim").updateBindings(true);

            //combo Tipo de descarga
            var combTipoDescarga = new JSONModel(this._DominiosEvn.data[3]);
            this.getView().setModel(combTipoDescarga, "combTipoDescarga");
            this.getView().getModel("combTipoDescarga").updateBindings(true);

            //combo Motivo no pesca
            var combMotivoNoPesca = new JSONModel(this._DominiosEvn.data[4]);
            this.getView().setModel(combMotivoNoPesca, "combMotivoNoPesca");
            this.getView().getModel("combMotivoNoPesca").updateBindings(true);

            //combo Motivo de espera
            var combMotivoEspera = new JSONModel(this._DominiosEvn.data[5]);
            this.getView().setModel(combMotivoEspera, "combMotivoEspera");
            this.getView().getModel("combMotivoEspera").updateBindings(true);

            //combo Sistema Frio
            var combSistemaFrio = new JSONModel(this._DominiosEvn.data[6]);
            this.getView().setModel(combSistemaFrio, "combSistemaFrio");
            this.getView().getModel("combSistemaFrio").updateBindings(true);

            //combo Punto de descarga
            var combPuntoDescarga = new JSONModel(JSON.parse(this._listasServicioCargaIni[6]));
            this.getView().setModel(combPuntoDescarga, "combPuntoDescarga");
            this.getView().getModel("combPuntoDescarga").updateBindings(true);

            //AYUDA DE BUSQUEDA ESPECIES
            var popupEspecies = new JSONModel(this._DominiosEvn.data[7]);
            this.getView().setModel(popupEspecies, "popupEspecies");
            this.getView().getModel("popupEspecies").updateBindings(true);

            this.getView().getModel("eventos").setProperty("/ListaPescaDescargada", lst_PescaDescargada);
            this.getView().getModel("eventos").setProperty("/ListaPescaDeclarada", this._listaEventos[this._elementAct].ListaPescaDeclarada);
            this.getView().getModel("eventos").setProperty("/ListaHorometros", this._listaEventos[this._elementAct].ListaHorometros);
            this.getView().getModel("eventos").setProperty("/ListaEquipamiento", this._listaEventos[this._elementAct].ListaEquipamiento);
            this.getView().getModel("eventos").setProperty("/ListaIncidental", this._listaEventos[this._elementAct].ListaIncidental);
            this.getView().getModel("eventos").updateBindings(true);
        },

        cargarServiciosPreEvento: function (v_this) {
            //LISTA DE DOMINIOS
            
            let self = v_this;
            var s1 = TasaBackendService.obtenerCodigoTipoPreservacion(v_this._embarcacion, this.getCurrentUser());
            var s2 = TasaBackendService.obtenerListaEquipamiento(v_this._embarcacion, this.getCurrentUser());
            var s3 = TasaBackendService.obtenerListaCoordZonaPesca(v_this._zonaPesca, this.getCurrentUser());
            var s4 = TasaBackendService.obtenerListaPescaDeclarada(v_this._nroMarea, v_this._nroEvento, this.getCurrentUser());
            var s5 = TasaBackendService.obtenerListaBodegas(v_this._embarcacion, this.getCurrentUser());
            var s6 = TasaBackendService.obtenerListaPescaBodegas(v_this._nroMarea, v_this._nroEvento, this.getCurrentUser());
            var s7 = TasaBackendService.obtenerListaPuntosDescarga(v_this._codPlanta, this.getCurrentUser());
            var s8 = TasaBackendService.obtenerListaPescaDescargada(v_this._nroDescarga, this.getCurrentUser());
            //--var s9 = TasaBackendService.obtenerListaSiniestros(this._nroMarea, this._nroEvento); ---> PENDIENTE EN REVISAR
            var s10 = TasaBackendService.obtenerListaHorometro(v_this._FormMarea.WERKS, v_this._tipoEvento, v_this._nroMarea, v_this._nroEvento);
            //var s11 = TasaBackendService.obtenerConfiguracionEvento();
            // var s12 = TasaBackendService.obtenerDominio("1ZONAPESCA");
            // var s13 = TasaBackendService.obtenerDominio("ZESOPE");
            // var s14 = TasaBackendService.obtenerDominio("ZCDMLM");
            // var s15 = TasaBackendService.obtenerDominio("ZCDTDS");
            // var s16 = TasaBackendService.obtenerDominio("ZCDMNP");
            // var s17 = TasaBackendService.obtenerDominio("ZCDMES");
            // var s18 = TasaBackendService.obtenerDominio("ZD_SISFRIO");
            // var s19 = TasaBackendService.obtenerDominio("ESPECIE");
            // var s20 = TasaBackendService.obtenerMareaBiometria(v_this._embarcacion, v_this._nroMarea, this.getCurrentUser());
            //var s21 = TasaBackendService.obtenerDominioVarios(listaDominios);

            return Promise.all([s1, s2, s3, s4, s5, s6, s7, s8, s10
                //s11, s12, s13, s14, s15, s16, s17, s18, s19, s20, s21
            ]).then(values => {
                self._tipoPreservacion = JSON.parse(values[0]).data[0].CDTPR;
                self._listasServicioCargaIni = values;
                console.log(self._listasServicioCargaIni);
                return true;
            }).catch(reason => {
                return false;
            })

        },

        getFragment: async function () {
            let mod = this.getOwnerComponent().getModel("DetalleMarea");
            let TipoCons = mod.getProperty("/Utils/TipoConsulta");
            var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.session);
            let flag = oStore.get("flagFragment");
            console.log("flag : " + flag);
            if (flag) {

                var o_tabGeneral = this.getView().byId("idGeneral");
                var o_tabDistribucion = this.getView().byId("idDistribucion");
                var o_tabPescaDeclarada = this.getView().byId("idPescaDecl");
                var o_tabPescaDescargada = this.getView().byId("idPescaDesc");
                var o_tabHorometro = this.getView().byId("idHorometro");
                var o_tabEquipamiento = this.getView().byId("idEquipamiento");
                var o_tabSiniestro = this.getView().byId("idSiniestro");
                var o_tabAccidente = this.getView().byId("idAccidente");
                var o_tabBiometria = this.getView().byId("idBiometria");

                var o_fragment = new General(this.getView(), "General", this);
                var o_fragment2 = new General(this.getView(), "General_fechas", this);
                var o_fragment3 = new General(this.getView(), "General_operacion", this);
                var o_fragment4 = new General(this.getView(), "General_espera", this);
                var o_fragment5 = new General(this.getView(), "General_adicional", this);

                var o_fragment6 = new Distribucion(this.getView(), "Distribucion");
                var o_fragment7 = new PescaDeclarada(this.getView(), "PescaDeclarada", this);
                var o_fragment8 = new PescaDescargada(this.getView(), "PescaDescargada", this);
                var o_fragment9 = new Horometro(this.getView(), "Horometro", this);
                var o_fragment10 = new Equipamiento(this.getView(), "Equipamiento");
                var o_fragment11 = new Siniestro(this.getView(), "Siniestro", this);
                var o_fragment12 = new Accidente(this.getView(), "Accidente");
                var o_fragment13 = new Biometria(this.getView(), "Biometria", this._utilNroEventoBio, this);


                o_tabGeneral.addContent(o_fragment.getcontrol());
                o_tabGeneral.addContent(o_fragment2.getcontrol());
                o_tabGeneral.addContent(o_fragment3.getcontrol());
                o_tabGeneral.addContent(o_fragment4.getcontrol());
                o_tabGeneral.addContent(o_fragment5.getcontrol());

                o_tabDistribucion.addContent(o_fragment6.getcontrol());
                o_tabPescaDeclarada.addContent(o_fragment7.getcontrol());
                o_tabPescaDescargada.addContent(o_fragment8.getcontrol());
                o_tabHorometro.addContent(o_fragment9.getcontrol());
                o_tabEquipamiento.addContent(o_fragment10.getcontrol());
                o_tabSiniestro.addContent(o_fragment11.getcontrol());
                o_tabAccidente.addContent(o_fragment12.getcontrol());
                o_tabBiometria.addContent(o_fragment13.getcontrol());
            } else {
                var o_fragment = new General(this.getView(), "General", this);
                var o_fragment2 = new General(this.getView(), "General_fechas", this);
                var o_fragment3 = new General(this.getView(), "General_operacion", this);
                var o_fragment4 = new General(this.getView(), "General_espera", this);
                var o_fragment5 = new General(this.getView(), "General_adicional", this);

                var o_fragment6 = new Distribucion(this.getView(), "Distribucion");
                var o_fragment7 = new PescaDeclarada(this.getView(), "PescaDeclarada", this);
                var o_fragment8 = new PescaDescargada(this.getView(), "PescaDescargada", this);
                var o_fragment9 = new Horometro(this.getView(), "Horometro", this);
                var o_fragment10 = new Equipamiento(this.getView(), "Equipamiento");
                var o_fragment11 = new Siniestro(this.getView(), "Siniestro", this);
                var o_fragment12 = new Accidente(this.getView(), "Accidente");
                var o_fragment13 = new Biometria(this.getView(), "Biometria", this._utilNroEventoBio, this);
            }

            oStore.put("flagFragment", false);
            this._listaEventos[this._elementAct].ESOPE = this._listaEventos[this._elementAct].ESOPE ? this._listaEventos[this._elementAct].ESOPE : "N";

            //SETEAR VALOR GLOBAL FRAGMENTS
            this.Dat_Horometro = o_fragment9;
            this.Dat_General = o_fragment;
            this.Dat_PescaDeclarada = o_fragment7;
            this.Dat_Siniestro = o_fragment11;
            this.Dat_PescaDescargada = o_fragment8;
            this.Dat_Biometria = o_fragment13;

            if (this._confEventoMain ? true : false) {
                this._ConfiguracionEvento = this._confEventoMain;
            }

            if(TipoCons == "C"){
                var EventosModelo = new JSONModel();
                this.getView().setModel(EventosModelo, "eventos");
                EventosModelo.setData(this._listaEventos[this._elementAct]);

                EventosModelo.setProperty("/enabledBodCantpesca", true);
                EventosModelo.setProperty("/enabledCantPescDeclarada", true);

                EventosModelo.setProperty("/enabledCantPescDescargada", true);
                EventosModelo.setProperty("/enabledCantPescDeclDesc", true);
                EventosModelo.setProperty("/enabledPuntoDescarga", true);
                EventosModelo.setProperty("/enabledFechProdDesc", true);
                EventosModelo.setProperty("/enabledAveriado", true);
                EventosModelo.setProperty("/enabledCantEquipamiento", true);
                this.cargarListasEventoSelVacias(this);
                await this.prepararNuevoEvento();
                this.cargaModelos(this);
                this.inhabilitarInfoCoord();
                BusyIndicator.hide();
            }else{
                //var ss = this._listasServicioCargaIni[10].data[0].data;
                await this.prepararRevisionEvento(false);
                this.cargaModelos(this);
                this.inhabilitarInfoCoord();
                BusyIndicator.hide();
            }
            

        },

        SaveAll:async function () {
            if(this.validacioncampos == false){

            }else{
                let mod = this.getOwnerComponent().getModel("DetalleMarea");
                mod.setProperty("/Utils/MessageItemsEP", []);
                this.resetearValidaciones();
                await this.validarDatos();
            }
            

        },

        getConfirmSaveDialogTest: function () {
            if (!this.oDialogConfirmSave) {
                this.oDialogConfirmSave = sap.ui.xmlfragment("com.tasa.registroeventospescav2.view.fragments.EventoFinalizado", this);
                this.getView().addDependent(this.oDialogConfirmSave);
            }
            return this.oDialogConfirmSave;
        },


        _onButtonPress: function (o_event) {
            console.log(o_event);
        },

        prepararRevisionEvento: async function (soloDatos) {
            let mod = this.getOwnerComponent().getModel("DetalleMarea");
            if (this._tipoEvento == textValidaciones.TIPOEVENTOCALA) {
                var fechaIniEnvase = this.getView().byId("FechaEnvaseIni");
                fechaIniEnvase.setVisible(true);
                var fechaIniEnvaseText = this.getView().byId("0001");
                fechaIniEnvaseText.setHeaderText("Envase");
            } else {
                var fechaIniEnvaseText = this.getView().byId("0001");
                fechaIniEnvaseText.setHeaderText("Fechas");
            }
            // AGRAGADO --------------------------------------
            let eventoActual = this._listaEventos[this._elementAct];
            let estOper = eventoActual.ESOPE;
            var visible = this.modeloVisible;//nodo visible
            if (estOper =="L") {
                //this.getView().getModel("visible").setProperty("/MotiLimitacion", true);
                visible.MotiLimitacion = true;

            } else {
                //this.getView().getModel("visible").setProperty("/MotiLimitacion", false);
                visible.MotiLimitacion = false;
            }
            //---------------------------------------
            this.getView().byId("idTallaMenor").setValue("0");
            this.getView().byId("idTallaMayor").setValue("0");
            await this.obtenerDetalleEvento();

            if (this._tipoEvento == textValidaciones.TIPOEVENTODESCARGA
                && this.buscarValorFijo(textValidaciones.MOTIVOPESCADES, this._motivoMarea)) {
                mod.setProperty("/Eventos/CantPescaDescDeclText",this._listaEventos[this._eventoNuevo].ListaPescaDescargada[0].CantPescaDeclarada);
                var fechaIniEnvase = this.getView().byId("FechaEnvaseIni");
                fechaIniEnvase.setVisible(false);
                var fechaFinEnvase = this.getView().byId("FechaEnvaseFin");
                fechaFinEnvase.setVisible(false);
                this.obtenerPescaDeclDescarga();
            }

            if (!soloDatos) {
                this.prepararVista(false);
                this.mngBckEventos(true);
            }

        },

        buscarValorFijo: function (arrayRecorrido, valor_a_encontrar) {

            var encontroValor = false

            for (var i = 0; i < arrayRecorrido.length; i++) {

                if (arrayRecorrido[i].id == valor_a_encontrar) {
                    encontroValor = true;
                }
            }


            return encontroValor
        },
        obtenerDetalleEvento:async function () {
            var datCons = false// wdThis.getEventoConsultado(nroEvento);

            if (this._indicador == "E" && !datCons) {
                //wdThis.setEventoConsultado(nroEvento, true);

                if (this.buscarValorFijo(textValidaciones.EVEVISTABHOROM, this._tipoEvento)) {
                    await this.obtenerHorometros();
                }

                if (this.buscarValorFijo(textValidaciones.EVEVISTABEQUIP, this._tipoEvento)) {
                    this.obtenerEquipamiento();
                }

                if (this._tipoEvento == textValidaciones.TIPOEVENTOCALA) {
                    this.Dat_Biometria.cargarDataBiometria();
                    this.obtenerCoordZonaPesca();
                    await this.obtenerPescaDeclarada();
                    if (this._motivoMarea == "1") {
                        this.obtenerBodegas();
                        this.obtenerPescaBodega();
                    }
                }

                if (this._tipoEvento == textValidaciones.TIPOEVENTODESCARGA) {
                    var fechaIniEnvase = this.getView().byId("FechaEnvaseIni");
                    fechaIniEnvase.setVisible(false);
                    var fechaFinEnvase = this.getView().byId("FechaEnvaseFin");
                    fechaFinEnvase.setVisible(false);

                    this.obtenerPuntosDescarga();
                    this.obtenerPescaDescargada(this);
                }

                if (this._tipoEvento == textValidaciones.TIPOEVENTOHOROMETRO) {
                    var fechaIniEnvase = this.getView().byId("FechaEnvaseIni");
                    fechaIniEnvase.setVisible(true);
                    //wdThis.obtenerSiniestros(marea, nroEvento);
                }

                // eventosElement.setFechModificacion(new Date(Calendar.getInstance().getTimeInMillis()));
                // eventosElement.setHoraModificacion(new Time(Calendar.getInstance().getTimeInMillis()));
                // eventosElement.setAutoMoficicacion(wdThis.wdGetMainCompController().wdGetContext().currentDataSessionElement().getUser());

            }
        },
        obtenerPescaDeclDescarga: function () {
            var fechaIniEnvase = this.getView().byId("FechaEnvaseIni");
            fechaIniEnvase.setVisible(false);
            var fechaFinEnvase = this.getView().byId("FechaEnvaseFin");
            fechaFinEnvase.setVisible(false);
            let nroEventoTope = this._listaEventos[this._elementAct].NREVN;

            let cantTotalDecl = Number('0');
            let cantTotalDeclDesc = Number('0');
            let cantTotalDeclRest = Number('0');
            let primerRecorrido = Number(this._elementAct) + Number(1);

            for (var j = primerRecorrido; j < this._listaEventos.length; j++) {
                nroEventoTope = this._listaEventos[j].NREVN;

                if (this._listaEventos[j].TipoEvento == "1") {
                    break;
                }

            }
            cantTotalDecl = this.obtenerCantTotalPescaDecla(nroEventoTope, this);
            cantTotalDeclDesc = this.obtenerCantTotalPescaDeclDesc(nroEventoTope, this);
            cantTotalDeclRest = cantTotalDecl - cantTotalDeclDesc;
            if(this._listaEventos[this._elementAct].ListaPescaDescargada.length > 0){
                if (this._listaEventos[this._elementAct].ListaPescaDescargada[0].CantPescaDeclarada ? true : false) {
                    cantTotalDeclRest = cantTotalDeclRest + Number(this._listaEventos[this._elementAct].ListaPescaDescargada[0].CantPescaDeclarada);
                }
            }

            textValidaciones.CantPescaDeclaRestante = cantTotalDeclRest;
            return cantTotalDeclRest;


        },

        prepararVista: function (nuevoEvento) {
            let mod = this.getOwnerComponent().getModel("DetalleMarea");
            this.resetView();
            var exisEspMarAnt = false;
            if (this._EsperaMareaAnt != null && this._EsperaMareaAnt.length > 0) { exisEspMarAnt = true; } else { exisEspMarAnt = false; }

            //Datos de fecha	
            if (this._tipoEvento == textValidaciones.TIPOEVENTOZARPE) {
                var fechaIniEnvase = this.getView().byId("FechaEnvaseIni");
                fechaIniEnvase.setVisible(true);

                if (this._listaEventos.length > 1 && this._elementAct > 0) {
                    var elementoAnt = Number(this._elementAct) - 1

                    if (this._listaEventos[elementoAnt].TipoEvento == textValidaciones.TIPOEVENTOESPERA) {
                        var dtf_fechaIniEnv = this.getView().byId("dtf_fechaIniEnv");
                        dtf_fechaIniEnv.setEnabled(false);
                        this.getView().byId("dtf_horaIniEnv").setEnabled(false);
                    }

                } else if (exisEspMarAnt) {
                    var dtf_fechaIniEnv = this.getView().byId("dtf_fechaIniEnv");
                    dtf_fechaIniEnv.setEnabled(false);
                    this.getView().byId("dtf_horaIniEnv").setEnabled(false);
                }
            }

            //Datos de ubicacion
            if (this.buscarValorFijo(textValidaciones.EVEVISUEMPRESA, this._tipoEvento)) {
                var fe_empresa = this.getView().byId("fe_Empresa");
                fe_empresa.setVisible(true);

                if (this._tipoEvento == textValidaciones.TIPOEVENTOARRIBOPUE) {
                    var fechaIniEnvase = this.getView().byId("FechaEnvaseIni");
                    fechaIniEnvase.setVisible(true);
                }
            }

            if (this.buscarValorFijo(textValidaciones.EVEVISZONPESCA, this._tipoEvento)) {
                var fe_ZonaPesca = this.getView().byId("fe_ZonaPesca");
                fe_ZonaPesca.setVisible(true);

                if (this._tipoEvento == textValidaciones.TIPOEVENTOCALA) {
                    var fechaIniEnvase = this.getView().byId("FechaEnvaseIni");
                    fechaIniEnvase.setVisible(true);
                    var f_LatitudLongitud = this.getView().byId("f_LatitudLongitud");
                    f_LatitudLongitud.setVisible(true);

                    if (this._motivoMarea == "1") {
                        var fe_muestra = this.getView().byId("fe_muestra");
                        fe_muestra.setVisible(false);
                    }
                }

                if (this.buscarValorFijo(textValidaciones.READONLYZONPES, this._tipoEvento)) {
                    this.getView().byId("cb_ZonaPesca").setEnabled(false);
                }
            }
            //Datos de las fecha de cala de biometria 	 
            if (this.buscarValorFijo(textValidaciones.EVEVISFECHABIO, this._tipoEvento)) {
                var fe_fechaIniCala = this.getView().byId("fe_fechaIniCala");
                fe_fechaIniCala.setVisible(true);
                var fe_fechaFinCala = this.getView().byId("fe_fechaFinCala");
                fe_fechaFinCala.setVisible(true);
            }
            //Datos de fechas
            if (this.buscarValorFijo(textValidaciones.EVEVISFECHAFIN, this._tipoEvento)) {
                var labelTextFechIniEnv = this.getView().byId("labelTextFechIniEnv");
                labelTextFechIniEnv.setText("Fecha/hora inicio");
                var fechaFinEnvase = this.getView().byId("FechaEnvaseFin");
                fechaFinEnvase.setVisible(true);

                if (this._tipoEvento == textValidaciones.TIPOEVENTODESCARGA) {
                    this.getView().byId("FechaEnvaseIni").setVisible(false);
                    this.getView().byId("FechaEnvaseFin").setVisible(false);
                    this.getView().byId("fe_FechaProduccion").setVisible(true);
                    if (this._listaEventos[this._elementAct].INPRP == textValidaciones.INDIC_PROPIEDAD_PROPIOS) {
                        this.getView().byId("dtf_FechaProduccion").setEnabled(false);
                        //Sea (CHI o CHD)
                        if (this._motivoMarea == "2" || this._motivoMarea == "1") {
                            this.getView().byId("dtf_fechaIniEnv").setEnabled(false);
                            this.getView().byId("dtf_horaIniEnv").setEnabled(false);
                            this.getView().byId("dtf_fechaFinEnv").setEnabled(false);
                            this.getView().byId("dtf_horaFinEnv").setEnabled(false);
                        }
                    }
                }
                else if (this._tipoEvento == textValidaciones.TIPOEVENTOCALA) {
                    this.getView().byId("FechaEnvaseIni").setVisible(true);
                    this.getView().byId("labelTextFechIniEnv").setText("Fech/hora ini. envase");
                }
            } else {
                if (this._tipoEvento == textValidaciones.TIPOEVENTOSALIDAZONA) {
                    this.getView().byId("FechaEnvaseIni").setVisible(true);
                    this.getView().byId("fe_fechaArribo").setVisible(true);
                }
            }

            if (this._tipoEvento == textValidaciones.TIPOEVENTOARRIBOPUE
                && this._listaEventos[this._elementAct].CDMNP != "") {
                this.getView().byId("FechaEnvaseIni").setVisible(true);
                this.getView().byId("fe_MotiNoPesca").setVisible(true);
                let cantidadItemSel = Number(this._elementAct) + 1;
                if (cantidadItemSel == this._listaEventos.length) {
                    this.getView().byId("cmb_estaOperacion").setEnabled(true);
                }
            }

            //------------------------- seteo de visibilidad de elementos -----------------// --LOGICA DE CARLOS ---NO ENCONTRADA EN PORTAL
            if (this._tipoEvento == textValidaciones.TIPOEVENTOARRIBOPUE) {
                let cantidadItemSel = Number(this._elementAct) + 1;
                if (cantidadItemSel == this._listaEventos.length) {
                    this.getView().byId("cmb_estaOperacion").setEnabled(true);
                    this.getView().byId("cmb_motivoLim").setEnabled(true);
                }
            }

            if (this._tipoEvento == textValidaciones.TIPOEVENTOESPERA) {
                this.getView().byId("FechaEnvaseIni").setVisible(true);
                this.getView().byId("0004").setVisible(true);
                this.getView().byId("dtf_fechaIniEnv").setEnabled(false);
                this.getView().byId("dtf_horaIniEnv").setEnabled(false);
            }

            //Datos de operacion
            if (this.buscarValorFijo(textValidaciones.EVEVISESTAOPER, this._tipoEvento)) {
                this.getView().byId("0003").setVisible(true);
                this.getView().byId("fe_estadoOperacion").setVisible(true);

                if (this._listaEventos[this._elementAct].INPRP == textValidaciones.INDIC_PROPIEDAD_PROPIOS && (this._tipoEvento == textValidaciones.TIPOEVENTOLLEGADAZONA || this._tipoEvento == textValidaciones.TIPOEVENTOSALIDAZONA)) {

                    this.getView().byId("fe_estadoOperacion").setVisible(false);
                }

                if (this._tipoEvento == textValidaciones.TIPOEVENTODESCARGA) {
                    this.getView().byId("FechaEnvaseIni").setVisible(false);
                    this.getView().byId("FechaEnvaseFin").setVisible(false);

                    this.getView().byId("fe_estadoOperacion").setVisible(false);//cambiar a false
                    this.getView().byId("fe_tipoDescarga").setVisible(true);

                    if (this._indicadorProp == textValidaciones.INDIC_PROPIEDAD_TERCEROS || this._listaEventos[this._elementAct].INPRP == textValidaciones.INDIC_PROPIEDAD_PROPIOS) {
                        this.getView().byId("cb_tipoDescarga").setEnabled(false);
                    }
                }
                else {
                    this.getView().byId("FechaEnvaseIni").setVisible(true);
                }

                if (this._indicadorProp == textValidaciones.INDIC_PROPIEDAD_PROPIOS) {
                    this.getView().byId("fe_stockCombustible").setVisible(true);
                }

                if (this._listaEventos[this._elementAct].EstaOperacion != null
                    && this._listaEventos[this._elementAct].EstaOperacion == "L") {
                    this.getView().byId("fe_motivoLimitacion").setVisible(true);
                }
            } else if (this._tipoEvento == textValidaciones.TIPOEVENTOCALA && this._indicadorProp == textValidaciones.INDIC_PROPIEDAD_PROPIOS) {
                this.getView().byId("0003").setVisible(true);
                this.getView().byId("fe_temperaturaMar").setVisible(true);

            } else if (this._tipoEvento == textValidaciones.TIPOEVENTOHOROMETRO && this._indicadorProp == textValidaciones.INDIC_PROPIEDAD_PROPIOS
                || this._tipoEvento == textValidaciones.TIPOEVENTOTRASVASE && this._indicadorProp == textValidaciones.INDIC_PROPIEDAD_PROPIOS) {

                this.getView().byId("0003").setVisible(true);
                this.getView().byId("fe_stockCombustible").setVisible(true);
            }

            //Mostrar Sistema frio
            if (this._indicadorProp == textValidaciones.INDIC_PROPIEDAD_PROPIOS) {

                if (this._tipoPreservacion != "" && this._tipoPreservacion != "4") {
                    if (this._tipoEvento != "H" && this._tipoEvento != "T") {
                        if (Number(this._tipoEvento) < 6) {
                            this.getView().byId("fe_sistema_frio").setVisible(true);
                            mod.setProperty("/Utils/OpSistFrio",true);
                        }


                    } else {
                        this.getView().byId("fe_sistema_frio").setVisible(false);
                        mod.setProperty("/Utils/OpSistFrio",false);
                    }

                } else {
                    this.getView().byId("fe_sistema_frio").setVisible(false);
                    mod.setProperty("/Utils/OpSistFrio",false);
                }
            }

            //Observaciones adicionales
            if (this._listaEventos[this._elementAct].ObseAdicional != "") {
                this.getView().byId("fe_observacioAdic").setVisible(true);
            }

            //Tab Equipamiento
            if (this.buscarValorFijo(textValidaciones.EVEVISTABEQUIP, this._tipoEvento)) {
                if (this._indicadorProp == textValidaciones.INDIC_PROPIEDAD_PROPIOS) {
                    this.getView().byId("idEquipamiento").setVisible(true);
                }
            }

            //Tab Horometro        
            if (this.buscarValorFijo(textValidaciones.EVEVISTABHOROM, this._tipoEvento)
                && this._indicadorProp == textValidaciones.INDIC_PROPIEDAD_PROPIOS) {
                this.getView().byId("idHorometro").setVisible(true);
            }

            //Tab Pesca Declarada
            if (this.buscarValorFijo(textValidaciones.EVEVISTABPEDCL, this._tipoEvento)) {
                this.getView().byId("idPescaDecl").setVisible(true);
                //wdContext.currentVisibleElement().setBtnRowPescaDeclarada(WDVisibility.VISIBLE); -->ELEMENTO NO ENCONTRADO A UTILIZAR

                if (this._motivoMarea == "1") {
                    this.getView().byId("clm_moda_pescDecl").setVisible(true);
                }
            }

            //Tab Pesca Biometria
            if (this.buscarValorFijo(textValidaciones.EVEVISTABBIOME, this._tipoEvento)) {
                // if (this._FormMarea.INPRP != textValidaciones.INDIC_PROPIEDAD_TERCEROS) {
                if (this._indicadorPropXPlanta != textValidaciones.INDIC_PROPIEDAD_TERCEROS) {
                    this.getView().byId("idBiometria").setVisible(true);
                    //this.getView().byId("ext_botonesPescaDcl").setVisible(false);
                }
                // else{
                //     this.getView().byId("ext_botonesPescaDcl").setVisible(true);
                // }

            }

            //Tab Pesca Descargada
            if (this.buscarValorFijo(textValidaciones.EVEVISTABPEDSC, this._tipoEvento)) {
                this.getView().byId("idPescaDesc").setVisible(true);
                this.getView().byId("ext_pesc_desc").setVisible(true);
                this.getView().byId("ext_pesc_desc_chd").setVisible(true);

                if (this._listaEventos[this._elementAct].INPRP == textValidaciones.INDIC_PROPIEDAD_TERCEROS) { //Descarga en planta tercera
                    this.getView().byId("table_pesc_desc_especie").setVisible(true);
                } else if (this._listaEventos[this._elementAct].INPRP == textValidaciones.INDIC_PROPIEDAD_PROPIOS) { //Descarga en planta propia
                    if (this._motivoMarea == "1") {
                        this.getView().byId("table_pesc_desc_CHD").setVisible(true);
                    } else {
                        this.getView().byId("table_pesc_desc_ticket").setVisible(true);
                    }

                    if (nuevoEvento) {
                        this.getView().byId("pdt_col_BuscarDesc").setVisible(true);
                        this.getView().byId("pdCHD_col_BuscarDesc").setVisible(true);
                    }
                }

                if (!nuevoEvento) {
                    this.getView().byId("pdt_col_EliminarDesc").setVisible(false); //cambiar a false
                    this.getView().byId("pde_col_EliminarDesc").setVisible(false);
                    this.getView().byId("pdCHD_col_EliminarDesc").setVisible(false);
                    this.getView().getModel("eventos").setProperty("/enabledFechProdDesc", false);
                }
            }

            //Tab Distribucion
            if (this._tipoEvento == textValidaciones.TIPOEVENTOCALA && this._motivoMarea == "1") {
                this.getView().byId("FechaEnvaseIni").setVisible(true);
                this.getView().byId("col_porc_pesc_desc").setVisible(true);
                this.getView().byId("ext_pesca_declarada").setVisible(true);

                this.getView().getModel("eventos").setProperty("/enabledCantPescDeclarada", false);
                this.getView().byId("idDistribucion").setVisible(true);
            }

            //Tab Siniestro
            if (this._tipoEvento == textValidaciones.TIPOEVENTOSINIESTRO) {
                this.getView().byId("FechaEnvaseIni").setVisible(true);
                this.getView().byId("idSiniestro").setVisible(true);
                this.getView().byId("ext_siniestro").setVisible(true);
            }

            //Tab Accidente
            if (this._tipoEvento == textValidaciones.TIPOEVENTOACCIDENTE) {
                this.getView().byId("FechaEnvaseIni").setVisible(true);
                this.getView().byId("idAccidente").setVisible(true);
            }

            if ((!nuevoEvento && (this._elementAct < (this._listaEventos.length - 1)))
                || this._soloLectura || (this._FormMarea.EstMarea == "C" && this._FormMarea.EstCierre != "")) {

                this.prepararVistaRevision();

                if (this._soloLectura) {
                    this.getView().byId("pdt_col_BuscarDesc").setVisible(false);
                    this.getView().byId("pdCHD_col_BuscarDesc").setVisible(false);

                    this.getView().byId("pdt_col_EliminarDesc").setVisible(false);
                    this.getView().byId("pde_col_EliminarDesc").setVisible(false);
                    this.getView().byId("pdCHD_col_EliminarDesc").setVisible(false);

                    this.getView().byId("ext_siniestro").setVisible(false);
                    this.getView().getModel("eventos").setProperty("/enabledFechProdDesc", false);
                }
            }

            if (!this._soloLectura) {
                //Datos de operacion
                if (this._indicadorProp == textValidaciones.INDIC_PROPIEDAD_PROPIOS) {
                    this.getView().byId("i_stockCombustible").setEnabled(true);
                }

                //Tab Distribucion
                if (this._tipoEvento == textValidaciones.TIPOEVENTOCALA && this._motivoMarea == "1") {
                    this.getView().byId("FechaEnvaseIni").setVisible(true);
                    this.getView().getModel("eventos").setProperty("/enabledBodCantpesca", true);
                }
            }

            if (this._mareaReabierta) {

                var fechHoraAct = new Date();
                var fecCierre = this._FormMarea.FecCierre;
                var horCierre = this._FormMarea.HorCierre;

                var fechHoraIni = new Date(fecCierre + " " + horCierre);
                var hour24 = 24 * 3600 * 1000;
                var miliFecHoraAct = fechHoraAct.getTime();
                var miliFechHoraIni = fechHoraIni.getTime();
                var miliDuracion = Number(miliFechHoraIni) + Number(hour24);

                if (this._IsRolRadOpe) {
                    if (miliDuracion <= miliFecHoraAct && this._listaEventos[this._elementAct].ListaHorometros.length > 0) {
                        this.getView().byId("i_stockCombustible").setEnabled(false);
                        for (var j = 0; j < this._listaEventos[this._elementAct].ListaHorometros.length; j++) {
                            this._listaEventos[this._elementAct].ListaHorometros[j].readOnly = false;
                            //nodeHorometros.currentHorometrosElement().setReadOnly(true); --> seteo por cada elemento de la tabla de horometro
                        }
                    }

                }

                if (this._IsRolIngComb) {
                    // formCust.wdGetContext().currentReadOnlyElement().setObservacion(true);
                    // formCust.wdGetContext().currentReadOnlyElement().setFecHoraArribo(true);
                    // formCust.wdGetContext().currentReadOnlyElement().setEstMarea(true);  --- > viene por parte de alejandro mapear en su componente

                    this.getView().byId("ip_sistema_frio").setEnabled(false);
                    this.getView().byId("ip_observacion").setEnabled(false);
                    this.getView().getModel("eventos").setProperty("/enabledAveriado", false);
                    this.getView().getModel("eventos").setProperty("/enabledCantEquipamiento", false);
                    this.getView().byId("ip_muestra").setEnabled(false);
                    this.getView().getModel("eventos").setProperty("/enabledBodCantpesca", false);
                    this.getView().getModel("eventos").setProperty("/enabledCantPescDescargada", false);
                    this.getView().getModel("eventos").setProperty("/enabledCantPescDeclDesc", false);
                }
            }


        },
        mngBckEventos: function (respaldar) {
            var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.Session);
            
            if (respaldar) {
                this._listaEventosBkup = oStore.get("ListaBck");
            } else {
                let lstbkcEven =  oStore.get("ListaBck");
                this._listaEventos = lstbkcEven;
            }

        },

        obtenerEquipamiento: function () {
            if (this._listasServicioCargaIni[1] ? true : false) {
                this._listaEventos[this._elementAct].ListaEquipamiento = JSON.parse(this._listasServicioCargaIni[1]).data;
            }

        },
        obtenerCoordZonaPesca: function () {
            let mensajes_o = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            if (this._listasServicioCargaIni[2] ? true : false) {

                let elementoCoordZonaPesca = JSON.parse(this._listasServicioCargaIni[2]).data[0];

                let descLati = mensajes_o.getText("DESCLATINIFIN", [elementoCoordZonaPesca.LTMIN, elementoCoordZonaPesca.LTMAX]);
                let descLong = mensajes_o.getText("DESCLONGINIFIN", [elementoCoordZonaPesca.LNMIN, elementoCoordZonaPesca.LNMAX]);
                //this.formatGeoCoord('00830');
                this._listaEventos[this._elementAct].ZPLatiIni = elementoCoordZonaPesca.LTMIN_S;
                this._listaEventos[this._elementAct].ZPLatiFin = elementoCoordZonaPesca.LTMAX_S;
                this._listaEventos[this._elementAct].ZPLongIni = elementoCoordZonaPesca.LNMIN_S;
                this._listaEventos[this._elementAct].ZPLongFin = elementoCoordZonaPesca.LNMAX_S;

                this._listaEventos[this._elementAct].DescLatiLongZonaPesca = descLati + " " + descLong;
                this._listaEventos[this._elementAct].DescLati1 = elementoCoordZonaPesca.LTMIN;
                this._listaEventos[this._elementAct].DescLati2 = elementoCoordZonaPesca.LTMAX;
                this._listaEventos[this._elementAct].DescLong1 = elementoCoordZonaPesca.LNMIN;
                this._listaEventos[this._elementAct].DescLong2 = elementoCoordZonaPesca.LNMAX;
                this.getView().getModel("eventos").updateBindings(true);
            }

        },
        formatGeoCoord: function (value) {
            let geoCord = "";
            geoCord = value;
            let cadenaGeo = "";

            if (value != "") {
                let myPattern = /(\d){5}/;
                value = value.trim();
                let myMatcher = myPattern.test(value);

                if (myMatcher) {
                    let ss = geoCord.substr(0, 3);
                    cadenaGeo = geoCord.substr(0, 3) + "º" + geoCord.substr(3, 4) + "'";
                } else {
                    cadenaGeo = "";
                }
            }

            return cadenaGeo;
        },

        obtenerPescaDeclarada:async function () {
            let sumaCantPesca = Number(0);
            let listaPescaDecl = this._listaEventos[this._elementAct].ListaPescaDeclarada ? this._listaEventos[this._elementAct].ListaPescaDeclarada.length : 0;
            if(listaPescaDecl == 0){
                await this.service_obtenerListaPescaDecl();
                if (this._listasServicioCargaIni[3] ? true : false) {
                    this._listaEventos[this._elementAct].ListaPescaDeclarada = JSON.parse(this._listasServicioCargaIni[3]).data;
                    for (var j = 0; j < this._listaEventos[this._elementAct].ListaPescaDeclarada.length; j++) {
    
                        sumaCantPesca = sumaCantPesca + Number(this._listaEventos[this._elementAct].ListaPescaDeclarada[j].CNPCM);
                    }
    
                    this._listaEventos[this._elementAct].CantTotalPescDecla = sumaCantPesca;
                }
            }
            
        },
        obtenerBodegas: function () {
            let listaBodegas = this._listaEventos[this._elementAct].ListaBodegas ? this._listaEventos[this._elementAct].ListaBodegas.length : 0;
            if(listaBodegas == 0){
                if (this._listasServicioCargaIni[4] ? true : false) {
                    this._validBodegas = false;
                    this._listaEventos[this._elementAct].ListaBodegas = JSON.parse(this._listasServicioCargaIni[4]).data;
                    //this._ListaBodegas = JSON.parse(this._listasServicioCargaIni[4]).data;
                }
            }else{
                this._validBodegas = true;
            }
            
        },

        obtenerPescaBodega: function () {
            if(!this._validBodegas){
                if (this._listasServicioCargaIni[5] ? true : false) {
                    for (var j = 0; j < this._listaEventos[this._elementAct].ListaBodegas.length; j++) {
                        try {
                            let listaPescaBodega1 = JSON.parse(this._listasServicioCargaIni[5]).data;
                            for (var n = 0; n < listaPescaBodega1.length; n++) {
                                if (listaPescaBodega1[n].CDBOD == this._listaEventos[this._elementAct].ListaBodegas[j].CDBOD) {
                                    this._listaEventos[this._elementAct].ListaBodegas[j].Indicador = "E";
                                    this._listaEventos[this._elementAct].ListaBodegas[j].CantPesca = listaPescaBodega1[n].CNPCM;
                                    break;
                                }
                            }
                        } catch (error) {
    
                        }
                    }
                    if (this._listaEventos[this._elementAct].CantTotalPescDecla > 0) {
                        for (var j = 0; j < this._listaEventos[this._elementAct].ListaPescaDeclarada.length; j++) {
                            let porcPesca = Number(0);
                            let cantPesca = Number(this._listaEventos[this._elementAct].ListaPescaDeclarada[j].CNPCM);
                            porcPesca = (cantPesca * 100) / Number(this._listaEventos[this._elementAct].CantTotalPescDecla);
                            this._listaEventos[this._elementAct].ListaPescaDeclarada[j].PorcPesca = porcPesca.toFixed(2);
                        }
                    }
                }
            }
            
        },
        obtenerPuntosDescarga: function () {
            if (this._listasServicioCargaIni[6] ? true : false) {
                this._cmbPuntosDescarga = JSON.parse(this._listasServicioCargaIni[6]).data;
            }

        },

        obtenerPescaDescargada: function (v_this) {
            let lstPescaDecl = v_this._listaEventos[v_this._elementAct].ListaPescaDescargada ? v_this._listaEventos[v_this._elementAct].ListaPescaDescargada : [];
            if(lstPescaDecl.length == 0){
                if (v_this._listasServicioCargaIni[7] ? true : false) {
                    v_this._listaEventos[v_this._elementAct].ListaPescaDescargada = JSON.parse(v_this._listasServicioCargaIni[7]).data;
                    if(v_this._listaEventos[v_this._elementAct].ListaPescaDescargada.length > 0){
                        v_this._listaEventos[v_this._elementAct].ListaPescaDescargada[0].CantPescaDeclarada = v_this._listaEventos[v_this._elementAct].ListaPescaDescargada[0].CNPCM;
                        v_this._listaEventos[v_this._elementAct].ListaPescaDescargada[0].BckCantPescaModificada = v_this._listaEventos[v_this._elementAct].ListaPescaDescargada[0].CNPDS;
                        v_this._listaEventos[v_this._elementAct].FechProduccion = v_this._listaEventos[v_this._elementAct].ListaPescaDescargada[0].FECCONMOV;
                    }
                }
            }
            
        },
        obtenerHorometros: async function () {
            let listaHor = this._listaEventos[this._elementAct].ListaHorometros ? this._listaEventos[this._elementAct].ListaHorometros.length : 0;
            if(listaHor == 0){
                await this.service_obtenerListaHorometro();
                if (this._listasServicioCargaIni[8] ? true : false) {
                    this._listaEventos[this._elementAct].ListaHorometros = this._listasServicioCargaIni[8];
                    let lstHoro = this._listaEventos[this._elementAct].ListaHorometros
                    if(lstHoro.length > 0){
                        lstHoro.forEach(element => {
                            element.Chk_averiado = (element.averiado === "" || element.averiado == null) ? false : true
                        });
                    }
                }else{
                    this._listaEventos[this._elementAct].ListaHorometros = [];
                }
            }
            
        },
        obtenerCantTotalPescaDecla: function (nroEventoTope, me) {
            var modelo = me.getOwnerComponent().getModel("DetalleMarea");
            let cantTotal = 0;
            var listaEventos = this._listaEventos ? this._listaEventos : modelo.getProperty("/Eventos/Lista");
            for (var j = 0; j < listaEventos.length; j++) {
                //if (this._tipoEvento == textValidaciones.TIPOEVENTOCALA)
                if (listaEventos[j].CDTEV == "3") {
                    var pescDecla = listaEventos[j].CantTotalPescDecla ? listaEventos[j].CantTotalPescDecla : listaEventos[j].CNPDC;
                    if (pescDecla && !isNaN(pescDecla)) {
                        cantTotal += Number(pescDecla);
                    } else {
                        cantTotal += 0;
                    }

                    // if (listaEventos[j].NREVN == this._nroEvento) {
                    //     if (listaEventos[j].CantTotalPescDecla != null) {
                    //         cantTotal = cantTotal + Number[listaEventos[j].CantTotalPescDecla];
                    //     }
                    // } else {
                    //     this.obtenerDetalleEvento();

                    //     cantTotal = cantTotal + Number[listaEventos[j].CantTotalPescDecla];
                    // }
                }
                if (listaEventos[j].NREVN == nroEventoTope) {
                    break;
                }
            }
            return cantTotal;

        },

        obtenerCantTotalPescaDeclDesc: function (nroEventoTope, me) {
            //let cantTotal = Number[0];
            var modelo = me.getOwnerComponent().getModel("DetalleMarea");
            let cantTotal = 0;
            var listaEventos = this._listaEventos ? this._listaEventos : modelo.getProperty("/Eventos/Lista");
            var cabecera = modelo.getProperty("/Form");
            for (var j = 0; j < listaEventos.length; j++) {
                if (listaEventos[j].CDTEV == "6") {
                    if(listaEventos[j].ListaPescaDescargada != undefined){
                        if(listaEventos[j].ListaPescaDescargada.length > 0){
                            if (!me) {
                                this.getView().byId("FechaEnvaseIni").setVisible(false);
                                this.getView().byId("FechaEnvaseFin").setVisible(false);
                            }
                            var pescDesc = listaEventos[j].ListaPescaDescargada[0].CantPescaDeclarada;
                            if (pescDesc && !isNaN(pescDesc)) {
                                cantTotal += Number(pescDesc);
                            } else {
                                cantTotal += 0;
                            }
                        }
                    }else{
                        var pescDesc = listaEventos[j].CNPCM;
                        if (pescDesc && !isNaN(pescDesc)) {
                            cantTotal += Number(pescDesc);
                        } else {
                            cantTotal += 0;
                        }
                    }
                
                    /*if (listaEventos[j].Numero == this._nroEvento) {
                        if (listaEventos[j].ListaPescaDescargada[0].CantPescaDeclarada ? true : false) {
                            cantTotal = cantTotal + Number[listaEventos[j].ListaPescaDescargada[0].CantPescaDeclarada];
                        }
                    } else {
                        this.obtenerDetalleEvento();
                        if (listaEventos[j].ListaPescaDescargada[0] ? true : false) {
                            if (listaEventos[j].ListaPescaDescargada[0].CantPescaDeclarada ? true : false){
                                cantTotal = cantTotal + Number[listaEventos[j].ListaPescaDescargada[0].CantPescaDeclarada];
                            }
                            
                        }
                    }*/
                }

                if (listaEventos[j].NREVN == nroEventoTope) {
                    break;
                }
            }
            //this._FormMarea.CantTotalPescDecla = cantTotal;
            cabecera.CantTotalPescDecla = cantTotal;
            return cantTotal;

        },
        validarEsperaEventoAnterior: function () {
            let bOk = true;
            let elemAnt = Number(this._elementAct) - 1;
            let limiteMin = Number(this._ConfiguracionEvento.EspeMiliLimMinimo);
            let limiteMax = Number(this._ConfiguracionEvento.EspeMiliLimMaximo);
            let exisEspMarAnt = this._EsperaMareaAnt.length > 0;
            if (this._ConfiguracionEvento.EspeUMExtValido) {
                if (Number(this._elementAct) > 0) {
                    let fechaIni = this._listaEventos[this._elementAct].FechIni;
                    let horaIni = this._listaEventos[this._elementAct].HoraIni;

                    let tipoEventoAnt = this._listaEventos[elemAnt].TipoEvento;
                    let fechaFin = this._listaEventos[elemAnt].FechIni;
                    let horaFin = this._listaEventos[elemAnt].HoraIni;

                    if (this.buscarValorFijo(textValidaciones.EVEVISTABFECHAFIN, tipoEventoAnt)) {
                        fechaFin = this._listaEventos[elemAnt].FechFin;
                        horaFin = this._listaEventos[elemAnt].HoraFin;
                    }
                    let fechHoIni = new Date(fechaIni + " " + horaIni);
                    let miliFecHoIni = fechHoIni.getTime();
                    let fechHoFin = new Date(fechaFin + " " + horaFin);
                    let miliFecHoFin = fechHoFin.getTime();

                    let tiempo = Number(miliFecHoFin) - Number(miliFecHoIni);

                    if (tiempo > limiteMin && tiempo <= limiteMax) {
                        bOk = false;

                        let mssg = this.oBundle.getText("SUPLIMMINESPERA");
                        MessageBox.error(mssg);
                        textValidaciones.EspMareaAct = true;
                        //wdThis.wdFireEventCrearEventoEspera();
                        //LLAMAR EVENTO Eespera
                    } else if (tiempo > limiteMax) {
                        bOk = false;

                        let mssg1 = this.oBundle.getText("SUPLIMMINESPERA");
                        let mssg2 = this.oBundle.getText("TEXTCERRARMARE");
                        MessageBox.error(mssg1 + " " + mssg2);
                    }
                }
                else if (this._indicadorProp == "P") {
                    if (!this._FormMarea.EsNuevo) {
                        // wdThis.wdGetFormCustController().obtenerDatosMareaAnt(wdContext.currentFormElement().getMarea(), 
                        //     wdContext.currentFormElement().getEmbarcacion());
                    }

                    let motivoMareaAnt = this._listaMareaAnterior.MotMarea;

                    if (motivoMareaAnt != "" && this.buscarValorFijo(textValidaciones.MOTIVOMARPESCA, motivoMareaAnt)) {
                        let fechaFin = null;
                        let horaFin = null;
                        let fechaIni = null;
                        let horaIni = null;
                        let tiempo = 0;

                        if (!this.buscarValorFijo(textValidaciones.MOTIVOSINZARPE, motivoMareaAnt)) {
                            let tipoEvento = this._listaMareaAnterior.EventosMareaAnt.TipoEvento;

                            fechaIni = this._listaEventos[this._elementAct].FechIni;
                            horaIni = this._listaEventos[this._elementAct].HoraIni;

                            if (exisEspMarAnt) {
                                fechaFin = this._EsperaMareaAnt[0].FechFin;
                                horaFin = this._EsperaMareaAnt[0].HoraFin;
                                //wdThis.wdFireEventCrearEventoEspera();
                                //CREAR POUP EVENTO ESPERA
                            } else {
                                if (this.buscarValorFijo(textValidaciones.EVEVISTABFECHAFIN, tipoEvento)) {
                                    fechaFin = this._listaMareaAnterior.EventosMareaAnt.FechFin;
                                    horaFin = this._listaMareaAnterior.EventosMareaAnt.HoraFin;
                                } else {
                                    fechaFin = this._listaMareaAnterior.EventosMareaAnt.FechIni;
                                    horaFin = this._listaMareaAnterior.EventosMareaAnt.HoraIni;
                                }
                            }
                            let fechHoIni = new Date(fechaIni + " " + horaIni);
                            let miliFecHoIni = fechHoIni.getTime();
                            let fechHoFin = new Date(fechaFin + " " + horaFin);
                            let miliFecHoFin = fechHoFin.getTime();

                            tiempo = Number(miliFecHoFin) - Number(miliFecHoIni);

                            textValidaciones.EspMareaAct = true;

                            textValidaciones.FechFinEspera = fechaFin;
                            textValidaciones.HoraFinEspera = horaFin;

                            if (tiempo > limiteMin && tiempo <= limiteMax) {
                                bOk = false;

                                if (!exisEspMarAnt) {
                                    //wdThis.wdFireEventCrearEventoEspera();
                                    let mssg = this.oBundle.getText("SUPLIMMINESPERA");
                                    MessageBox.error(mssg);
                                    textValidaciones.EspMareaAct = true;
                                } else {
                                    let mssg1 = this.oBundle.getText("SUPLIMMINESPERA");
                                    let mssg2 = this.oBundle.getText("TEXTCERRARMARE");
                                    MessageBox.error(mssg1 + " " + mssg2);
                                }
                            } else if (tiempo > limiteMax) {
                                bOk = false;

                                let mssg1 = this.oBundle.getText("SUPLIMMINESPERA");
                                let mssg2 = this.oBundle.getText("TEXTCERRARMARE");
                                MessageBox.error(mssg1 + " " + mssg2);
                            }

                            if (!bOk && exisEspMarAnt) {
                                this._EsperaMareaAnt = [];
                            }
                        }
                    } else {
                        let mssg = this.oBundle.getText("NOEXISTDATAMARANT");
                        MessageBox.error(mssg);
                    }
                }
            }
            return bOk;
        },
        validarDatosEspera: function () {
            let fechaIni = this._listaEventos[this._elementAct].FechIni;
            let horaIni = this._listaEventos[this._elementAct].HoraIni;
            let fechaFin = this._listaEventos[this._elementAct].FechFin;
            let horaFin = this._listaEventos[this._elementAct].HoraFin;
            let fechHorIni = new Date(fechaIni + " " + horaIni);
            let fechHorFin = new Date(fechaFin + " " + horaFin);
            let esperaMin = Number(this._ConfiguracionEvento.EspeMiliLimMinimo);
            let esperaMax = Number(this._ConfiguracionEvento.EspeMiliLimMaximo);
            let horaFeI = Number(fechHorIni.getHours()) * 60 * 60 * 60 + Number(fechHorIni.getMinutes()) * 60 * 60 + Number(fechHorIni.getSeconds()) * 60;
            let fechaMin = new Date(fechHorIni.getTime() + esperaMin);
            let horaMin = this.msToTime(horaFeI + esperaMin);
            let fechaMax = new Date(fechHorIni.getTime() + esperaMax);
            let horaMax = this.msToTime(horaFeI + esperaMax);
            //________________________________________________________________//
            let todayDate = new Date().toISOString().slice(0, 10);
            let fchHoy = "" + todayDate;
            let fechHorMin = new Date(fchHoy + " " + this.msToTime(horaFeI + esperaMin));
            let fechHorMax = new Date(fchHoy + " " + this.msToTime(horaFeI + esperaMax));
            let fechHoraAct = new Date();
            //contextEvento

            if (fechHorIni > fechHorFin) {
                let mssg1 = this.oBundle.getText("FECHAINIEVEMENOFECHAFIN");
                MessageBox.error(mssg1);
            } else if (fechHoraAct > fechHorFin) {
                let mssg1 = this.oBundle.getText("FECHAFINEVEMENOFECHACT");
                MessageBox.error(mssg1);
            } else if (fechHorMin > fechHorFin) {
                let mssg1 = this.oBundle.getText("FECFINNOMENLIMMIN");
                MessageBox.error(mssg1 + " " + fechaMin + " " + horaMin);
                this._listaEventos[this._elementAct].FechFin = fechaMin;
                this._listaEventos[this._elementAct].HoraFin = horaMin;
            } else if (fechHorFin.after(fechHorMax)) {
                let mssg1 = this.oBundle.getText("FECFINNOMAYLIMMAX");
                MessageBox.error(mssg1 + " " + fechaMax + " " + horaMax);
                this._listaEventos[this._elementAct].FechFin = fechaMax;
                this._listaEventos[this._elementAct].HoraFin = horaMax;
            } else {
                //bOk = true;
                return true;
            }

            return false;

        },
        msToTime: function (duration) {
            var milliseconds = Math.floor((duration % 1000) / 100),
                seconds = Math.floor((duration / 1000) % 60),
                minutes = Math.floor((duration / (1000 * 60)) % 60),
                hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

            hours = (hours < 10) ? "0" + hours : hours;
            minutes = (minutes < 10) ? "0" + minutes : minutes;
            seconds = (seconds < 10) ? "0" + seconds : seconds;

            return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
        },
        removerEvento_button: function () {
            this.Dat_Horometro.onActionRemoverEvento();
        },
        descartarCambios_button() {
            this.Dat_Horometro.onActionDescartarCambios()
        },

        onActionCalcCantPescaDecla: function () {
            var eventoActual = this._listaEventos[this._elementAct]; //modelo del evento actual
            var cantPescaDec = eventoActual.ListaPescaDeclarada.length;
            var cantTotal = eventoActual.CantTotalPescDecla;
            var pescaDecla = eventoActual.ListaPescaDeclarada;
            for (let index = 0; index < pescaDecla.length; index++) {
                const element = pescaDecla[index];
                var porcPesca = element.PorcPesca;
                element.Editado = true;
                element.PorcPesca = porcPesca;
                let cantidadCalc = cantTotal * (porcPesca * 0.01);
                element.CNPCM = cantidadCalc.toFixed(2);
            }
            //this.getView().getModel("eventos").updateBindings(true);
            //refrescar modelo
        },

        prepararVistaRevision: function () {
            this.getView().byId("cb_ZonaPesca").setEnabled(false);
            this.getView().byId("dtp_fechaIniCala").setEnabled(false);
            this.getView().byId("dtp_horaIniCala").setEnabled(false);
            this.getView().byId("dtf_fechaIniEnv").setEnabled(false);
            this.getView().byId("dtf_horaIniEnv").setEnabled(false);
            this.getView().byId("dtf_FechaProduccion").setEnabled(false);
            this.getView().byId("dtp_fechaFinCala").setEnabled(false);
            this.getView().byId("dtp_horaFinCala").setEnabled(false);
            this.getView().byId("dtf_fechaFinEnv").setEnabled(false);
            this.getView().byId("dtf_horaFinEnv").setEnabled(false);
            this.getView().byId("cmb_estaOperacion").setEnabled(false);//cambiar a false
            this.getView().byId("cb_tipoDescarga").setEnabled(false);
            this.getView().byId("i_temperaturaMar").setEnabled(false);
            this.getView().byId("i_stockCombustible").setEnabled(false);
            this.getView().byId("ip_muestra").setEnabled(false);
            this.getView().byId("ip_sistema_frio").setEnabled(false);
            this.getView().byId("cmb_motivoLim").setEnabled(false);
            this.getView().byId("cmb_motivoEspera").setEnabled(false);
            this.getView().byId("ip_observacion").setEnabled(false);
            this.getView().byId("ip_latitud1").setEnabled(false);
            this.getView().byId("ip_latitud2").setEnabled(false);
            this.getView().byId("ip_longitud1").setEnabled(false);
            this.getView().byId("ip_longitud2").setEnabled(false);

            this.getView().getModel("eventos").setProperty("/enabledBodCantpesca", false);
            this.getView().getModel("eventos").setProperty("/enabledCantPescDeclarada", false);
            this.getView().getModel("eventos").setProperty("/enabledCantPescDescargada", false);
            this.getView().getModel("eventos").setProperty("/enabledCantPescDeclDesc", false);
            this.getView().getModel("eventos").setProperty("/enabledPuntoDescarga", false);
            this.getView().getModel("eventos").setProperty("/enabledFechProdDesc", false);
            this.getView().getModel("eventos").setProperty("/enabledAveriado", false);
            this.getView().getModel("eventos").setProperty("/enabledCantEquipamiento", false);

        },
        //------METODOS ALEJANDRO-------------
        validarCantPescaDeclDesc: function () {
            var bOk = true;
            this.oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            var DetalleMarea = this._FormMarea;//modelo detalle de marea
            var eventoActual = this._listaEventos[this._elementAct];//modelo evento actual
            var indActual = this._elementAct;
            var nroEventoTope = this._nroEvento;
            var cantTotalDecl = 0;
            var cantTotalDeclDesc = 0;
            for (let index = (indActual + 1); index < this._listaEventos.length; index++) {
                const element = array[index];
                nroEventoTope = element.Numero;
                if (element.TipoEvento == "1") {
                    break;
                }
            }
            cantTotalDecl = this.obtenerCantTotalPescaDecla(nroEventoTope, this);
            cantTotalDeclDesc = this.obtenerCantTotalPescaDeclDesc(nroEventoTope, this);
            if (cantTotalDeclDesc > cantTotalDecl) {
                var mensaje = this.oBundle.getText("PESCDECDESCMAYPESCDEC");
                MessageBox.error(mensaje);
                bOk = false;
            }


            return bOk;
        },

        validarCambios:async function () {
            this.resetearValidaciones();
            let mod = this.getOwnerComponent().getModel("DetalleMarea");
            mod.setProperty("/Utils/MessageItemsEP", []);
            if(this.validacioncampos == false){

            }else{
                let bOk = await this.Dat_PescaDescargada.validarDatosEvento();
                var detalleMarea = this._FormMarea;//modelo detalle marea
                if (!bOk) {
                    var mensaje = this.oBundle.getText("DISCCHANEVENTMESSAGE");
                    this.agregarMensajeValid("Error", mensaje);
                    this.Dat_Horometro.mostrarEnlaces();
                    this.getView().getModel("eventos").updateBindings(true);
                    mod.refresh();
                } else {
                    detalleMarea.FormEditado = true;
                    this.getView().byId("Tab_eventos").setSelectedKey("");
                    await this.cargarValoresFormateados();
                    console.log("MOD: ", mod);
                    this.getView().getModel("eventos").updateBindings(true);
                    mod.refresh();
                     //NAVEGACION SI VALORES SON CORRECTOS
                    history.go(-1);
                 }
            }

            
            //refresh model
        },

        validarDatos:async function () {
            //var DataSession = {};//modelo data session
            let mod = this.getOwnerComponent().getModel("DetalleMarea");
            var visible = this.modeloVisible//textValidaciones.visible;//modelo visible
            var eventoActual = this._listaEventos[this._elementAct]; //nodo evento actual
            var detalleMarea = this._FormMarea;//modelo detalle marea
            var isRolIngComb = this._IsRolIngComb;
            if (eventoActual.CDTEV == "6") {
                visible.VisibleDescarga = false;
                visible.FechFin = false;
            } else {
                visible.VisibleDescarga = true;
            }

            var validarMareaEventos = this.validarMareaEventos(this);
            var validarDatosEvento = await this.Dat_PescaDescargada.validarDatosEvento();
            if (validarMareaEventos) {
                if (validarDatosEvento && !detalleMarea.TieneErrores) {
                    if (isRolIngComb) {
                        visible.VisibleObsvComb = true;
                    } else {
                        visible.VisibleObsvComb = false;
                    }

                    mod.setProperty("/Utils/VisibleEstCierre", false);
                    let texto = this.oBundle.getText("CONFIRMSAVEMESSAGE");
                    mod.setProperty("/Utils/TextoConfirmacion", texto);
                    this.verificarCierreMarea();
                    this.getDialog().open();
                }
            }
            this.modeloVisibleModel.refresh();
        },
        getConfirmDialog: function(){
            if (!this.oDialogConfirm) {
                this.oDialogConfirm = sap.ui.xmlfragment("com.tasa.registroeventospescav2.view.fragments.Confirm", this);
                this.getView().addDependent(this.oDialogConfirm);
            }
            return this.oDialogConfirm;
        },

        onCancelConfirm: function(){
            this.getDialog().close();
        },
        onCloseConfirm: async function(){
            this.getDialog().close();
            await this.SaveGeneral();
        },
        getDialog: function () {
            if (!this.oDialog) {
                this.oDialog = sap.ui.xmlfragment("com.tasa.registroeventospescav2.view.fragments.Confirm", this);
                this.getView().addDependent(this.oDialog);
            }
            return this.oDialog;
        },
        validarMareaEventos: function (me) {
            //this.oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            var modelo = me.getOwnerComponent().getModel("DetalleMarea");
            let motMarea = this._motivoMarea ? this._motivoMarea : modelo.getProperty("/Form/CDMMA");
            let _listaEventos = modelo.getProperty("/Eventos/Lista");
            if (!this.buscarValorFijo(textValidaciones.MOTIVOSINZARPE, motMarea)) {

                if (_listaEventos != null) {
                    for (let i = 0; i < _listaEventos.length; i++) {
                        if (_listaEventos[i].CDTEV == "1") { // Valido si existe al menos un evento de zarpe
                            return true;
                        }
                    }
                }
                var mensaje = me.oBundle.getText("NOEXISTEZARPE");
                MessageBox.error(mensaje);

            } else {
                return true;
            }
            return false;

        },
        distribuirDatosDescarga: async function (datos) {
            let data = this._listaEventos[this._elementAct].ListaPescaDescargada;
            if (data.length > 0) {
                let limpiar = false;
                let eventosNode = this._listaEventos;
                let codEmbarcacion = this._embarcacion;
                let motivoMarea = this._motivoMarea;
                let indActual = this._elementAct;
                let codPlanta = this._listaEventos[this._elementAct].CDPTA;
                let fechaIniDescarga = datos.FIDES;
                let pescaDescElement = data[0];

                limpiar = !this.Dat_General.verificarTemporada(motivoMarea, fechaIniDescarga);

                if (!limpiar && datos.ESDES != "N") {
                    limpiar = true;
                    let mssg = this.oBundle.getText("DESCDISTRIBUIDA");
                    MessageBox.error(mssg);
                }

                if (!limpiar) {
                    if (!codEmbarcacion == datos.CDEMB) {
                        limpiar = true;
                        let mssg1 = this.oBundle.getText("DESCNOEMBARCA");
                        MessageBox.error(mssg1);
                    }

                    if (!limpiar) {
                        for (let i = 0; i < eventosNode.length; i++) {
                            let tipoEvento = eventosNode[i].CDTEV;
                            let nroDescarga = eventosNode[i].NRDES;

                            if (tipoEvento == "6" && i != indActual) {
                                if (nroDescarga == datos.NRDES) {
                                    limpiar = true;
                                    let mssg2 = this.oBundle.getText("DESCARGATOMADA");
                                    MessageBox.error(mssg2);
                                    break;
                                }
                            }
                        }

                        if (!limpiar) {
                            if ((motivoMarea == "1" && datos.CDTPC != "D") || (motivoMarea == "2" && datos.CDTPC != "I")) {
                                limpiar = true;
                                let mssg3 = this.oBundle.getText("MOTIVONOTIPOPESCA");
                                MessageBox.error(mssg3);
                            }

                            if (!limpiar) {

                                if (datos.CDTPC != "D") {

                                    if (codPlanta != datos.CDPTA) {
                                        limpiar = true;
                                        let mssg4 = this.oBundle.getText("PTASDIFERENTES");
                                        MessageBox.error(mssg4);
                                    }
                                }
                                if (!limpiar) {
                                    
                                    pescaDescElement.EsNuevo = true;
                                    pescaDescElement.Nro_descarga = datos.NRDES;
                                    pescaDescElement.NroDescMostrar = datos.NRDES;
                                    pescaDescElement.TICKE = datos.TICKE;
                                    pescaDescElement.CDTPC = datos.CDTPC;
                                    pescaDescElement.DESC_CDTPC = datos.DESC_CDTPC;

                                    if (datos.CDTPC != "D") {
                                        pescaDescElement.CDPTA = datos.CDPTA;
                                    } else {
                                        pescaDescElement.CDPTA = codPlanta;
                                    }
                                    pescaDescElement.DSPTA = datos.DSPTA;
                                    pescaDescElement.CDSPC = datos.CDSPC;
                                    pescaDescElement.DSSPC = datos.DSSPC;
                                    pescaDescElement.CDLDS = datos.CDLDS;
                                    pescaDescElement.CDPDG = datos.CDPDG;
                                    pescaDescElement.DESC_CDLDS = datos.DESC_CDLDS;
                                    pescaDescElement.CNPDS = datos.CNPDS;
                                    pescaDescElement.PESACUMOD = datos.CNPDS;
                                    pescaDescElement.BckCantPescaModificada = pescaDescElement.PESACUMOD;
                                    pescaDescElement.FIDES = fechaIniDescarga;	//posicion 15				
                                    pescaDescElement.HIDES = datos.HIDES;
                                    pescaDescElement.FechHoraInicio = Utils.strDateHourToDate(pescaDescElement.FIDES, pescaDescElement.HIDES);
                                    pescaDescElement.FFDES = datos.FFDES;
                                    pescaDescElement.HFDES = datos.HFDES;
                                    pescaDescElement.FechHoraFin = Utils.strDateHourToDate(pescaDescElement.FFDES, pescaDescElement.HFDES);
                                    pescaDescElement.CNPCM = textValidaciones.CantPescaDeclaRestante;

                                    eventosNode[this._elementAct].NRDES = pescaDescElement.Nro_descarga;
                                    eventosNode[this._elementAct].CDSPC = pescaDescElement.CDSPC;
                                    eventosNode[this._elementAct].FIEVN = pescaDescElement.FIDES;
                                    eventosNode[this._elementAct].FFEVN = pescaDescElement.FFDES;
                                    eventosNode[this._elementAct].HIEVN = pescaDescElement.HIDES;
                                    eventosNode[this._elementAct].HFEVN = pescaDescElement.HFDES;

                                    limpiar = await !this.validarFechaAnterior();

                                    if (!limpiar) {
                                        let mensaje = await this.validarErroresDescarga(pescaDescElement.Nro_descarga);
                                        limpiar = mensaje != "";

                                        if (!limpiar) {
                                            let fechHoraCont = Utils.strDateHourToDate(pescaDescElement.FIDES , this._ConfiguracionEvento.descHoraCorte);
                                            let fechHoraComp = Utils.strDateHourToDate(pescaDescElement.FFDES , pescaDescElement.HFDES);

                                            if (fechHoraComp < fechHoraCont) {
                                                fechHoraCont.setMonth(fechHoraCont.getMonth() - 1);
                                            }

                                            pescaDescElement.FECCONMOV = Utils.dateToStrDate(fechHoraCont);
                                            eventosNode[this._elementAct].FechProduccion = pescaDescElement.FECCONMOV;
                                        } else {
                                            let mssg3 = mensaje;
                                            MessageBox.error(mssg3);
                                        }
                                    }


                                    if (!limpiar) {
                                        eventosNode[this._elementAct].Editado = true;
                                        this.getView().byId("pdt_col_BuscarDesc").setVisible(false);
                                        this.getView().byId("pdCHD_col_BuscarDesc").setVisible(false);

                                        this.getView().byId("pdt_col_EliminarDesc").setVisible(true);
                                        this.getView().byId("pde_col_EliminarDesc").setVisible(true);
                                        this.getView().byId("pdCHD_col_EliminarDesc").setVisible(true);
                                    }
                                }
                            }
                        }
                    }
                }


                if (limpiar) {
                    eventosNode[this._elementAct].NRDES = "";
                    eventosNode[this._elementAct].CDSPC = "";
                    eventosNode[this._elementAct].FIEVN = "";
                    eventosNode[this._elementAct].FFEVN = "";
                    eventosNode[this._elementAct].HIEVN = "";
                    eventosNode[this._elementAct].HFEVN = "";
                    eventosNode[this._elementAct].FechProduccion = "";
                    eventosNode[this._elementAct].ListaPescaDescargada = [];
                    data = [];
                }

                //Datos Validacion
                pescaDescElement.CantPescaDescargada = pescaDescElement.CNPDS;
                //----------------------------------------------

                this.getView().getModel("eventos").updateBindings(true);
            }
        },
        distribuirDatosDescargaCHD: function (datos) {
            let data = this._listaEventos[this._elementAct].ListaPescaDescargada;
            if (data.length > 0) {
                let limpiar = false;
                let codEmbarcacion = this._embarcacion;
                let motivoMarea = this._motivoMarea;
                let codPlanta = this._listaEventos[this._elementAct].CDPTA;
                let eventosNode = this._listaEventos;
                let fechaIniDescarga = datos.FIDES;
                let indActual = this._elementAct;
                let pescaDescElement = data[0];

                limpiar = !this.Dat_General.verificarTemporada(motivoMarea, fechaIniDescarga);

                if (!codEmbarcacion == datos.CDEMB) {
                    limpiar = true;
                    let mssg1 = this.oBundle.getText("DESCNOEMBARCA");
                    MessageBox.error(mssg1);
                }

                if (!limpiar) {
                    for (let i = 0; i < eventosNode.length; i++) {
                        let tipoEvento = eventosNode[i].CDTEV;
                        let nroDescarga = eventosNode[i].NRDES;

                        if (tipoEvento == "6" && i != indActual) {
                            if (nroDescarga == datos.NRDES) {
                                limpiar = true;
                                let mssg2 = this.oBundle.getText("DESCARGATOMADA");
                                MessageBox.error(mssg2);
                                break;
                            }
                        }
                    }

                    if (!limpiar) {
                        pescaDescElement.EsNuevo = true;
                        pescaDescElement.Nro_descarga = datos.NRDES;
                        pescaDescElement.NroDescMostrar = datos.NRDES;
                        pescaDescElement.TICKE = datos.TICKE;
                        pescaDescElement.CDTPC = datos.CDTPC;
                        pescaDescElement.DESC_CDTPC = datos.DESC_CDTPC;
                        pescaDescElement.CDPTA = datos.CDPTA;
                        pescaDescElement.DSPTA = datos.DSPTA;
                        pescaDescElement.CDSPC = datos.CDSPC;
                        pescaDescElement.DSSPC = datos.DSSPC;
                        pescaDescElement.CDLDS = datos.CDLDS;
                        //pescaDescElement.setDescLadoDescarga(manageSimpleTypes.getText(attInfoLadoDescarga, datos[9]));
                        pescaDescElement.CNPDS = datos.CNPDS;
                        pescaDescElement.PESACUMOD = pescaDescElement.CNPDS;
                        pescaDescElement.BckCantPescaModificada = pescaDescElement.PESACUMOD;
                        pescaDescElement.FIDES = fechaIniDescarga;	//posicion 15				
                        pescaDescElement.HIDES = datos.HIDES;
                        pescaDescElement.FechHoraInicio = Utils.strDateHourToDate(pescaDescElement.FIDES, pescaDescElement.HIDES);
                        pescaDescElement.FFDES = datos.FFDES;
                        pescaDescElement.HFDES = datos.HFDES;
                        pescaDescElement.FechHoraFin = Utils.strDateHourToDate(pescaDescElement.FFDES, pescaDescElement.HFDES);
                        pescaDescElement.CNPCM = textValidaciones.CantPescaDeclaRestante;

                        eventosNode[this._elementAct].NRDES = pescaDescElement.Nro_descarga;
                        eventosNode[this._elementAct].CDSPC = pescaDescElement.CDSPC;
                        eventosNode[this._elementAct].FIEVN = pescaDescElement.FIDES;
                        eventosNode[this._elementAct].FFEVN = pescaDescElement.FFDES;
                        eventosNode[this._elementAct].HIEVN = pescaDescElement.HIDES;
                        eventosNode[this._elementAct].HFEVN = pescaDescElement.HFDES;
                        eventosNode[this._elementAct].FechProduccion = pescaDescElement.FECCONMOV;

                        if (!limpiar) {
                            eventosNode[this._elementAct].Editado = true;
                            this.getView().byId("pdt_col_BuscarDesc").setVisible(false);
                            this.getView().byId("pdCHD_col_BuscarDesc").setVisible(false);

                            this.getView().byId("pdt_col_EliminarDesc").setVisible(true);
                            this.getView().byId("pde_col_EliminarDesc").setVisible(true);
                            this.getView().byId("pdCHD_col_EliminarDesc").setVisible(true);
                        }
                    }

                }

                if (limpiar) {
                    eventosNode[this._elementAct].NRDES = "";
                    eventosNode[this._elementAct].CDSPC = "";
                    data = [];
                }

                //Datos Validacion
                pescaDescElement.CantPescaDescargada = pescaDescElement.CNPDS;
                //----------------------------------------------
            }

            this.getView().getModel("eventos").updateBindings(true);
        },
        validarErroresDescarga: async function (nro_desc) {
            let serv_errorDesc = TasaBackendService.validarErroresDescarga(nro_desc);
            let mensaje = "";
            await Promise.resolve(serv_errorDesc).then(values => {
                let rep = JSON.parse(values).data
                if (rep.length > 0) {
                    mensaje = rep[0].MENSAJE;
                }
            }).catch(reason => {

            });

            return mensaje;
        },
        validarFechaAnterior: function () {
            let bOk = true;
            let validar = true;
            let nodoEventos = this._listaEventos;
            let indice = this._elementAct;
            let motivoMarea = this._motivoMarea;
            let tipoEvento = this._tipoEvento;
            let indPropPlanta = this._listaEventos[this._elementAct].INPRP;
            let tipoEveAnt = nodoEventos[Number(indice) - 1].CDTEV;
            let fechaIniEvento = nodoEventos[indice].FIEVN;
            let horaIniEvento =  nodoEventos[indice].HIEVN;
            let fechaFinEvento = nodoEventos[indice].FFEVN;
            let horaFinEvento = nodoEventos[indice].HFEVN;
            let fechHorIniEvento =  Utils.strDateHourToDate(fechaIniEvento , horaIniEvento);
            let fechHorFinEvento =  Utils.strDateHourToDate(fechaFinEvento , horaFinEvento);
            let bckFechHorIniEvento =  null;
            let bckFechHorFinEvento = null;
            if(nodoEventos[indice].BckFechIni ? true : false){
                bckFechHorIniEvento =  new Date(nodoEventos[indice].BckFechIni + " " + nodoEventos[indice].BckHoraIni);
            }
            if(nodoEventos[indice].BckFechFin ? true : false){
                bckFechHorFinEvento =  new Date(nodoEventos[indice].BckFechFin + " " + nodoEventos[indice].BckHoraFin);
            }
            let fechHorActual =  new Date();
            let modelo = this.getOwnerComponent().getModel("DetalleMarea");
            let nodoEsperaMarAnt = modelo.getProperty("/EsperaMareaAnt");
            let nodoMareaAnt = modelo.getProperty("/MareaAnterior");
            let exisFechaFin = this.buscarValorFijo(textValidaciones.EVEVISFECHAFIN, tipoEvento);
            let exisEspMarAnt = nodoEsperaMarAnt.length > 0;

            validar = (!exisFechaFin && fechHorIniEvento != null) || (exisFechaFin && fechHorIniEvento != null && fechHorFinEvento != null);

            if (tipoEveAnt != "" && tipoEvento != ""  && tipoEveAnt == "6" && tipoEvento == "6") { //Si el evento actual y anterior son descargas, no se valida fechas
                validar = false;
            }

            if (validar) {
                nodoEventos[indice].CambFechas = false;

                if ((bckFechHorIniEvento == null || (bckFechHorIniEvento != null && fechHorIniEvento != bckFechHorIniEvento)) || (exisFechaFin && (bckFechHorFinEvento == null
                        || (bckFechHorFinEvento != null && fechHorFinEvento != bckFechHorFinEvento)))) {

                    nodoEventos[indice].CambFechas = true;

                    if (indice > 0) {
                        let indiceAnt = Number(indice) - 1;
                        let tipoEventoAnt = nodoEventos[indiceAnt].CDTEV;
                        let fechaEventoAnt = null;
                        let horaEventoAnt = null;
                        let fechHorEventoAnt = null;

                        if (this.buscarValorFijo(textValidaciones.EVEVISFECHAFIN, tipoEventoAnt)) {
                            fechaEventoAnt = nodoEventos[indiceAnt].FFEVN;
                            horaEventoAnt = nodoEventos[indiceAnt].HFEVN;
                        } else {
                            fechaEventoAnt = nodoEventos[indiceAnt].FIEVN;
                            horaEventoAnt = nodoEventos[indiceAnt].HIEVN;
                        }

                        fechHorEventoAnt = Utils.strDateHourToDate(fechaEventoAnt,horaEventoAnt);	

				        let sFechHorEventoAnt = Utils.strDateHourToDate(fechaEventoAnt, horaEventoAnt);

                        if (!this.buscarValorFijo(textValidaciones.EVEFEINIFEFIN, tipoEvento) && tipoEventoAnt != "7" && !(fechHorIniEvento < fechHorEventoAnt)) {
                            bOk = false;
                            var mssg2 = this.oBundle.getText("FECHEVEANTMENOR", [sFechHorEventoAnt]);
                            MessageBox.error(mssg2);

                        } else if ((this.buscarValorFijo(textValidaciones.EVEFEINIFEFIN, tipoEvento)  || (tipoEvento == "1" && tipoEventoAnt == "7")) && fechHorIniEvento < fechHorEventoAnt) {
                            bOk = false;
                            var mssg2 = this.oBundle.getText("FECHINIEVEMENFECHEVEANT", [sFechHorEventoAnt]);
                            MessageBox.error(mssg2);
                        } else if (!(fechHorIniEvento < fechHorActual)) {
                            bOk = false;
                            var mssg2 = this.oBundle.getText("FECHAEVEMENOFECHACT");
                            MessageBox.error(mssg2);
                        }

                        if (bOk && exisFechaFin) {
                            if (!(fechHorFinEvento > fechHorIniEvento)) {
                                bOk = false;
                                var mssg2 = this.oBundle.getText("FECHAINIEVEMENOFECHAFIN");
                                MessageBox.error(mssg2);
                            } else if (!(fechHorFinEvento < fechHorActual)) {
                                bOk = false;
                                var mssg2 = this.oBundle.getText("FECHAFINEVEMENOFECHACT");
                                MessageBox.error(mssg2);
                            }
                        }

                        if (bOk && tipoEvento == "3") {
                            if (this._ConfiguracionEvento.CalaUMTiemMaxValido) {
                                let miliFechaFinMax = fechHorIniEvento.getTime() + Number(this._ConfiguracionEvento.CalaMiliTiemMaximo);
                                let fecHorFinMax = new Date(miliFechaFinMax);

                                if (fechHorFinEvento > fecHorFinMax) {
                                    bOk = false;
                                    var mssg2 = this.oBundle.getText("FINCALANOMAYORA", [fecHorFinMax]);
                                    MessageBox.error(mssg2);

                                }
                            } else {
                                var mssg2 = this.oBundle.getText("UMCALTIMAXINV");
                                MessageBox.error(mssg2);
                            }

                            if (this._ConfiguracionEvento.CalaUMTMinEntreValido) {
                                if (bOk && tipoEventoAnt.equals("3")) {
                                    let tiempoMinEntre = this._ConfiguracionEvento.CalaTiemMinEntre + " "  + this._ConfiguracionEvento.CalaDescUMTiemMinEntre;
                                    let miliDuracion = fechHorFinEvento.getTime() - fechHorIniEvento.getTime();
                                    let miliDuracionMin = this._ConfiguracionEvento.CalaMiliTiemMinEntre;

                                    if (miliDuracion < miliDuracionMin) {
                                        bOk = false;
                                        var mssg2 = this.oBundle.getText("DURCALAMENMIN", [tiempoMinEntre]);
                                        MessageBox.error(mssg2);
                                    }
                                }
                            } else {
                                var mssg2 = this.oBundle.getText("UMCALTIMINENTINV");
                                MessageBox.error(mssg2);
                            }
                        }

                    } else if (this._indicadorProp == "P") {
                        let motivoMareaAnt = nodoMareaAnt.CDMMA;

                        if (motivoMareaAnt != "") {
                            let tipoEventoAnt = "";
                            let fechaEventoAnt = null;
                            let horaEventoAnt = null;
                            let fechHorEventoAnt = null;

                            if (exisEspMarAnt) {
                                tipoEventoAnt = "7";
                                fechaEventoAnt = nodoEsperaMarAnt.FFEVN;
                                horaEventoAnt = nodoEsperaMarAnt.HFEVN;
                            } else {
                                if (!this.buscarValorFijo(textValidaciones.MOTIVOSINZARPE, motivoMareaAnt)) {
                                    tipoEventoAnt = nodoMareaAnt.EventoMarAnt.CDTEV;

                                    if (this.buscarValorFijo(textValidaciones.EVEPERVALFECHA, tipoEventoAnt)) {
                                        fechaEventoAnt = nodoMareaAnt.EventoMarAnt.FIEVN;
                                        horaEventoAnt = nodoMareaAnt.EventoMarAnt.HIEVN;
                                        fechHorEventoAnt = null;

                                        if (this.buscarValorFijo(textValidaciones.EVEVISFECHAFIN, tipoEventoAnt)) {
                                            fechaEventoAnt = nodoMareaAnt.EventoMarAnt.FFEVN;
                                            horaEventoAnt = nodoMareaAnt.EventoMarAnt.HFEVN;
                                        }

                                        fechHorEventoAnt = new Date(fechaEventoAnt + " " + horaEventoAnt);
                                    } else {
                                        var mssg2 = this.oBundle.getText("MARANTNOFINEVEVAL");
                                        MessageBox.error(mssg2);
                                    }
                                } else {
                                    fechaEventoAnt = nodoMareaAnt.getFecFin();
                                    horaEventoAnt = wnodoMareaAnt.getHorFin();
                                    fechHorEventoAnt = new Date(fechaEventoAnt + " " + horaEventoAnt);
                                }
                            }

					        let sFechHorEventoAnt = Utils.strDateHourToDate(fechaEventoAnt, horaEventoAnt);

                            if (fechHorEventoAnt != null && !(fechHorIniEvento > fechHorEventoAnt) && tipoEvento != "7" && tipoEventoAnt != "7") {
                                bOk = false;
                                var mssg2 = this.oBundle.getText("FECHEVEANTMENOR", [sFechHorEventoAnt]);
                                MessageBox.error(mssg2);

                            } else if (tipoEvento == "7" && fechHorIniEvento < fechHorEventoAnt) {
                                bOk = false;
                                var mssg2 = this.oBundle.getText("FECHINIEVEMENFECHEVEANT", [sFechHorEventoAnt]);
                                MessageBox.error(mssg2);
                            } else if (!(fechHorIniEvento < fechHorActual)) {
                                bOk = false;
                                var mssg2 = this.oBundle.getText("FECHAEVEMENOFECHACT");
                                MessageBox.error(mssg2);
                            }
                        } else {
                            var mssg2 = this.oBundle.getText("NOEXISTDATAMARANT");
                            MessageBox.error(mssg2);
                        }
                    }

                }

                nodoEventos.BckFechIni = fechaIniEvento;
                nodoEventos.BckHoraIni = horaIniEvento;
                nodoEventos.BckFechFin = fechaFinEvento;
                nodoEventos.BckHoraFin = horaFinEvento;

                if (!bOk) {
                    nodoEventos.BckFechIni = null;
                    nodoEventos.BckHoraIni = null;
                    nodoEventos.BckFechFin = null;
                    nodoEventos.BckHoraFin = null;
                }
                this.getView().getModel("eventos").updateBindings(true);
            }

            return bOk;

        },

        //-----------------------------

        resetView: function () {
            this.getView().byId("labelTextFechIniEnv").setText("Fecha/hora");
            this.getView().byId("cb_ZonaPesca").setEnabled(true);
            this.getView().byId("dtp_fechaIniCala").setEnabled(true);
            this.getView().byId("dtp_horaIniCala").setEnabled(true);
            this.getView().byId("dtf_fechaIniEnv").setEnabled(true);
            this.getView().byId("dtf_horaIniEnv").setEnabled(true);
            this.getView().byId("dtf_FechaProduccion").setEnabled(true);
            this.getView().byId("dtp_fechaFinCala").setEnabled(true);
            this.getView().byId("dtp_horaFinCala").setEnabled(true);
            this.getView().byId("dtf_fechaFinEnv").setEnabled(true);
            this.getView().byId("dtf_horaFinEnv").setEnabled(true);
            this.getView().byId("cmb_estaOperacion").setEnabled(true);//cambiar a false
            this.getView().byId("cb_tipoDescarga").setEnabled(true);
            this.getView().byId("i_temperaturaMar").setEnabled(true);
            this.getView().byId("i_stockCombustible").setEnabled(true);
            this.getView().byId("ip_muestra").setEnabled(true);
            this.getView().byId("ip_sistema_frio").setEnabled(true);
            this.getView().byId("cmb_motivoLim").setEnabled(true);
            this.getView().byId("cmb_motivoEspera").setEnabled(true);
            this.getView().byId("ip_observacion").setEnabled(true);
            this.getView().byId("ip_latitud1").setEnabled(true);
            this.getView().byId("ip_latitud2").setEnabled(true);
            this.getView().byId("ip_longitud1").setEnabled(true);
            this.getView().byId("ip_longitud2").setEnabled(true);

            this.getView().getModel("eventos").setProperty("/enabledBodCantpesca", true);
            this.getView().getModel("eventos").setProperty("/enabledCantPescDeclarada", true);
            this.getView().getModel("eventos").setProperty("/enabledCantPescDescargada", true);
            this.getView().getModel("eventos").setProperty("/enabledCantPescDeclDesc", true);
            this.getView().getModel("eventos").setProperty("/enabledPuntoDescarga", true);
            this.getView().getModel("eventos").setProperty("/enabledFechProdDesc", true);
            this.getView().getModel("eventos").setProperty("/enabledAveriado", true);
            this.getView().getModel("eventos").setProperty("/enabledCantEquipamiento", true);

            this.getView().byId("FechaEnvaseIni").setVisible(false);
            this.getView().byId("FechaEnvaseFin").setVisible(false);
            this.getView().byId("fe_Empresa").setVisible(false);
            this.getView().byId("fe_ZonaPesca").setVisible(false);
            this.getView().byId("f_LatitudLongitud").setVisible(false);
            this.getView().byId("fe_muestra").setVisible(false);
            this.getView().byId("fe_fechaIniCala").setVisible(false);
            this.getView().byId("fe_fechaFinCala").setVisible(false);
            this.getView().byId("fe_FechaProduccion").setVisible(false);
            this.getView().byId("fe_fechaArribo").setVisible(false);
            this.getView().byId("fe_MotiNoPesca").setVisible(false);
            this.getView().byId("0004").setVisible(false);
            this.getView().byId("0003").setVisible(false);
            this.getView().byId("fe_estadoOperacion").setVisible(false);
            this.getView().byId("fe_tipoDescarga").setVisible(false);
            this.getView().byId("fe_stockCombustible").setVisible(false);
            //this.getView().byId("fe_motivoLimitacion").setVisible(false);
            this.getView().byId("fe_temperaturaMar").setVisible(false);
            this.getView().byId("fe_sistema_frio").setVisible(false);
            this.getView().byId("fe_observacioAdic").setVisible(false);
            this.getView().byId("clm_moda_pescDecl").setVisible(false);
            this.getView().byId("ext_pesc_desc").setVisible(false);
            this.getView().byId("ext_pesc_desc_chd").setVisible(false);
            this.getView().byId("table_pesc_desc_especie").setVisible(false);
            this.getView().byId("table_pesc_desc_CHD").setVisible(false);
            this.getView().byId("table_pesc_desc_ticket").setVisible(false);
            this.getView().byId("pdt_col_BuscarDesc").setVisible(false);
            this.getView().byId("pdCHD_col_BuscarDesc").setVisible(false);
            this.getView().byId("pdt_col_EliminarDesc").setVisible(false);
            this.getView().byId("pde_col_EliminarDesc").setVisible(false);
            this.getView().byId("pdCHD_col_EliminarDesc").setVisible(false);
            this.getView().byId("col_porc_pesc_desc").setVisible(false);
            this.getView().byId("ext_pesca_declarada").setVisible(false);
            this.getView().byId("ext_siniestro").setVisible(false);
            //tabs
            this.getView().byId("idDistribucion").setVisible(false);
            this.getView().byId("idBiometria").setVisible(false);
            this.getView().byId("idPescaDesc").setVisible(false);
            this.getView().byId("idPescaDecl").setVisible(false);
            this.getView().byId("idHorometro").setVisible(false);
            this.getView().byId("idSiniestro").setVisible(false);
            this.getView().byId("idAccidente").setVisible(false);
            this.getView().byId("idEquipamiento").setVisible(false);
            //
            //this.getView().byId("idEquipamiento")

        },

        getCurrentUser: function () {
            // const oUserInfo = await this.getUserInfoService();
            // const sUserEmail = oUserInfo.getEmail(); //fgarcia@tasa.com.pe
            // var usuario = sUserEmail.split("@")[0].toUpperCase();
            // return usuario;

            return "FGARCIA";
        },

        getUserInfoService: function() {
            return new Promise(resolve => sap.ui.require([
              "sap/ushell/library"
            ], oSapUshellLib => {
              const oContainer = oSapUshellLib.Container;
              const pService = oContainer.getServiceAsync("UserInfo"); // .getService is deprecated!
              resolve(pService);
            }));
        },

        //----------------------------------------------------------------------  METODOS CREAR EVENTO ------------------------------------------------------------------
        cerrarCrearEvento : async function(){
            let mod = this.getOwnerComponent().getModel("DetalleMarea");
            let tipoEvento  =  mod.getProperty("/Utils/TipoEvento");
            let descrip_tipoEvento  =  mod.getProperty("/Utils/DescTipoEvento");
            let LstEvento = mod.getProperty("/Eventos/Lista")

            let timeInMilis = new Date();
            //timeInMilis = timeInMilis.getTime();
            
            if (tipoEvento != null) {
                this._tipoEvento = tipoEvento;
                this._nroEvento = Number(LstEvento.length) + 1;

                var obj = {
                    INDTR : "N",
                    CDTEV : tipoEvento,
                    DESC_CDTEV : descrip_tipoEvento,
                    NREVN : Number(LstEvento.length) + 1,
                    ESEVN : "S",
                    ACEVN : this.getCurrentUser(),
                    FCEVN : Utils.dateToStrDate(timeInMilis),
                    HCEVN : Utils.strHourToSapHo(Utils.dateToStrHours(timeInMilis))
                }
                mod.setProperty("/Form/FormEditado",true);
                mod.setProperty("/Form/MareaEditada",true);
                mod.setProperty("/Form/MareaEditada",true);
                this.setVisibleBtnSave(true, false);
                LstEvento.push(obj);
                
                this._eventoNuevo = Number(LstEvento.length) -1;
                this._elementAct = this._eventoNuevo;
                mod.setProperty("/Utils/FlagVistaBiometria",true);
                mod.setProperty("/Utils/NroEvento_Incidental",Number(LstEvento.length) + 1);
                //wdThis.wdGetFormCustController().setVisibleBtnFooter(true, false); -- la botonera de alejandro revisar
                /************ Carga de fragments de los eventos **************/
                let self = this;
                await this.cargarServiciosCrearEvento().then(r => {

                    if (r) {
                        self.getFragment();
                    } else {
                        BusyIndicator.hide();
                        alert("Error");
                    }

                })
                
            }
            
        },
        prepararNuevoEvento :async function(){
            this._elementAct = this._eventoNuevo;
            await this.obtenerDatosDistribFlota();
            this.prepararVista(true);
            let mod = this.getOwnerComponent().getModel("DetalleMarea");
            let nodoEventos = mod.getProperty("/Eventos/Lista");
            let tipoEvento = nodoEventos[this._eventoNuevo].CDTEV;
            let motivoMarea = mod.getProperty("/Form/CDMMA");
            let indiPropiedad = mod.getProperty("/Form/INPRP");
            let indiPropPlanta = nodoEventos[this._eventoNuevo].INPRP;
            let cantEventos = nodoEventos.length;
            let fechaSist = new Date();
            
            //wdContext.currentEventosElement().setDescTipoEvento(manageSimpleTypes.getText(attInfoTipoPesca, tipoEvento));-- descripcion debe estar en el modelo
            nodoEventos[this._eventoNuevo].FCEVN = Utils.dateToStrDate(fechaSist);
            nodoEventos[this._eventoNuevo].HCEVN = Utils.strHourToSapHo(Utils.dateToStrHours(fechaSist));
            nodoEventos[this._eventoNuevo].AMEVN = this.getCurrentUser();

            this.obtenerDatosFechaAnterior();	

            if (tipoEvento != "7") {
                nodoEventos[this._eventoNuevo].FIEVN = Utils.dateToStrDate(fechaSist);
                nodoEventos[this._eventoNuevo].HIEVN = Utils.strHourToSapHo(Utils.dateToStrHours(fechaSist));
                //BIOMETRIA
                nodoEventos[this._eventoNuevo].FICAL = Utils.dateToStrDate(fechaSist);
                nodoEventos[this._eventoNuevo].HICAL = Utils.strHourToSapHo(Utils.dateToStrHours(fechaSist));
            }
            //Cambiar etiqueta a ENVASE sólo cuando se vea calas.
            if (tipoEvento == "3") {
                this.getView().byId("idTallaMenor").setValue("0");
                this.getView().byId("idTallaMayor").setValue("0");
                let fechaIniEnvase = this.getView().byId("FechaEnvaseIni");
                fechaIniEnvase.setVisible(true);
                var fechaIniEnvaseText = this.getView().byId("0001");
                fechaIniEnvaseText.setHeaderText("Envase");
            }else {
                var fechaIniEnvaseText = this.getView().byId("0001");
                fechaIniEnvaseText.setHeaderText("Fechas");
            }

            
            //Limpiar pesca incidental para nuevo evento cala
            if (tipoEvento == "3") {
                nodoEventos[this._eventoNuevo].ListaIncidental = [];
                mod.setProperty("/Utils/NroEvento_Biometria",nodoEventos[this._eventoNuevo].NREVN);
            }
            
            if (this.buscarValorFijo(textValidaciones.EVEVISFECHAFIN, tipoEvento)) {
                nodoEventos[this._eventoNuevo].FFEVN = Utils.dateToStrDate(fechaSist);
                nodoEventos[this._eventoNuevo].HFEVN = Utils.strHourToSapHo(Utils.dateToStrHours(fechaSist));
                //BIOMETRIA
                nodoEventos[this._eventoNuevo].FFCAL = Utils.dateToStrDate(fechaSist);
                nodoEventos[this._eventoNuevo].HFCAL = Utils.strHourToSapHo(Utils.dateToStrHours(fechaSist));
            }
                
            if (tipoEvento == "3") {
                this.getView().byId("FechaEnvaseIni").setVisible(true);
                this.posicionarEventoAnterior("2");
                await this.serviceNE_obtenerListaCoordZonaPesca();
                this.obtenerCoordZonaPesca();
                
                let latiMin = this._listaEventos[this._elementAct].ZPLatiIni;
                let latiMax = this._listaEventos[this._elementAct].ZPLatiFin;
                let longMin = this._listaEventos[this._elementAct].ZPLongIni;
                let longMax = this._listaEventos[this._elementAct].ZPLongFin;
                let descLatiLongZP = this._listaEventos[this._elementAct].DescLatiLongZonaPesca;
                let v_descLati1     = this._listaEventos[this._elementAct].DescLati1;
                let v_descLati2    = this._listaEventos[this._elementAct].DescLati2;
                let v_descLong1     = this._listaEventos[this._elementAct].DescLong1;
                let v_descLong2     = this._listaEventos[this._elementAct].DescLong2;
                
                this._elementAct = this._eventoNuevo;
                nodoEventos[this._eventoNuevo].ZPLatiIni = latiMin;
                nodoEventos[this._eventoNuevo].ZPLatiFin = latiMax;
                nodoEventos[this._eventoNuevo].ZPLongIni = longMin;
                nodoEventos[this._eventoNuevo].ZPLongFin = longMax;
                nodoEventos[this._eventoNuevo].DescLatiLongZonaPesca = descLatiLongZP;
                nodoEventos[this._eventoNuevo].DescLati1 = v_descLati1;
                nodoEventos[this._eventoNuevo].DescLati2 = v_descLati2;
                nodoEventos[this._eventoNuevo].DescLong1 = v_descLong1;
                nodoEventos[this._eventoNuevo].DescLong2 = v_descLong2;
                nodoEventos[this._eventoNuevo].ObteEspePermitidas = true;
                nodoEventos[this._eventoNuevo].CantTotalPescDecla = 0;
            }
                
            if (this.buscarValorFijo(textValidaciones.COPIARZONAPESC, tipoEvento)) {
                this.posicionarEventoAnterior("2");
                let zonaPesca = this._listaEventos[this._elementAct].CDZPC;
                        
                this._elementAct = this._eventoNuevo;
                nodoEventos[this._eventoNuevo].CDZPC = zonaPesca;
            }	
            
            if (tipoEvento == "4") {
                this.getView().byId("FechaEnvaseIni").setVisible(true);
            }
            
            if (tipoEvento == "5") {
                this.getView().byId("FechaEnvaseIni").setVisible(true);
                let totalPescaCala = await this.Dat_PescaDeclarada.obtenerCantTotalDeclMarea(0);
                let totalPescaDeclDesc = this.obtenerCantTotalPescaDeclDesc(0,this);
                
                nodoEventos[this._eventoNuevo].CantTotalPescDecla = totalPescaCala;	//Cantidad total de pesca declarada por marea
                
                if (this.buscarValorFijo(textValidaciones.MOTIVOPESCADES, motivoMarea) && totalPescaCala == totalPescaDeclDesc) {
                    this.getView().byId("fe_MotiNoPesca").setVisible(true);
                }
                
            }
            
            if (tipoEvento == "6") {
                this.getView().byId("FechaEnvaseIni").setVisible(false);
                this.getView().byId("FechaEnvaseFin").setVisible(false);
                if (indiPropiedad == "T") {
                    nodoEventos[this._eventoNuevo].CDTDS = "P";
                } else if (indiPropiedad == "P") {
                    if (indiPropPlanta == "P") {
                        nodoEventos[this._eventoNuevo].CDTDS = "P";
                    } else {
                        nodoEventos[this._eventoNuevo].CDTDS = "T";
                    }
                }
                
                if (this.buscarValorFijo(textValidaciones.MOTIVOPESCADES, motivoMarea)) {
                    this.obtenerPuntosDescarga();
                    let psc_dcl = await this.obtenerPescaDeclDescarga();
                    psc_dcl = Utils.formatoPescaDcl(psc_dcl);
                    nodoEventos[this._eventoNuevo].ListaPescaDescargada[0] = {}
                    nodoEventos[this._eventoNuevo].ListaPescaDescargada[0].EsNuevo = true;
                    nodoEventos[this._eventoNuevo].ListaPescaDescargada[0].CantPescaDeclarada = psc_dcl;
                    mod.setProperty("/Eventos/CantPescaDescDeclText",nodoEventos[this._eventoNuevo].ListaPescaDescargada[0].CantPescaDeclarada);
                    if (indiPropPlanta == "P") { 	//Descarga en planta propia
                        //Si es (CHI o CHD)
                        if (motivoMarea == "2" || motivoMarea == "1") {
                            nodoEventos[this._eventoNuevo].FIEVN = null;
                            nodoEventos[this._eventoNuevo].HIEVN = null;
                            nodoEventos[this._eventoNuevo].FFEVN = null;
                            nodoEventos[this._eventoNuevo].HFEVN = null;
                        }
                    } else if (indiPropPlanta == "T") {
                        nodoEventos[this._eventoNuevo].ListaPescaDescargada[0].CDPTA = nodoEventos[this._eventoNuevo].CDPTA;
                    }
                }	
            }
            else{
                this.getView().byId("FechaEnvaseIni").setVisible(true);
            }
            //Tab Equipamiento
            if (this.buscarValorFijo(textValidaciones.EVEVISTABEQUIP,  tipoEvento)) {
                this.obtenerEquipamiento();
            }

            //Tab Horometro
            if (this.buscarValorFijo(textValidaciones.EVEVISTABHOROM, tipoEvento)) {
                await this.obtenerHorometros();
            }

            //Tab Pesca Descargada
            if (this.buscarValorFijo(textValidaciones.EVEVISTABPEDSC, tipoEvento)) {
                nodoEventos[this._eventoNuevo].ListaPescaDescargada[0].INDTR = "N";	
                let nroDescarga = mod.getProperty("/Form/WERKS");;
                
                if (motivoMarea == "1") {
                    nodoEventos[this._eventoNuevo].ListaPescaDescargada[0].CDTPC = "D";			
                } else if (motivoMarea == "2") {	
                    nodoEventos[this._eventoNuevo].ListaPescaDescargada[0].CDTPC = "I";					
                }	

                if (indiPropPlanta == "P") {
                        nodoEventos[this._eventoNuevo].ListaPescaDescargada[0].INDTR = "E";
                        nodoEventos[this._eventoNuevo].ListaPescaDescargada[0].INDEJ = "C";
                } else {
                    nodoEventos[this._eventoNuevo].ListaPescaDescargada[0].CDSPC = "0000000000";
                    nodoEventos[this._eventoNuevo].ListaPescaDescargada[0].NRDES = nroDescarga + "T";
                }
            }

            //Tab Distribucion
            if (tipoEvento == "3") {
                this.getView().byId("FechaEnvaseIni").setVisible(true);
                this.obtenerBodegas();
            }
            
            //Mostrar Sistema frio
            if (this._indicadorProp == textValidaciones.INDIC_PROPIEDAD_PROPIOS) {
                
                if (this._tipoPreservacion != "" && this._tipoPreservacion != "4") {
                    if(Number( nodoEventos[this._eventoNuevo].CDTEV) < 6 && nodoEventos[this._eventoNuevo].CDTEV != "H" && nodoEventos[this._eventoNuevo].CDTEV != "T") {
                        this.getView().byId("FechaEnvaseIni").setVisible(true);
                        this.getView().byId("fe_sistema_frio").setVisible(true);
                        mod.setProperty("/Utils/OpSistFrio",true);
                        
                    } else {
                        this.getView().byId("fe_sistema_frio").setVisible(false);
                        mod.setProperty("/Utils/OpSistFrio",false);
                    }
                    
                } else {
                    this.getView().byId("fe_sistema_frio").setVisible(false);
                    mod.setProperty("/Utils/OpSistFrio",false);
                }
            }
            this.getView().getModel("eventos").updateBindings(true);
        },
        obtenerDatosDistribFlota : async function(){
            let mod = this.getOwnerComponent().getModel("DetalleMarea");
            if (this._tipoEvento != "6") {
                this.getView().byId("FechaEnvaseIni").setVisible(true);
                if (this._FormMarea.EsNuevo == false ||  (this._FormMarea.EsNuevo && this._indicadorProp == "P")) {
                    await sap.ui.controller("com.tasa.registroeventospescav2.controller.DetalleMarea").obtenerDatosDistribFlota(this);
                    //DetalleMarea.obtenerDatosDistribFlota();
                }
                let nodoEventos = mod.getProperty("/Eventos/Lista");
                let distribFlotaElement = mod.getProperty("/DistribFlota");
                nodoEventos[this._eventoNuevo].CDPTO = distribFlotaElement.CDPTO;
                nodoEventos[this._eventoNuevo].DSPTO = distribFlotaElement.DSPTO;
                nodoEventos[this._eventoNuevo].CDPTA = distribFlotaElement.CDPTA;
                nodoEventos[this._eventoNuevo].WERKS = distribFlotaElement.WKSPT;
                nodoEventos[this._eventoNuevo].DESCR = distribFlotaElement.DESCR;
                nodoEventos[this._eventoNuevo].INPRP = distribFlotaElement.INPRP;
                nodoEventos[this._eventoNuevo].CDEMP = this._indicadorProp == "P" ? distribFlotaElement.EMPLA : distribFlotaElement.CDEMP;
                nodoEventos[this._eventoNuevo].DSEMP = distribFlotaElement.DSEMP;
            } else {
                this.getView().byId("FechaEnvaseIni").setVisible(false);
                this.getView().byId("FechaEnvaseFin").setVisible(false);
                this.obtenerDatoPlantaAnt();
            }

        },
        obtenerDatosFechaAnterior : function(){
            let mod = this.getOwnerComponent().getModel("DetalleMarea");
            let nodoEventos = mod.getProperty("/Eventos/Lista");
            let tipoEvento = nodoEventos[this._eventoNuevo].CDTEV;
            let cantEventos = nodoEventos.length;
            let elementAct = this._elementAct;
            let elementAnt = Number(this._elementAct) - 1;
            let fechaAnt = null;
            let horaAnt = null;
            
            if (cantEventos > 1) {	
                
                let tipoEventoAnt = nodoEventos[elementAnt].CDTEV;
                fechaAnt = nodoEventos[elementAnt].FIEVN;
                horaAnt = nodoEventos[elementAnt].HIEVN;	
                
                if (this.buscarValorFijo(textValidaciones.EVEVISFECHAFIN, tipoEventoAnt)) {
                    fechaAnt = nodoEventos[elementAnt].FFEVN;
                    horaAnt = nodoEventos[elementAnt].HFEVN;		
                }
                
                nodoEventos[elementAct].FIEVN  = fechaAnt;
                nodoEventos[elementAct].HIEVN = horaAnt;
                
                if (this.buscarValorFijo(textValidaciones.EVEVISFECHAFIN, tipoEvento)) {	
                    nodoEventos[elementAct].FFEVN  = fechaAnt;
                    nodoEventos[elementAct].HFEVN = horaAnt;				
                }
                
                if (tipoEvento == "6") {
                    this.getView().byId("FechaEnvaseIni").setVisible(false);
                    this.getView().byId("FechaEnvaseFin").setVisible(false);
                    let horaCorte = this._ConfiguracionEvento.descHoraCorte;
                    
                    let fechHoraProd = Utils.strDateHourToDate(fechaAnt, horaCorte);
                    let fechHoraIni = Utils.strDateHourToDate(fechaAnt, horaAnt); //fechaAnt
                    
                    if (fechHoraIni < fechHoraProd) {
                        fechHoraProd.setDate(fechHoraProd.getDate() - 1);
                        //fechHoraProd.setMonth(fechHoraProd.getMonth() - 1);
                    }
                    
                    nodoEventos[elementAct].FechProduccion = Utils.dateToStrDate(fechHoraProd);	
                }
            } else if ( this._indicadorProp == textValidaciones.INDIC_PROPIEDAD_PROPIOS) {
                let motivoMareaAnt = mod.getProperty("/MareaAnterior/CDMMA");

                if (motivoMareaAnt != "") {

                    if (!this.buscarValorFijo(textValidaciones.MOTIVOSINZARPE, motivoMareaAnt)) {
                        let tipoEventoAnt = mod.getProperty("/MareaAnterior/EventoMarAnt/CDTEV");
            
                        if (this.buscarValorFijo(textValidaciones.EVEPERVALFECHA, tipoEventoAnt)) {
                            fechaAnt = mod.getProperty("/MareaAnterior/EventoMarAnt/FIEVN");
                            horaAnt  = mod.getProperty("/MareaAnterior/EventoMarAnt/HIEVN");
                
                            if (this.buscarValorFijo(textValidaciones.EVEVISFECHAFIN, tipoEventoAnt)) {
                                fechaAnt = mod.getProperty("/MareaAnterior/EventoMarAnt/FFEVN");
                                horaAnt  = mod.getProperty("/MareaAnterior/EventoMarAnt/HFEVN");
                            }
                        } else {
                            var mssg2 = this.oBundle.getText("MARANTNOFINEVEVAL");
                            MessageBox.warning(mssg2); 
                        }
                    } else {
                        fechaAnt = mod.getProperty("/MareaAnterior/FFMAR");
                        horaAnt  = mod.getProperty("/MareaAnterior/HFMAR");			
                    }			
                } else {
                    var mssg2 = this.oBundle.getText("NOEXISTDATAMARANT");
                    MessageBox.error(mssg2); 
                }
            }

            nodoEventos[elementAct].FIEVN  = fechaAnt;
            nodoEventos[elementAct].HIEVN = horaAnt;

        },
        obtenerDatoPlantaAnt : function(){
            let mod = this.getOwnerComponent().getModel("DetalleMarea");
            let codEventoTope ="5";
            let nodoEventos = mod.getProperty("/Eventos/Lista");

            for (let i = (Number(this._eventoNuevo) - 1); i > 0; i--) {
                                                
                if (nodoEventos[i].CDTEV == codEventoTope) {
                    this.getView().byId("FechaEnvaseIni").setVisible(true);
                    nodoEventos[this._eventoNuevo].CDPTO = nodoEventos[i].CDPTO;
                    nodoEventos[this._eventoNuevo].DSPTO = nodoEventos[i].DSPTO;
                    nodoEventos[this._eventoNuevo].CDPTA = nodoEventos[i].CDPTA;
                    nodoEventos[this._eventoNuevo].WERKS = nodoEventos[i].WERKS;
                    nodoEventos[this._eventoNuevo].DESCR = nodoEventos[i].DESCR;
                    nodoEventos[this._eventoNuevo].INPRP = nodoEventos[i].INPRP;
                    nodoEventos[this._eventoNuevo].CDEMP = nodoEventos[i].CDEMP;
                    nodoEventos[this._eventoNuevo].DSEMP = nodoEventos[i].DSEMP;
                    
                    break;
                }
            }

        },
        posicionarEventoAnterior : function(codEvento){
            let mod = this.getOwnerComponent().getModel("DetalleMarea");
            let nodoEventos = mod.getProperty("/Eventos/Lista");
            
            for (let i = (nodoEventos.length - 1); i >= 0; i--) {
                                
                if (nodoEventos[i].CDTEV ==  codEvento) {
                    this._elementAct = i;
                    break;
                }
            }
        },
        cargarServiciosCrearEvento: function () {

            let self = this;
            var s1 = TasaBackendService.obtenerCodigoTipoPreservacion(this._embarcacion, this.getCurrentUser());
            var s2 = TasaBackendService.obtenerListaEquipamiento(this._embarcacion, this.getCurrentUser());
            var s3 = TasaBackendService.obtenerListaCoordZonaPesca("0", this.getCurrentUser()); // servicios que no deberian cargarse
            var s4 = TasaBackendService.obtenerListaPescaDeclarada(this._nroMarea, this._nroEvento, this.getCurrentUser());
            var s5 = TasaBackendService.obtenerListaBodegas(this._embarcacion, this.getCurrentUser());
            var s6 = TasaBackendService.obtenerListaPescaBodegas(this._nroMarea, this._nroEvento, this.getCurrentUser());
            var s7 = TasaBackendService.obtenerListaPuntosDescarga(this._codPlanta, this.getCurrentUser());
            var s8 = TasaBackendService.obtenerListaPescaDescargada("0", this.getCurrentUser()); // servicios que no deberian cargarse
            var s10 = TasaBackendService.obtenerListaHorometro(this._FormMarea.WERKS, this._tipoEvento, this._nroMarea, this._nroEvento);
            // var s11 = TasaBackendService.obtenerConfiguracionEvento();
            // var s12 = TasaBackendService.obtenerDominio("1ZONAPESCA");
            // var s13 = TasaBackendService.obtenerDominio("ZESOPE");
            // var s14 = TasaBackendService.obtenerDominio("ZCDMLM");
            // var s15 = TasaBackendService.obtenerDominio("ZCDTDS");
            // var s16 = TasaBackendService.obtenerDominio("ZCDMNP");
            // var s17 = TasaBackendService.obtenerDominio("ZCDMES");
            // var s18 = TasaBackendService.obtenerDominio("ZD_SISFRIO");
            // var s19 = TasaBackendService.obtenerDominio("ESPECIE");
            // var s20 = TasaBackendService.obtenerMareaBiometria(this._embarcacion, this._nroMarea, this.getCurrentUser());

            return Promise.all([s1, s2, s3, s4, s5, s6, s7, s8, s10
                //, s11, s12, s13, s14, s15, s16, s17, s18, s19, s20
            ]).then(values => {
                self._tipoPreservacion = JSON.parse(values[0]).data[0].CDTPR;
                self._listasServicioCargaIni = values;
                return true;
            }).catch(reason => {
                return false;
            })

        },
        serviceNE_obtenerListaCoordZonaPesca: async function () {
            let serv_errorDesc = TasaBackendService.obtenerListaCoordZonaPesca(this._listaEventos[this._elementAct].CDZPC, this.getCurrentUser());
            let that = this;
            await Promise.resolve(serv_errorDesc).then(values => {
                that._listasServicioCargaIni[2] = values;
            }).catch(reason => {

            });

        },
        service_obtenerListaHorometro: async function () {
            let serv_errorDesc = TasaBackendService.obtenerListaHorometro(this._FormMarea.WERKS, this._listaEventos[this._elementAct].CDTEV, this._nroMarea, this._listaEventos[this._elementAct].NREVN);
            let that = this;
            await Promise.resolve(serv_errorDesc).then(values => {
                that._listasServicioCargaIni[8] = values.lista;
            }).catch(reason => {

            });

        },

        service_obtenerListaPescaDecl: async function () {
            let serv_errorDesc = TasaBackendService.obtenerListaPescaDeclarada(this._nroMarea, this._listaEventos[this._elementAct].NREVN, this.getCurrentUser());
            let that = this;
            await Promise.resolve(serv_errorDesc).then(values => {
                that._listasServicioCargaIni[3] = values;
            }).catch(reason => {

            });

        },
        /*-----------------------------------------------------------------------------------------------------------------------*/
        agregarMensajeValid :function(tipoMens,mssg){
            let mod = this.getOwnerComponent().getModel("DetalleMarea");
            let objMessage = {};
            if(tipoMens == "Error"){
                objMessage = {
                    type: 'Error',
                    title: 'Mensaje de Error',
                    activeTitle: false,
                    description: mssg,
                    subtitle: mssg,
                    counter: 1
                };
            }
            else if(tipoMens == "Warning"){
                objMessage = {
                    type: 'Warning',
                    title: 'Mensaje de advertencia',
                    activeTitle: false,
                    description: mssg,
                    subtitle: mssg,
                    counter: 1
                };
            }
            var messageIttems = mod.getProperty("/Utils/MessageItemsEP");
            messageIttems.push(objMessage);
            mod.refresh();

            let oButtonVEP = this.getView().byId("messagePopoverDetalleEve");
            oMessageEP.getBinding("items").attachChange(function(oEvent){
                oMessageEP.navigateBack();
                oButtonVEP.setType(this.buttonTypeFormatter("EP"));
                oButtonVEP.setIcon(this.buttonIconFormatter("EP"));
                oButtonVEP.setText(this.highestSeverityMessages("EP"));
            }.bind(this));

            setTimeout(function(){
                oButtonVEP.setType(this.buttonTypeFormatter("EP"));
                oButtonVEP.setIcon(this.buttonIconFormatter("EP"));
                oButtonVEP.setText(this.highestSeverityMessages("EP"));
                oMessageEP.openBy(oButtonVEP);
            }.bind(this), 100);

        },
        obtenerMensajesCamposValid : function (campo){
            let NmbCampo = "";
            switch (campo) {
                case 'CantPescaDescargada':
                    NmbCampo = "Cantidad de pesca descargada";
                    break;
                case 'CantPescaDeclarada':
                    NmbCampo = "Cantidad de pesca declarada";
                    break;
                case 'CDPDG':
                    NmbCampo = "Punto de descarga";
                    this.byId("pd_puntodesc").setValueState( sap.ui.core.ValueState.Error);
                    break;
                case 'FECCONMOV':
                    NmbCampo = "Fecha de Produccion";
                    this.byId("pd_chi_fechProd").setValueState( sap.ui.core.ValueState.Error);
                    this.byId("pd_chd_fechProd").setValueState( sap.ui.core.ValueState.Error);
                    break;
                case 'Especie':
                    NmbCampo = "Especie";
                    break;
                case 'FIEVN':
                    NmbCampo = "Fecha inicio de evento";
                    this.byId("dtf_fechaIniEnv").setValueState("Error");
                    //this.byId("dtf_fechaIniEnv").setValueStateText("Holaaaaaaaaaaaaaaaaaaaaa");
                    break;
                case 'HIEVN':
                    NmbCampo = "Hora inicio de evento";
                    this.byId("dtf_horaIniEnv").setValueState( sap.ui.core.ValueState.Error);
                    break;
                case 'ESOPE':
                    this.byId("cmb_estaOperacion").setValueState( sap.ui.core.ValueState.Error);
                    NmbCampo = "Estado de operación";
                    break;
                case 'STCMB':
                    NmbCampo = "Stock de combustible";
                    this.byId("i_stockCombustible").setValueState( sap.ui.core.ValueState.Error);
                    break;
                case 'CDZPC':
                    NmbCampo = "Zona de pesca";
                    this.byId("cb_ZonaPesca").setValueState( sap.ui.core.ValueState.Error);
                    break;
                case 'FFEVN':
                    NmbCampo = "Fecha fin de evento";
                    this.byId("dtf_fechaFinEnv").setValueState( sap.ui.core.ValueState.Error);
                    break;
                case 'HFEVN':
                    NmbCampo = "Hora fin de evento";
                    this.byId("dtf_horaFinEnv").setValueState( sap.ui.core.ValueState.Error);
                    break;
                case 'CDPTO':
                    NmbCampo = "Puerto";
                    break;
                case 'CDPTA':
                    NmbCampo = "Planta";
                    break;
                case 'CDEMP':
                    NmbCampo = "Empresa";
                    break;
                case 'FechProduccion':
                    NmbCampo = "Fecha produccion";
                    this.byId("dtf_FechaProduccion").setValueState( sap.ui.core.ValueState.Error);
                    break;
                case 'CDMLM':
                    NmbCampo = "Motivo de limitación";
                    this.byId("cmb_motivoLim").setValueState( sap.ui.core.ValueState.Error);
                    break;
                case 'CDMNP':
                    NmbCampo = "Motivo de no pesca";
                    this.byId("cb_motNoPesca").setValueState( sap.ui.core.ValueState.Error);
                    break;
                default:
                    NmbCampo = campo;
            }
            return NmbCampo;
        },
        resetearValidaciones : function (){
            this.byId("cmb_estaOperacion").setValueState( sap.ui.core.ValueState.None);
            this.byId("i_stockCombustible").setValueState( sap.ui.core.ValueState.None);
            this.byId("ip_sistema_frio").setValueState( sap.ui.core.ValueState.None);
            this.byId("pd_puntodesc").setValueState( sap.ui.core.ValueState.None);
            this.byId("pd_chi_fechProd").setValueState( sap.ui.core.ValueState.None);
            this.byId("pd_chd_fechProd").setValueState( sap.ui.core.ValueState.None);
            this.byId("dtf_fechaIniEnv").setValueState( sap.ui.core.ValueState.None);
            this.byId("dtf_horaIniEnv").setValueState( sap.ui.core.ValueState.None);
            this.byId("cb_ZonaPesca").setValueState( sap.ui.core.ValueState.None);
            this.byId("dtf_fechaFinEnv").setValueState( sap.ui.core.ValueState.None);
            this.byId("dtf_horaFinEnv").setValueState( sap.ui.core.ValueState.None);
            this.byId("dtf_FechaProduccion").setValueState( sap.ui.core.ValueState.None);
            this.byId("cmb_motivoLim").setValueState( sap.ui.core.ValueState.None);
            this.byId("cb_motNoPesca").setValueState( sap.ui.core.ValueState.None);
        },
        cargarValoresFormateados : function (){
            let eveZonaPesca = ["2", "3", "4"];
            let eventoActual = this._listaEventos[this._elementAct];
            if(eventoActual.CDTEV == 3){eventoActual.CNPDC = eventoActual.CantTotalPescDecla ? Number(eventoActual.CantTotalPescDecla) : Number(0);}
            if(eventoActual.CDTEV == 6){eventoActual.CNPDS = eventoActual.ListaPescaDescargada[0].CNPDS ? Number(eventoActual.ListaPescaDescargada[0].CNPDS) : Number(0);}
            eventoActual.HIEVN = Utils.formatHoraBTP(eventoActual.HIEVN);
            eventoActual.HFEVN = eventoActual.HFEVN == "" ? "" : Utils.formatHoraBTP(eventoActual.HFEVN);
            eventoActual.FFEVN = eventoActual.FFEVN == "" ? "" : Utils.formatfechaBTP(eventoActual.FFEVN);
            eventoActual.HIEVN = eventoActual.HIEVN == "" ? "" : Utils.formatHoraBTP(eventoActual.HIEVN);
            eventoActual.FIEVN = eventoActual.FIEVN == "" ? "" : Utils.formatfechaBTP(eventoActual.FIEVN);
            eventoActual.CNPDC = eventoActual.CNPDC ? eventoActual.CNPDC : 0;
            eventoActual.CNPDS = eventoActual.CNPDS ? eventoActual.CNPDS : 0;
            if(eveZonaPesca.includes(eventoActual.CDTEV)){ eventoActual.DSZPC = this.byId("cb_ZonaPesca").getSelectedItem().getText();}
            
            eventoActual.NREVN = Utils.formatoNroEvento(eventoActual.NREVN);
        },
        validacionStock :function (){
            let valorStock = this.byId("i_stockCombustible").getValue();
            if(valorStock.length > 0){
                let v_st = valorStock.split(".");
                let v_entero = v_st[0];
                let v_decimal = v_st[1] ? v_st[1].length : 0;
                if(v_entero.length > 10){
                    this.byId("i_stockCombustible").setValueState( sap.ui.core.ValueState.Error);
                    this.byId("i_stockCombustible").setValueStateText("Introduzca un valor con 10 pociones predecimales como máximo y 3 decimales como máximo");
                    this.validacioncampos = false;

                }else if(v_decimal > 3){
                    this.byId("i_stockCombustible").setValueState( sap.ui.core.ValueState.Error);
                    this.byId("i_stockCombustible").setValueStateText("Introduzca un valor con 10 pociones predecimales como máximo y 3 decimales como máximo");
                    this.validacioncampos = false;
                    
                }else{
                    this.byId("i_stockCombustible").setValueState( sap.ui.core.ValueState.Success);
                    this.validacioncampos = true;

                }
            }

        },   

        validarFechaEnvIni_Det :function(){
            let fechaval =  this._listaEventos[this._elementAct].FIEVN;
            let horaval = Utils.formatHoraBTP(this._listaEventos[this._elementAct].HIEVN);
            let fechaHoraVal = Utils.strDateHourToDate(fechaval,horaval);
            

            if(this._listaEventos[this._elementAct].CDTEV == "3"){
                let valorMinFech =  this._listaEventos[this._elementAct].FICAL;
                let valorMinHor =   Utils.formatHoraBTP(this._listaEventos[this._elementAct].HICAL);
                let valorMaxFech =  this._listaEventos[this._elementAct].FFCAL;
                let valorMaxHor =  Utils.formatHoraBTP(this._listaEventos[this._elementAct].HFCAL);

                let  fechaHoraMax = Utils.strDateHourToDate(valorMaxFech,valorMaxHor);
                let  fechaHoraMin = Utils.strDateHourToDate(valorMinFech,valorMinHor);
                if(fechaHoraVal <= fechaHoraMin || fechaHoraVal >= fechaHoraMax){
                    this.byId("dtf_fechaIniEnv").setValueState( sap.ui.core.ValueState.Error);
                    this.byId("dtf_fechaIniEnv").setValueStateText("La fecha y hora de inicio de envase debe estar entre " + valorMinFech + " " + valorMinHor + " y " + valorMaxFech + " " + valorMaxHor);

                    this.byId("dtf_horaIniEnv").setValueState( sap.ui.core.ValueState.Error);
                    this.byId("dtf_horaIniEnv").setValueStateText("La fecha de inicio de envase debe estar entre " + valorMinFech + " " + valorMinHor + " y " + valorMaxFech + " " + valorMaxHor);
                    this.validacioncampos = false;
                }else{
                    this.byId("dtf_fechaIniEnv").setValueState( sap.ui.core.ValueState.Success);
                    this.byId("dtf_horaIniEnv").setValueState( sap.ui.core.ValueState.Success);
                    this.validacioncampos = true;
                }
                
            }
        },
        validarFechaEnvFin_Det :function(){
            let fechaval =  Utils.formatfechaBTP(this._listaEventos[this._elementAct].FFEVN);
            let horaval = Utils.formatHoraBTP(this._listaEventos[this._elementAct].HFEVN);
            let fechaHoraVal = Utils.strDateHourToDate(fechaval,horaval);
            

            if(this._listaEventos[this._elementAct].CDTEV == "3"){
                let valorMinFech =  this._listaEventos[this._elementAct].FICAL;
                let valorMinHor =   Utils.formatHoraBTP(this._listaEventos[this._elementAct].HICAL);
                let valorMaxFech =  this._listaEventos[this._elementAct].FFCAL;
                let valorMaxHor =  Utils.formatHoraBTP(this._listaEventos[this._elementAct].HFCAL);

                let  fechaHoraMax = Utils.strDateHourToDate(valorMaxFech,valorMaxHor);
                let  fechaHoraMin = Utils.strDateHourToDate(valorMinFech,valorMinHor);
                if(fechaHoraVal <= fechaHoraMin || fechaHoraVal >= fechaHoraMax){
                    this.byId("dtf_fechaFinEnv").setValueState( sap.ui.core.ValueState.Error);
                    this.byId("dtf_fechaFinEnv").setValueStateText("La fecha y hora de inicio de envase debe estar entre " + valorMinFech + " " + valorMinHor + " y " + valorMaxFech + " " + valorMaxHor);

                    this.byId("dtf_horaFinEnv").setValueState( sap.ui.core.ValueState.Error);
                    this.byId("dtf_horaFinEnv").setValueStateText("La fecha de inicio de envase debe estar entre " + valorMinFech + " " + valorMinHor + " y " + valorMaxFech + " " + valorMaxHor);
                    this.validacioncampos = false;
                }else{
                    this.byId("dtf_fechaFinEnv").setValueState( sap.ui.core.ValueState.Success);
                    this.byId("dtf_horaFinEnv").setValueState( sap.ui.core.ValueState.Success);
                    this.validacioncampos = true;
                }
                
            }
        },

        validarFechaCalas : function(){
            let fechaval =  this._listaEventos[this._elementAct].FIEVN;
            let horaval = Utils.formatHoraBTP(this._listaEventos[this._elementAct].HIEVN);
            let fechaHoraVal = Utils.strDateHourToDate(fechaval,horaval);
            

            if(this._listaEventos[this._elementAct].CDTEV == "3"){
                let valorMinFech =  this._listaEventos[this._elementAct].FICAL;
                let valorMinHor =   Utils.formatHoraBTP(this._listaEventos[this._elementAct].HICAL);
                let valorMaxFech =  this._listaEventos[this._elementAct].FFCAL;
                let valorMaxHor =  Utils.formatHoraBTP(this._listaEventos[this._elementAct].HFCAL);

                let  fechaHoraMax = Utils.strDateHourToDate(valorMaxFech,valorMaxHor);
                let  fechaHoraMin = Utils.strDateHourToDate(valorMinFech,valorMinHor);
                if(fechaHoraVal <= fechaHoraMin || fechaHoraVal >= fechaHoraMax){
                    this.byId("dtf_fechaIniEnv").setValueState( sap.ui.core.ValueState.Error);
                    this.byId("dtf_fechaIniEnv").setValueStateText("La fecha y hora de inicio de envase debe estar entre " + valorMinFech + " " + valorMinHor + " y " + valorMaxFech + " " + valorMaxHor);

                    this.byId("dtf_horaIniEnv").setValueState( sap.ui.core.ValueState.Error);
                    this.byId("dtf_horaIniEnv").setValueStateText("La fecha de inicio de envase debe estar entre " + valorMinFech + " " + valorMinHor + " y " + valorMaxFech + " " + valorMaxHor);
                    this.validacioncampos = false;
                }else{
                    this.byId("dtf_fechaIniEnv").setValueState( sap.ui.core.ValueState.Success);
                    this.byId("dtf_horaIniEnv").setValueState( sap.ui.core.ValueState.Success);
                    this.validacioncampos = true;
                }
                
            }


            let fechaval2 =  Utils.formatfechaBTP(this._listaEventos[this._elementAct].FFEVN);
            let horaval2 = Utils.formatHoraBTP(this._listaEventos[this._elementAct].HFEVN);
            let fechaHoraVal2 = Utils.strDateHourToDate(fechaval2,horaval2);
            

            if(this._listaEventos[this._elementAct].CDTEV == "3"){
                let valorMinFech =  this._listaEventos[this._elementAct].FICAL;
                let valorMinHor =   Utils.formatHoraBTP(this._listaEventos[this._elementAct].HICAL);
                let valorMaxFech =  this._listaEventos[this._elementAct].FFCAL;
                let valorMaxHor =  Utils.formatHoraBTP(this._listaEventos[this._elementAct].HFCAL);

                let  fechaHoraMax = Utils.strDateHourToDate(valorMaxFech,valorMaxHor);
                let  fechaHoraMin = Utils.strDateHourToDate(valorMinFech,valorMinHor);

                if(this.validacioncampos == false ){
                    if(fechaHoraVal2 <= fechaHoraMin || fechaHoraVal2 >= fechaHoraMax){
                        this.byId("dtf_fechaFinEnv").setValueState( sap.ui.core.ValueState.Error);
                        this.byId("dtf_fechaFinEnv").setValueStateText("La fecha y hora de inicio de envase debe estar entre " + valorMinFech + " " + valorMinHor + " y " + valorMaxFech + " " + valorMaxHor);
    
                        this.byId("dtf_horaFinEnv").setValueState( sap.ui.core.ValueState.Error);
                        this.byId("dtf_horaFinEnv").setValueStateText("La fecha de inicio de envase debe estar entre " + valorMinFech + " " + valorMinHor + " y " + valorMaxFech + " " + valorMaxHor);
                    }else{
                        this.byId("dtf_fechaFinEnv").setValueState( sap.ui.core.ValueState.Success);
                        this.byId("dtf_horaFinEnv").setValueState( sap.ui.core.ValueState.Success);
                    }
                }else{
                    if(fechaHoraVal2 <= fechaHoraMin || fechaHoraVal2 >= fechaHoraMax){
                        this.byId("dtf_fechaFinEnv").setValueState( sap.ui.core.ValueState.Error);
                        this.byId("dtf_fechaFinEnv").setValueStateText("La fecha y hora de inicio de envase debe estar entre " + valorMinFech + " " + valorMinHor + " y " + valorMaxFech + " " + valorMaxHor);
    
                        this.byId("dtf_horaFinEnv").setValueState( sap.ui.core.ValueState.Error);
                        this.byId("dtf_horaFinEnv").setValueStateText("La fecha de inicio de envase debe estar entre " + valorMinFech + " " + valorMinHor + " y " + valorMaxFech + " " + valorMaxHor);
                        this.validacioncampos = false;
                    }else{
                        this.byId("dtf_fechaFinEnv").setValueState( sap.ui.core.ValueState.Success);
                        this.byId("dtf_horaFinEnv").setValueState( sap.ui.core.ValueState.Success);
                        this.validacioncampos = true;
                    }
                }
                
                
            }


        },

        verificarCierreMarea: function () {
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var eventos = modelo.getProperty("/Eventos/Lista");
            var estadoMarea = modelo.getProperty("/Form/ESMAR");
            var ultimoEvento = eventos[eventos.length - 1];
            var cantTotalDeclMarea = this.obtenerCantTotalPescaDecla(0, this);
            var cantTotalDeclDescMarea = this.obtenerCantTotalPescaDeclDesc(0, this);
            var motivoMarea = modelo.getProperty("/Form/CDMMA");
            var motivoMarPesca = ["1", "2"];
            var motivoCalaSDes = ["4", "5", "6"];
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
                        MessageBox.warning(mssg);
                        var texto = mssg + " " + this.oBundle.getText("CONFIRMSAVEMESSAGE");
                        modelo.setProperty("/Utils/TextoConfirmacion", texto);
                    }
                } else if (motivoCalaSDes.includes(motivoMarea) && tipoEvento == "5") {
                    verEstCierre = true;
                }
                if (verEstCierre) {
                    modelo.setProperty("/Form/ESMAR", "C");
                    modelo.setProperty("/Utils/VisibleEstCierre", true);
                    modelo.refresh();
                }
                return verEstCierre;
            }
            return false;
        },

        verificarCambiosDescarga_eve : async function(indicador, v_this){
            let modelo = v_this.getOwnerComponent().getModel("DetalleMarea");
            let eventos = modelo.getProperty("/Eventos/Lista");

            //await this.prepararRevisionEvento(true);
            this.obtenerPescaDescargada(v_this)

            let pescaDescargada = eventos[indicador].ListaPescaDescargada;
            let cantDescarga = Number(pescaDescargada[0].BckCantPescaModificada);
            let saldo = Number(pescaDescargada[0].SALDO); 
            let motMarea = v_this._motivoMarea;
            let indPropPlanta = v_this._indicadorPropXPlanta;
            let indPropiedad = v_this._indicadorProp;
            let nroDocCompras = pescaDescargada[0].NROPEDI;
            let nroDocMatMB1B = pescaDescargada[0].DOC_MB1B;
            let nroDocMatMIGO = pescaDescargada[0].DOC_MIGO;
            let nroDocMatMFBF = pescaDescargada[0].DOC_MFBF;
            let exiDocumentos = (indPropiedad == "T" && nroDocCompras != "" && nroDocMatMIGO != "") 
                            || (indPropiedad == "P" && nroDocMatMB1B != "" && nroDocMatMFBF != "");
            
            if (motMarea == "1" || (motMarea == "2" && indPropPlanta != "P") || (motMarea == "2" && indPropPlanta == "P" 
                    && (!exiDocumentos || (exiDocumentos && saldo != null && cantDescarga != null && saldo == cantDescarga)))) {
                    
                return false;
            }
            
            return true;
            
        },

        inhabilitarInfoCoord :function (){
            if(this._tipoEvento  == "3"){
                this.getView().byId("lat_1").setVisible(true);
                this.getView().byId("lat_2").setVisible(true);
                this.getView().byId("long_1").setVisible(true);
                this.getView().byId("long_2").setVisible(true);
            }else{
                this.getView().byId("lat_1").setVisible(false);
                this.getView().byId("lat_2").setVisible(false);
                this.getView().byId("long_1").setVisible(false);
                this.getView().byId("long_2").setVisible(false);
            }
        }

    });
});