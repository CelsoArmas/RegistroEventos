sap.ui.define([
    "sap/ui/base/ManagedObject",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/integration/library",
    "../Service/TasaBackendService",
    "./Horometro",
    "./PescaDescargada",
    "./PescaDeclarada",
    "./Siniestro",
    "../model/textValidaciones",
    "sap/m/MessageBox",
    "./Utils",
    'sap/ui/core/BusyIndicator',
], function (
    ManagedObject,
    JSONModel,
    MessageToast,
    integrationLibrary,
    TasaBackendService,
    Horometro,
    PescaDescargada,
    PescaDeclarada,
    Siniestro,
    textValidaciones,
    MessageBox,
    Utils,
    BusyIndicator
) {
    "use strict";

    return ManagedObject.extend("com.tasa.registroeventospescav2.controller.General", {

        constructor: function (oView, sFragName, o_this) {

            this._oView = oView;
            var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.session);
            let flag = oStore.get("flagFragment");
            if (flag) {
                this._oControl = sap.ui.xmlfragment(oView.getId(), "com.tasa.registroeventospescav2.fragments." + sFragName, this);
            }
            this._bInit = false;
            this.ctr = o_this;
            //this.previousTab = "General";
            this.nextTab = "";
            console.log(textValidaciones.eventAttTabGeneral);

        },
        onButtonPress3: function (o_event) {
            console.log(o_event);
        },

        getcontrol: function () {
            return this._oControl;
        },

        validateFields: function (attributeName, verMensajes) {
            let mod = this.ctr.getOwnerComponent().getModel("DetalleMarea");
            this.oBundle = this.ctr.getOwnerComponent().getModel("i18n").getResourceBundle();
            var bOk = true;
            var value = null;
            var messages = [];
            for (var key in attributeName) {
                if (attributeName.hasOwnProperty(key)) {
                    var value = attributeName[key];
                    let ListaEventos = mod.getProperty("/Eventos/Lista");
                    let EventoSel = ListaEventos[this.ctr._elementAct];
                    let ValorElement = EventoSel[value.id];

                    if (ValorElement != null && ValorElement == "") {

                        bOk = false;
                        if (verMensajes) {
                            let nomCampo = this.ctr.obtenerMensajesCamposValid(value.id);
                            var message = this.oBundle.getText("CAMPONULL", [nomCampo]);
                            this.ctr.agregarMensajeValid("Error", message);
                            //MessageBox.error(message);
                            //messages.push(message);
                        }
                        else {
                            break;
                        }

                    }
                }
            }
            return bOk;
        },

        messagePopover: function () {
            var that = this;
            this.oMP = new MessagePopover({
                activeTitlePress: function (oEvent) {
                    var oItem = oEvent.getParameter("item"),
                        oPage = that.getView().byId("messageHandlingPage"),
                        oMessage = oItem.getBindingContext("message").getObject(),
                        oControl = Element.registry.get(oMessage.getControlId());

                    if (oControl) {
                        oPage.scrollToElement(oControl.getDomRef(), 200, [0, -100]);
                        setTimeout(function () {
                            oControl.focus();
                        }, 300);
                    }
                },
                items: {
                    path: "message>/",
                    template: new MessageItem(
                        {
                            title: "{message>message}",
                            subtitle: "{message>additionalText}",
                            groupName: { parts: [{ path: 'message>controlIds' }], formatter: this.getGroupName },
                            activeTitle: { parts: [{ path: 'message>controlIds' }], formatter: this.isPositionable },
                            type: "{message>type}",
                            description: "{message>message}"
                        })
                },
                groupItems: true
            });

            this.getView().byId("messagePopoverBtn").addDependent(this.oMP);
        },

        validarCamposGeneral: async function (bool) {
            var bOk = false;
            var eventoActual = this.ctr._listaEventos[this.ctr._elementAct]; //nodo evento actual
            let mod = this.ctr.getOwnerComponent().getModel("DetalleMarea");
            //var detalleMarea = {};//modelo detalle marea
            var Utils = mod.getProperty("/Utils");//modelo Utils
            var visible = this.ctr.modeloVisible;//modelo visible
            //var eventAttTabGeneral = {};//modelo con los atributos de los tab por tipo de evento
            var motivoMarea = this.ctr._motivoMarea;
            var tipoEvento = this.ctr._tipoEvento;
            var indPropiedad = this.ctr._indicadorProp;
            var indPropPlanta = this.ctr._listaEventos[this.ctr._elementAct].INPRP;
            var eveCampGeneVal = ["1", "5", "6", "H", "T"]; //Tipos de evento con campos generales distintos a validar 
            if (indPropiedad == "P") {
                if (Utils.OpSistFrio && parseInt(tipoEvento) < 6) {
                    if (eventoActual.ESTSF == "") {
                        var mssg = this.ctr.oBundle.getText("MISSINGSISTFRIO");
                        this.ctr.byId("ip_sistema_frio").setValueState( sap.ui.core.ValueState.Error);
                        this.ctr.agregarMensajeValid("Error", mssg);
                        bOk = false;
                        return bOk;
                    }
                }
            }
            if (!eveCampGeneVal.includes(tipoEvento)) {
                bOk = this.validateFields(textValidaciones.eventAttTabGeneral[Number(tipoEvento)], bool);
                if (bOk && tipoEvento == "3") {
                    this.ctr.modeloVisible.VisibleDescarga = true;
                    bOk = await this.validarLatitudLongitud();
                    console.log(bOk);
                }
            } else {
                var eventosValidar = textValidaciones.eventAttTabGeneral[Number(tipoEvento)];
                if (tipoEvento == "1") {
                    this.ctr.modeloVisible.VisibleDescarga = true;
                    if (this.ctr.modeloVisible.MotiLimitacion) {
                        eventosValidar = textValidaciones.eventAttTabGeneral[10];
                    }
                    if (indPropiedad == "T") {
                        eventosValidar = textValidaciones.eventAttTabGeneral[14];
                    }
                } else if (tipoEvento == "5") {
                    visible.VisibleDescarga = true;
                    var motLimitacion = this.ctr.modeloVisible.MotiLimitacion;
                    var motNoPesca = this.ctr.modeloVisible.MotiNoPesca;
                    if (indPropiedad == "P") {
                        if (motLimitacion && motNoPesca) {
                            eventosValidar = textValidaciones.eventAttTabGeneral[13];
                        } else if (motLimitacion) {
                            eventosValidar = textValidaciones.eventAttTabGeneral[11];
                        } else if (motNoPesca) {
                            eventosValidar = textValidaciones.eventAttTabGeneral[12];
                        }
                    } else {
                        eventosValidar = textValidaciones.eventAttTabGeneral[15];
                    }
                } else if (tipoEvento == "6") {
                    this.ctr.modeloVisible.VisibleDescarga = false;
                    this.ctr.modeloVisible.FechFin = false;
                    if (indPropPlanta == "P") {
                        if (indPropiedad == "P") {
                            if (motivoMarea == "1") {
                                eventosValidar = textValidaciones.eventAttTabGeneral[17];
                            } else if (motivoMarea == "2") {
                                eventosValidar = textValidaciones.eventAttTabGeneral[16];
                            }
                        } else {
                            if (motivoMarea == "1") {
                                eventosValidar = textValidaciones.eventAttTabGeneral[21];
                            } else if (motivoMarea == "2") {
                                eventosValidar = textValidaciones.eventAttTabGeneral[18];
                            }
                        }
                    } else if (indPropPlanta == "T") {
                        if (indPropiedad == "P") {
                            eventosValidar = textValidaciones.eventAttTabGeneral[6];
                        }
                    }
                } else if (tipoEvento == "H") {
                    eventosValidar = textValidaciones.eventAttTabGeneral[20];
                } else if (tipoEvento == "T") {
                    eventosValidar = textValidaciones.eventAttTabGeneral[20];
                }

                bOk = this.validateFields(eventosValidar, bool);
            }

            if (bOk && tipoEvento == "1" && indPropiedad == "P") {
                bOk = this.ctr.validarEsperaEventoAnterior();
                this.ctr.modeloVisible.VisibleDescarga = true;
            }

            if (bOk && tipoEvento == "7") {
                bOk = this.ctr.validarDatosEspera();
                this.ctr.modeloVisible.VisibleDescarga = true;
            }

            if (bOk) {
                eventoActual.FechHoraIni = eventoActual.FIEVN + " " + eventoActual.HIEVN;
                if (this.ctr.modeloVisible.FechFin) {
                    eventoActual.FechHoraFin = eventoActual.FFEVN + " " + eventoActual.HFEVN;
                }
            }
            this.ctr.modeloVisibleModel.refresh();

            return bOk;
        },

        validarLatitudLongitud: async function () {
            var bOk = true;
            this.oBundle = this.ctr.getOwnerComponent().getModel("i18n").getResourceBundle();
            var detalleMarea = this.ctr._FormMarea;//cargar modelo detalle marea
            var eventoActual = this.ctr._listaEventos[this.ctr._elementAct];//modelo de evento
            var latitudD = eventoActual.LatitudD;
            var latitudM = eventoActual.LatitudM;
            var longitudD = eventoActual.LongitudD;
            var longitudM = eventoActual.LongitudM;
            var indiPropiedad = detalleMarea.INPRP;
            if (latitudM < 0 || latitudM > 59 || longitudM < 0 || longitudM > 59) {
                bOk = false;
                var message = this.oBundle.getText("MINGEOGRAFINV");
                this.ctr.agregarMensajeValid("Error", message);
                return false;
                //MessageBox.error(message);
            } else {
                var latiMin = eventoActual.ZPLatiIni;
                var latiMax = eventoActual.ZPLatiFin;
                var longMin = eventoActual.ZPLongIni;
                var longMax = eventoActual.ZPLongFin;
                var latitud = Number(latitudD) * 100 + Number(latitudM);
                var longitud = Number(longitudD) * 100 + Number(longitudM);
                if (indiPropiedad == "P") {
                    if ((latitud < latiMin || latitud > latiMax) || (longitud < longMin || longitud > longMax)) {
                        var message = this.oBundle.getText("COORDNOZONAPESCA");
                        this.ctr.agregarMensajeValid("Error", message);
                        return false;
                        //MessageBox.error(message);
                    }
                }

                var sLatitud = this.formatNumber(Number(latitud), "00000");
                var sLongitud = this.formatNumber(Number(longitud), "00000");
                var sBckLatitud = eventoActual.BackLatitud;
                var sBckLongitud = eventoActual.BackLongitud;
                eventoActual.Latitud = sLatitud;
                eventoActual.Longitud = sLongitud;
                if ((sBckLatitud == "" || sLatitud != sBckLatitud) || (sBckLongitud == "" || sLongitud != sBckLongitud)) {
                    bOk = await this.validarMillasLitoral();
                    eventoActual.ObteEspePermitidas = true;
                }
                eventoActual.BackLatitud = sLatitud;
                eventoActual.BackLongitud = sLongitud;
            }
            return bOk;
        },

        formatNumber: function (numero, formato) {
            var strNumber = numero.toString();// "123"
            var diffLength = formato.length - strNumber.length;
            var newValue = "";
            if (diffLength > 0) {
                var ceros = "";
                for (let index = 0; index < diffLength; index++) {
                    ceros += "0";
                }
                newValue = ceros.concat(strNumber);
            } else {
                newValue = numero;
            }
            return newValue;
        },

        validarMillasLitoral: async function () {
            var bOk = true;
            var that = this;
            var eventoActual = this.ctr._listaEventos[this.ctr._elementAct];//modelo de evento
            var latiCalaD = eventoActual.LatitudD;
            var latiCalaM = eventoActual.LatitudM;
            var latiCala = latiCalaD * 100 + latiCalaM;
            var longCalaD = eventoActual.LongitudD;
            var longCalaM = eventoActual.LongitudM;
            var longCala = longCalaD * 100 + longCalaM;
            await TasaBackendService.obtenerMillasLitoral(latiCalaD, latiCalaM).then(function (response) {
                //no hay registro en la tabla de SAP S/4 QAS
                let rep = response.data;
                if (rep.length > 0) {
                    let latiPtoCostaD = rep[0].LATGR;
                    let latiPtoCostaM = rep[0].LATMI;
                    let longPtoCostaD = rep[0].LONGR;
                    let longPtoCostaM = rep[0].LONMI;
                    let difPtos = Utils.difPtosLongOPtosLati(Number(longCalaD), Number(longCalaM * 1.0), Number(longPtoCostaD), Number(longPtoCostaM), 3);
                    if (Utils.compPtosLongOPtosLati(difPtos) > 0) {
                        let distCosta = Utils.distPtosLongitud(Number(difPtos), Number(latiCalaD), Number(latiCalaM * 1.0), "MN");

                        eventoActual.MillaCosta = distCosta;
                        eventoActual.ObseAdicional = "";
                        that._oView.byId("fe_observacioAdic").setVisible(false);
                        weventoActual.ValiCoordCala = true;

                        if (distCosta <= 5) {
                            eventoActual.ObseAdicional = that.ctr.oBundle.getText("OBSADICPTOEN5MILLAS");
                            that._oView.byId("fe_observacioAdic").setVisible(true);
                            let mssg2 = that.ctr.oBundle.getText("PTOCALAEN5MILLAS");
                            that.ctr.agregarMensajeValid("Error", mssg2);
                            //MessageBox.error(mssg2);
                        }
                    } else {
                        let mssg1 = that.ctr.oBundle.getText("COORDNOPTOMAR");
                        that.ctr.agregarMensajeValid("Error", mssg1);
                        //MessageBox.error(mssg1);
                        bOk = false;
                    }

                } else {
                    eventoActual.ValiCoordCala = false;
                    let mssg = that.ctr.oBundle.getText("NODATACOORDCOSTA");
                    that.ctr.agregarMensajeValid("Warning", mssg);
                    //MessageBox.error(mssg);
                }

            }).catch(function (error) {
                console.log("ERROR: General.validarMillasLitoral - ", error);
                eventoActual.ValiCoordCala = false;
            });
            this._oView.getModel("eventos").updateBindings(true);
            return bOk;
        },

        onActionSelectTab: async function (tab_seleccionado, event) {
            if(this.ctr.validacioncampos == true){
                let params = event.mParameters;
                let mod = this.ctr.getOwnerComponent().getModel("DetalleMarea");
                mod.setProperty("/Utils/MessageItemsEP", []);
                this.ctr.resetearValidaciones();
                BusyIndicator.show(0);
                this.nextTab = tab_seleccionado;
                if (this.previousTab == undefined) {
                    this.previousTab = "General";
                }
                var visible = this.ctr.modeloVisible;//modelo visible
                var eventoActual = this.ctr._listaEventos[this.ctr._elementAct]; //nodo evento actual
                var motivoEnCalend = ["1", "2", "8"]; // Motivos de marea con registros en calendario
                var detalleMarea = this.ctr._FormMarea;//modelo detalle marea
                if (!this.ctr._soloLectura) {
                    visible.LinkRemover = false;
                    visible.LinkDescartar = false;
                    var tipoEvento = eventoActual.CDTEV;
                    var motivoMarea = detalleMarea.CDMMA;
                    var fechEvento = eventoActual.FIEVN == null ? null : eventoActual.FIEVN;
                    if (this.previousTab == "General") {
                        //var validarStockCombustible = await this.validarStockCombustible();
                        let val = await this.validarCamposGeneral(true);
                        if (!val) {
                            this.nextTab = this.previousTab;
                        } else if (tipoEvento == "6" && motivoEnCalend.includes(motivoMarea)) {
                            visible.visibleDescarga = false;
                            visible.FechFin = false;
                            //var verificarTemporada = this.verificarTemporada(motivoMarea, fechEvento);
                            if (fechEvento && !(this.verificarTemporada(motivoMarea, fechEvento))) {
                                this.nextTab = this.previousTab;
                            }
                        } else if (tipoEvento == "5" && visible.TabHorometro) {
                            let validarStockCombustible = await this.validarStockCombustible();
                            if(!validarStockCombustible){
                                visible.visibleDescarga = true;
                                this.nextTab = this.previousTab;
                            }
                        }
                    }

                    if (tipoEvento == "3" && this.nextTab !== this.previousTab) {
                        if (motivoMarea == "1") {
                            var bOk = true;
                            this.ctr.Dat_Horometro.calcularCantTotalBodegaEve();
                            var validarBodegas = this.ctr.Dat_PescaDescargada.validarBodegas(true);
                            if(!validarBodegas &&  this.previousTab == "Distribucion"){
                                this.nextTab = this.previousTab;
                            }else{
                                if (bOk && this.previousTab == "General" && this.nextTab == "Pesca declarada" && !validarBodegas) {
                                    this.nextTab = "Distribucion";
                                }
    
                                if (this.previousTab == "Distribucion" && this.nextTab == "Pesca declarada" && !validarBodegas) {
                                    this.nextTab = this.previousTab;
                                }
    
                                if (bOk && this.previousTab == "Distribucion" && this.nextTab != "Biometria" && !validarBodegas) {
                                    this.nextTab = this.previousTab;
                                }
                                this.ctr.Dat_PescaDeclarada.calcularPescaDeclarada();
                            }
                            
                        } else if (motivoMarea == "2") {
                            this.ctr.Dat_PescaDeclarada.calcularCantTotalPescDeclEve();
                        }

                        //var valCantTotPesca = this.ctr.Dat_PescaDeclarada.validarCantidadTotalPesca();
                        if (this.previousTab != "General") {
                            if(this.ctr._indicadorProp == "T" && (await !this.ctr.Dat_PescaDeclarada.validarCantidadTotalPesca())){
                                this.nextTab = "Pesca declarada";
                            }else if((await !this.ctr.Dat_PescaDeclarada.validarCantidadTotalPesca())){
                                this.nextTab = this.previousTab;
                            }
                        }

                        if ((this.nextTab == "Pesca declarada" && eventoActual.ObteEspePermitidas) ||
                            (this.nextTab == "Biometria" && eventoActual.ObteEspePermitidas)) {
                            await this.obtenerTemporadas(motivoMarea, eventoActual.FIEVN);
                            await this.obtenerTemporadas("8", eventoActual.FIEVN);
                            await this.consultarPermisoPesca(this.ctr._embarcacion, motivoMarea);
                            this.obtenerEspeciesPermitidas();//obtenerEspeciesPermitidas - falta metodo
                        }
                    }

                    if (tipoEvento == "6" && this.nextTab == "Horómetro" && eventoActual.NroDescarga) {
                        visible.visibleDescarga = false;
                        visible.fechFin = false;
                        this.nextTab = "Pesca descargada";
                    }

                    if (this.previousTab == "Horómetro" && (!(this.ctr.Dat_Horometro.validarLecturaHorometros()) || !(await this.ctr.Dat_Horometro.validarHorometrosEvento()))) {
                        this.nextTab = this.previousTab;
                    }

                    if (this.nextTab == "Pesca descargada") {
                        this.prepararInputsDescargas();
                    }

                    if (this.previousTab == "Pesca descargada" && !this.ctr.Dat_PescaDescargada.validarPescaDescargada()) {
                        this.nextTab = this.previousTab;
                    }

                    if (this.previousTab == "Siniestro" && !this.ctr.Dat_Siniestro.validarSiniestros()) {
                        this.nextTab = this.previousTab;
                    }

                }
                this.previousTab = this.nextTab;
                this.ctr.modeloVisibleModel.refresh();

                let tabRedirect = this.buscarCodTab(textValidaciones.KeyTabs, this.nextTab)
                let id_val = params.id;
                console.log("id_log : " + id_val + " reirect : " + tabRedirect);
                let o_iconTabBar = sap.ui.getCore().byId(id_val);
                o_iconTabBar.setSelectedKey(tabRedirect);
                BusyIndicator.hide();
                //refrescar modelos
            }else{
                let tabRedirect = event.getParameter("previousKey");
                let id_val = event.getParameter("id");
                console.log("id_log : " + id_val + " reirect : " + tabRedirect);
                let o_iconTabBar = sap.ui.getCore().byId(id_val);
                o_iconTabBar.setSelectedKey(tabRedirect);
            }
        },

        prepararInputsDescargas: function () {
            let mod = this.ctr.getOwnerComponent().getModel("DetalleMarea");
            var indActual = this.ctr._elementAct;//indicie actual de la lista de eventos
            var DetalleMarea = this.ctr._FormMarea;// modelo detalle marea
            var ListaEventos = this.ctr._listaEventos; // mapear modelo de lista de eventos
            var eventosElement = ListaEventos[indActual - 1];
            var fechaIni = eventosElement.FIEVN;
            var horaIni = eventosElement.HIEVN;
            var eveVisFechaFin = ["3", "6", "7"];
            var motMarea = DetalleMarea.CDMMA;
            if (eveVisFechaFin.includes(eventosElement.CDTEV)) {
                fechaIni = eventosElement.FIEVN;
                horaIni = eventosElement.HIEVN;
            }
            if (motMarea == "1") {
                mod.setProperty("/InputsDescargas/Planta", eventosElement.CDPTA);
                mod.setProperty("/InputsDescargas/Matricula", DetalleMarea.MREMB);
                mod.setProperty("/InputsDescargas/CentPlanta", "FP12");
                mod.setProperty("/InputsDescargas/DescPlanta", "TASA CHD");
                mod.setProperty("/InputsDescargas/Embarcacion", DetalleMarea.CDEMB);
                mod.setProperty("/InputsDescargas/DescEmbarcacion", DetalleMarea.NMEMB);
                mod.setProperty("/InputsDescargas/FechInicio", fechaIni);
                mod.setProperty("/InputsDescargas/HoraInicio", horaIni);
                mod.setProperty("/InputsDescargas/Estado", "N");
                mod.setProperty("/InputsDescargas/TipoPesca", "D");
            } else if (motMarea == "2") {
                mod.setProperty("/InputsDescargas/Planta", eventosElement.CDPTA);
                mod.setProperty("/InputsDescargas/Matricula", DetalleMarea.MREMB);
                mod.setProperty("/InputsDescargas/CentPlanta", eventosElement.WERKS);
                mod.setProperty("/InputsDescargas/DescPlanta", eventosElement.DESCR);
                mod.setProperty("/InputsDescargas/Embarcacion", DetalleMarea.CDEMB);
                mod.setProperty("/InputsDescargas/DescEmbarcacion", DetalleMarea.NMEMB);
                mod.setProperty("/InputsDescargas/FechInicio", fechaIni);
                mod.setProperty("/InputsDescargas/HoraInicio", horaIni);
                mod.setProperty("/InputsDescargas/Estado", "N");
                mod.setProperty("/InputsDescargas/TipoPesca", "I");
            }
            this._oView.getModel("eventos").updateBindings(true);
            //refresh model
        },

        verificarTemporada: async function (motivo, fecha) {
            //desarrollar servicio verificar temporada
            let bok = false;
            let that = this;
            var codTemp = "";
            if (motivo == "1") {
                codTemp = "D";
            } else {
                if (motivo == "2") {
                    codTemp = "I";
                } else {
                    codTemp = "V";
                }
            }
            if(fecha != undefined){
                let fecha_v  = fecha;
                if(fecha_v.length == 8 || fecha_v.length == 10 ){
                    fecha_v = Utils.strDateToSapDate(fecha);
                }
                await TasaBackendService.verificarTemporada(codTemp, fecha_v).then(function (response) {
                    //ob
                    console.log(response.data);
                    if (response.data != null && response.data.length > 0) {
                        bok = true;
                    } else {
                        let mssg = that.ctr.oBundle.getText("NOTEMPCH" + codTemp);
                        MessageBox.error(mssg);
                        bok = false;
                    }
                }).catch(function (error) {
                    console.log("ERROR: General.verificarTemporada - ", error);
                });
            }   

            return bok;

        },

        consultarPermisoPesca: async function (cdemb, motivo) {
            var detalleMarea = this.ctr._FormMarea;//modelo detalle marea
            var codTemp = "";
            if (motivo == "1") {
                codTemp = "D";
            } else {
                if (motivo == "2") {
                    codTemp = "I";
                } else {
                    codTemp = "V";
                }
            }

            await TasaBackendService.obtenerEspeciesPermitidas(cdemb, codTemp).then(function (response) {
                //obtener repsonse
                detalleMarea.EspPermitida = JSON.parse(response).data;
            }).catch(function (error) {
                console.log("ERROR: General.consultarPermisoPesca - ", error);
            });
        },

        obtenerTemporadas: async function (motivo, fecha) {
            let mod = this.ctr.getOwnerComponent().getModel("DetalleMarea");
            var calendarioPesca = [];
            var codTemp = "";
            if (motivo == "1") {
                codTemp = "D";
            } else {
                if (motivo == "2") {
                    codTemp = "I";
                } else {
                    codTemp = "V";
                }
            }
            if(fecha.length == 10){
                fecha = Utils.strDateToSapDate(fecha);
            }

            await TasaBackendService.obtenerTemporadas(codTemp, fecha).then(function (response) {//14.12.2021
                //obtener repsonse
                var data = response.data;
                for (let index = 0; index < data.length; index++) {
                    const element = data[index];
                    var obj = {
                        CDTPC: codTemp,
                        CDSPC: element.CDSPC,
                        DSSPC: element.DSSPC,
                        LTINI: element.LTINI,
                        LNINI: element.LNINI,
                        LTFIN: element.LTFIN,
                        LGFIN: element.LGFIN,
                        MILLA: element.MILLA
                    };//crear objeto calendario
                    calendarioPesca.push(obj);
                };
                //setear variable global calendarioPescaCHD calendarioPescaCHI calendarioPescaVED
            }).catch(function (error) {
                console.log("ERROR: General.obtenerTemporadas - ", error);
            });

            if (motivo == "1") {
                this.ctr.calendarioPescaCHD = calendarioPesca;
                mod.setProperty("/calendarioPescaCHD", calendarioPesca);
            } else if (motivo == "2") {
                this.ctr.calendarioPescaCHI = calendarioPesca;
                mod.setProperty("/calendarioPescaCHI", calendarioPesca);
            } else {
                this.ctr.calendarioPescaVED = calendarioPesca;
                mod.setProperty("/calendarioPescaVED", calendarioPesca);
            }

        },

        validarStockCombustible: async function () {
            //llamar evento valida stock combustible
            let mod = this.ctr.getOwnerComponent().getModel("DetalleMarea");
            var eventoActual = this.ctr._listaEventos[this.ctr._elementAct];//evento actual
            var eventoCompar = null;//evento a comparar
            var indActual = this.ctr._elementAct;
            var indCompar = -1;
            for (let index = indActual - 1; index >= 0; index--) {
                eventoCompar = this.ctr._listaEventos[index];
                if (eventoCompar.CDTEV == "1") {
                    indCompar = index;
                    this.ctr._elementAct = indCompar;
                    await this.ctr.obtenerDetalleEvento();
                    this.ctr._elementAct = indActual;
                    break;
                }
            }

            if (indCompar > -1) {
                var calEveActual = Utils.strDateHourToDate(eventoActual.FIEVN, eventoActual.HIEVN);
                var calEveCompar = Utils.strDateHourToDate(eventoCompar.FIEVN, eventoCompar.HIEVN);
                var difHorasLong = calEveActual.getTime() - calEveCompar.getTime();
                var difHoras = difHorasLong / (1000 * 60 * 60);
                var calActual = new Date();
                var fechaActual = Utils.strDateToSapDate(Utils.dateToStrDate(calActual));
                var embarcacion = mod.getProperty("/Form/CDEMB");
                var motMarea = mod.getProperty("/Form/CDMMA");
                var obtenerconsTeorico = await TasaBackendService.obtenerconsTeorico(embarcacion, motMarea, eventoActual.CDPTO, fechaActual);
                if (obtenerconsTeorico.length > 0) {
                    var consTeorComb = obtenerconsTeorico[0].CSTEO * difHoras;
                    var galComp = consTeorComb / mod.getProperty("/Constantes/PorcCalRangComb");
                    if (consTeorComb > 0) {
                        var stockCombActual = 0;
                        var stockCombCompar = 0;
                        var stockCombTeor = stockCombCompar - consTeorComb;
                        var stockCombMin = stockCombTeor - galComp;
                        var stockCombMax = stockCombTeor + galComp;

                        stockCombMin = stockCombMin > 0 ? stockCombMin : 0;
                        stockCombMax = stockCombMax > 0 ? stockCombMax : 0;

                        if (stockCombActual > stockCombMax || stockCombActual < stockCombMin) {
                            var message = this.oBundle.getText("MSSNSINRATIO");
                            this.ctr.agregarMensajeValid("Warning", message);
                            return false;
                        }
                    }
                } else {
                    var message = this.oBundle.getText("MSSNSINRATIO");
                    this.ctr.agregarMensajeValid("Warning", message);
                    return true;//deberia devovler false
                }

            }
            return true;
        },

        validarIncidental: function () {
            var bOk = true;
            var nodeInciden = this.ctr._listaEventos[this.ctr._elementAct].ListaIncidental; //modelo incidental
            var ListaBiomet = this.ctr._listaEventos[this.ctr._elementAct].ListaBiometria;//modelo lista biometria
            if (nodeInciden.length > 0) {
                if (ListaBiomet.length > 0) {
                    for (let index = 0; index < ListaBiomet.length; index++) {
                        const element = ListaBiomet[index];
                        for (let index1 = 0; index1 < nodeInciden.length; index1++) {
                            const element1 = nodeInciden[index1];
                            if (element.CodEspecie == element1.Cdspc) {
                                bOk = false;
                                break;
                            }
                        }
                    }
                } else {
                    bOk = false;
                    var mssg = this.ctr.oBundle.getText("NOREGBIOMET");
                    MessageBox.error(mssg);
                }
            }

            if (!bOk) {
                var mssg = this.ctr.oBundle.getText("VALINCIDENTAL");
                MessageBox.error(mssg);
            }
            return bOk;
        },
        map_onActionVerMotiLimitacion: function (event) {
            //this.ctr.prueba01 = "Hola 0222";
            //this._oView.getModel("eventos").updateBindings(true);
            var h = Horometro;
            this.ctr.Dat_Horometro.onActionVerMotiLimitacion();
        },

        obtenerEspeciesPermitidas: function () {
            var eventoActual = this.ctr._listaEventos[this.ctr._elementAct]; //nodo evento actual
            var DetalleMarea = this.ctr._FormMarea;// modelo detalle marea
            var confEventosPesca = this.ctr._ConfiguracionEvento;//modelo conf eventos pesca 
            var listaBiometria = []//this.ctr._listaEventos[this.ctr._elementAct].ListaBiometria;//modelo lista biometria
            var latiIniZonaPesca = eventoActual.ZPLatiIni;
            var latiFinZonaPesca = eventoActual.ZPLatiFin;
            var longIniZonaPesca = eventoActual.ZPLongIni;
            var longFinZonaPesca = eventoActual.ZPLongFin;
            var latiCalaD = eventoActual.LatitudD;
            var latiCalaM = eventoActual.LatitudM;
            var latiCala = latiCalaD * 100 + latiCalaM;
            var longCalaD = eventoActual.LongitudD;
            var longCalaM = eventoActual.LongitudM;
            var longCala = longCalaD * 100 + longCalaM;
            //var indPropiedad = DetalleMarea.IndPropiedad;
            var motivoMarea = DetalleMarea.CDMMA;
            var indEvento = eventoActual.INDTR;
            var espePermitEmb = DetalleMarea.EspPermitida;
            var valiCoordCala = eventoActual.ValiCoordCala;
            var millaCosta = eventoActual.MillaCosta;
            var espePermitida = [];
            var espeZonaPesca = [];
            var espeVeda = [];
            var listCalendario = motivoMarea == "1" ? this.ctr.calendarioPescaCHD : this.ctr.calendarioPescaCHI;
            this.ctr.calendarioPescaVED;
            for (let index = 0; index < listCalendario.length; index++) {
                const element = listCalendario[index];
                var latiIni = Utils.formatCoordenadaBTP(element.LTINI);
                var latiFin = Utils.formatCoordenadaBTP(element.LTFIN);
                var longIni = Utils.formatCoordenadaBTP( element.LNINI);
                var longFin = Utils.formatCoordenadaBTP(element.LGFIN);
                if (((latiIni < latiIniZonaPesca && latiFin > latiIniZonaPesca) ||
                    (latiIni >= latiIniZonaPesca && latiIni < latiFinZonaPesca)) &&
                    ((longIni < longIniZonaPesca && longFin > longIniZonaPesca) ||
                        (longIni >= longIniZonaPesca && longIni < longFinZonaPesca)) &&
                    ((latiCala >= latiIni || latiCala <= latiFin) &&
                        (longCala >= longIni || longCala <= longFin))) {
                    var obj = {
                        CDSPC: element.CDSPC,
                        DSSPC: element.DSSPC
                    };
                    espeZonaPesca.push(obj);
                    espePermitida.push(obj);
                }
            }

            if (espePermitida != null && espePermitida.length > 0) {
                if (valiCoordCala) {
                    for (let i = 0, j = 0; i < this.ctr.calendarioPescaVED.length; i++) {
                        const calendarioVED = this.ctr.calendarioPescaVED[i];
                        var latiIni = calendarioVED.LTINI;
                        var latiFin = calendarioVED.LTFIN;
                        var longIni = calendarioVED.LNINI;
                        var longFin = calendarioVED.LGFIN;
                        var millas = calendarioVED.MILLA;
                        var especieVeda = calendarioVED.CDSPC;
                        if ((latiCala >= latiIni && latiCala <= latiFin) && (millaCosta <= millas)) {
                            var arrayFiltrado = espePermitida.filter(function (el) { return el.CDSPC != especieVeda; });
                            espePermitida = arrayFiltrado;
                            var obj = {
                                CDSPC: calendarioVED.CDSPC,
                                DSSPC: calendarioVED.DSSPC
                            };
                            espeVeda.push(obj);
                        }
                    }
                }

                if (indEvento == "N") {
                    eventoActual.ListaPescaDeclarada = [];
                    this._oView.byId("table_biometria").destroyColumns();
                    this.ctr.Dat_Biometria.getTableDefault();
                    if (motivoMarea == "1" && espePermitEmb != null) {
                        for (let index = 0; index < espePermitEmb.length; index++) {
                            const element = espePermitEmb[index];
                            var especie = element.CDSPC;
                            var descEspecie = element.DSSPC;
                            for (let index1 = 0; index1 < espePermitida.length; index1++) {
                                const element1 = espePermitida[index1];
                                if (element1.CDSPC == especie) {
                                    var obj = {
                                        INDTR: "N",
                                        CDSPC: especie.toString(),
                                        DSSPC: element1.DSSPC,
                                        UnidMedida: confEventosPesca.calaDescUMPescaDecl,
                                        DSUMD: confEventosPesca.calaDescUMPescaDeclDesc
                                    };
                                    eventoActual.ListaPescaDeclarada.push(obj);

                                    var objBiometria = {
                                        CodEspecie: especie.toString(),
                                        Especie: element1.DSSPC
                                    };
                                    listaBiometria.push(objBiometria);
                                }
                            }

                        }
                    } else if (motivoMarea == "2") {
                        var espOk = true;
                        this.oBundle = this.ctr.getOwnerComponent().getModel("i18n").getResourceBundle();
                        var especieDef = confEventosPesca.calaCodEspecieCHI; //Una sola especie para pesca CHI
                        var obsvEspecie = "";
                        for (let index2 = 0; index2 < espePermitEmb.length; index2++) {
                            const element = espePermitEmb[index2];
                            if (element.CDSPC != especieDef) {
                                espOk = false;
                                obsvEspecie += this.oBundle.getText("EMBNOPERMISOESP");
                            }else if(element.CDSPC == especieDef){
                                espOk = true;
                                break;
                            }
                        }

                        for (let index3 = 0; index3 < espeZonaPesca.length; index3++) {
                            const element = espeZonaPesca[index3];
                            if (element.CDSPC != especieDef) {
                                espOk = false;
                                obsvEspecie += this.oBundle.getText("ESPNOPERMITZONA");
                            }else if(element.CDSPC == especieDef){
                                espOk = true;
                                break;
                            }
                        }

                        if (valiCoordCala) {
                            for (let index4 = 0; index4 < espeVeda.length; index4++) {
                                const element = espeVeda[index4];
                                if (element.CDSPC != especieDef) {
                                    espOk = false;
                                    obsvEspecie += this.oBundle.getText("ESPECIEENVEDA");
                                }else if(element.CDSPC == especieDef){
                                    espOk = true;
                                    break;
                                }
                            }
                        }

                        if (!espOk) {
                            eventoActual.ObseAdicional = this.oBundle.getText("OBSADICCALAESPNOVALIDA");
                        }

                        var obj = {
                            INDTR: "N",
                            CDSPC: especieDef,
                            DSSPC: confEventosPesca.calaDescEspecieCHI,
                            OBSER: obsvEspecie,
                            UnidMedida: confEventosPesca.calaDescUMPescaDecl,
                            DSUMD: confEventosPesca.calaDescUMPescaDeclDesc
                        };
                        eventoActual.ListaPescaDeclarada.push(obj);

                        var objBiometria = {
                            CodEspecie: especieDef,
                            Especie: confEventosPesca.calaDescEspecieCHI
                        };
                        listaBiometria.push(objBiometria);

                    }
                    eventoActual.ListaBiometria = listaBiometria;
                }
            }

            eventoActual.ObteEspePermitidas = false;
            eventoActual.EspePermitida = espePermitida;
            eventoActual.EspeZonaPesca = espeZonaPesca;
            eventoActual.EspeVeda = espeVeda;

            this._oView.getModel("eventos").updateBindings(true);
            //refrescar modelo
        },
        buscarCodTab: function (arrayRecorrido, valor_a_encontrar) {
            let key = "";
            let arrayValiTab = arrayRecorrido[0];
            key = arrayValiTab[valor_a_encontrar];

            return key
        },
        prueba : function(){
            let valor = sap.ui.getCore().byId("dtp_fechaIniCala").getValue();
            console.log("Holaaaaaaaaaaaa : " + valor);
        },
        valStock_gen :function(){
            this.ctr.validacionStock();
        },
        validarLat : function(evt){
            let id = evt.getParameter("id");
            let valorlat =  sap.ui.getCore().byId(id).getValue() ?  Number(sap.ui.getCore().byId(id).getValue()) + "" : "0";
            if(Number.isInteger(valorlat) || Number(valorlat) < 0){
                sap.ui.getCore().byId(id).setValueState( sap.ui.core.ValueState.Error);
                sap.ui.getCore().byId(id).setValueStateText("Introduzca un valor entero positivo");
                this.ctr.validacioncampos = false;
                
            }else{
                if(valorlat.length > 2){
                    sap.ui.getCore().byId(id).setValueState( sap.ui.core.ValueState.Error);
                    sap.ui.getCore().byId(id).setValueStateText("Introduzca un valor entero positivo de dos dígitos");
                    this.ctr.validacioncampos = false;
                }else{
                    sap.ui.getCore().byId(id).setValueState( sap.ui.core.ValueState.None);
                    let Lat1 = this.ctr.byId("ip_latitud1").getValue() ? Number(this.ctr.byId("ip_latitud1").getValue()) + "": "0";
                    let Lat2 = this.ctr.byId("ip_latitud2").getValue() ? Number(this.ctr.byId("ip_latitud2").getValue()) + "": "0";
                    let Long1 = this.ctr.byId("ip_longitud1").getValue() ? Number(this.ctr.byId("ip_longitud1").getValue()) + "": "0";
                    let Long2 = this.ctr.byId("ip_longitud2").getValue() ? Number(this.ctr.byId("ip_longitud2").getValue()) + "": "0";
                    if(Lat1.length < 4 && Long1.length < 4 && Lat2.length < 3 && Long2.length < 3){
                        this.ctr.validacioncampos = true;
                    }
                }
                
            }

        },
        validarLong : function(evt){
            let id = evt.getParameter("id");
            let valorlat =  sap.ui.getCore().byId(id).getValue() ?  Number(sap.ui.getCore().byId(id).getValue()) + "" : "0";
            if(Number.isInteger(valorlat) || Number(valorlat) < 0){
                sap.ui.getCore().byId(id).setValueState( sap.ui.core.ValueState.Error);
                sap.ui.getCore().byId(id).setValueStateText("Introduzca un valor entero positivo");
                this.ctr.validacioncampos = false;
                
            }else{
                if(valorlat.length > 3){
                    sap.ui.getCore().byId(id).setValueState( sap.ui.core.ValueState.Error);
                    sap.ui.getCore().byId(id).setValueStateText("Introduzca un valor entero positivo de tres dígitos");
                    this.ctr.validacioncampos = false;
                }else{
                    sap.ui.getCore().byId(id).setValueState( sap.ui.core.ValueState.None);
                    let Lat1 = this.ctr.byId("ip_latitud1").getValue() ? Number(this.ctr.byId("ip_latitud1").getValue()) + "": "0";
                    let Lat2 = this.ctr.byId("ip_latitud2").getValue() ? Number(this.ctr.byId("ip_latitud2").getValue()) + "": "0";
                    let Long1 = this.ctr.byId("ip_longitud1").getValue() ? Number(this.ctr.byId("ip_longitud1").getValue()) + "": "0";
                    let Long2 = this.ctr.byId("ip_longitud2").getValue() ? Number(this.ctr.byId("ip_longitud2").getValue()) + "": "0";
                    if(Lat1.length < 4 && Long1.length < 4 && Lat2.length < 3 && Long2.length < 3){
                        this.ctr.validacioncampos = true;
                    }
                    
                }
                
            }

        },
        cargarStockFormat :function(evt){
            let id = evt.getParameter("id");
            let valorstock =  sap.ui.getCore().byId(id).getValue();
            let val = Number(valorstock);
            let n_valorstock  = new Intl.NumberFormat('es-MX').format(val);
            this._oView.getModel("eventos").setProperty("/DESSTCMB", n_valorstock);
        },

        validarFechaEnvIni :function(){
            this.ctr.validarFechaEnvIni_Det();
        },

        validarFechaEnvFin : function(){
            this.ctr.validarFechaEnvFin_Det();
        },
        validarFechaCalas_Evn :function(){
            this.ctr.validarFechaCalas();
        }


    });
});