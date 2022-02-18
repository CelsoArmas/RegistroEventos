sap.ui.define([
    "./FormCust",
    "../Service/TasaBackendService",
    "sap/m/MessageBox",
    "./Utils",
    "sap/ui/core/BusyIndicator"
], function (FormCust, TasaBackendService, MessageBox, Utils, BusyIndicator) {
    "use strict";

    return {

        bckEmbarcacion: null,
        bckArmador: null,

        getModel: function (sName) {
            return sap.ui.getCore().getModel(sName);
        },

        setModel: function (sName, model) {
            return sap.ui.getCore().setModel(model, sName);
        },

        getResourceModel: function () {
            return sap.ui.getCore().getModel("i18n").getResourceBundle();
        },

        init: function () {
            this.bckEmbarcacion = null;
            this.bckArmador = null;
        },

        verificarCambiosCodigo: async function (tipo, codigo) {
            var form = this.getModel("Form");
            var bOk = null;
            if (codigo != null && codigo.trim().length > 0) {
                codigo = codigo.trim();
                if (tipo == "EMB") {
                    if (this.bckEmbarcacion == null || codigo != this.bckEmbarcacion) {
                        form.setProperty("/MotMarea", null);
                        bOk = await this.buscarEmbarcacion(codigo);
                    }
                } else if (tipo == "ARM") {
                    if (this.bckArmador == null || codigo != this.bckArmador) {
                        bOk = await this.buscarArmador(codigo);
                    }
                }
            }
            return bOk;
        },

        buscarEmbarcacion: async function (codigo) {
            var me = this;
            var indPropiedad = "";
            var clearData = false;
            var form = this.getModel("Form");
            var filtro = this.getModel("Filtro")
            var dataSesionModel = this.getModel("DataSession");
            var visibleModel = this.getModel("Visible");
            var utils = this.getModel("Utils");
            var usuario = dataSesionModel.getProperty("/User");
            var valFijoPlanta = filtro.getProperty("/ValFijoPlanta");
            visibleModel.setProperty("/EnlMarAnterior", false);
            var emba = await TasaBackendService.buscarEmbarcacion(codigo, usuario);
            if (emba) {
                await this.obtenerDatosMareaAnt(0, codigo);
                var mareaAnterior = this.getModel("MareaAnterior");
                var estMarAnt = mareaAnterior.getProperty("/EstMarea");
                var cieMarAnt = mareaAnterior.getProperty("/EstCierre");
                var ce_embaElement = emba[0];
                indPropiedad = ce_embaElement.INPRP;
                if (estMarAnt == "C") {
                    console.log("Mare Anterior Cerrada");
                    if (ce_embaElement.ESEMB == "O") {
                        form.setProperty("/Embarcacion", ce_embaElement.CDEMB);
                        form.setProperty("/DescEmbarcacion", ce_embaElement.NMEMB);
                        form.setProperty("/MatrEmbarcacion", ce_embaElement.MREMB);
                        form.setProperty("/SistPesca", ce_embaElement.CDSPE + " - " + ce_embaElement.DSSPE);
                        form.setProperty("/Armador", ce_embaElement.LIFNR);
                        form.setProperty("/DescArmador", ce_embaElement.NAME1);
                        form.setProperty("/PermisoSur", ce_embaElement.CNVPS);
                        form.setProperty("/FechaPermisoSur", ce_embaElement.FCVPS);
                        if (ce_embaElement.TCBPS) {
                            var sum = parseFloat(ce_embaElement.CPPMS) + parseFloat(ce_embaElement.TCBPS);
                            form.setProperty("/CapBodegaPermiso", sum.toFixed(3));
                        }
                        var consultarPermisoZarpe = await this.consultarPermisoZarpe(codigo);
                        if (indPropiedad == "P") {
                            form.setProperty("/CenEmbarcacion", ce_embaElement.WERKS);
                            var obtenerDatosDistribFlota = await this.obtenerDatosDistribFlota(codigo)
                            if (obtenerDatosDistribFlota) {
                                clearData = !consultarPermisoZarpe;
                            } else {
                                var mssg = codigo + " - " + ce_embaElement.NMEMB + ":" + this.getResourceModel().getText("NOUBICENDISTRIB");
                                MessageBox.error(mssg);
                                clearData = true;
                            }
                        } else if (indPropiedad == "T") {
                            var obtenerDatosPlantaDist = await this.obtenerDatosPlantaDist(valFijoPlanta);
                            if (obtenerDatosPlantaDist) {
                                clearData = !consultarPermisoZarpe;
                            } else {
                                var mssg = codigo + " - " + ce_embaElement.NMEMB + ":" + this.getResourceModel().getText("SELECCPLANTA");
                                MessageBox.error(mssg);
                                clearData = true;
                            }
                        } else {
                            var mssg = codigo + " - " + ce_embaElement.NMEMB + ":" + this.getResourceModel().getText("NOINDPROPIEDAD");
                            MessageBox.error(mssg);
                            clearData = true;
                        }

                        if (!clearData) {
                            var valPerPescSur = this.validarPermisoPescaSur();
                            clearData = !valPerPescSur;
                        }
                    } else {
                        var mssg = codigo + " - " + ce_embaElement.NMEMB + ":" + this.getResourceModel().getText("EMBNOPERATIVO");
                        MessageBox.error(mssg);
                        clearData = true;
                    }
                } else if (estMarAnt == "A") {
                    console.log("Mare Anterior Abierta");
                    if (!cieMarAnt) {
                        visibleModel.setProperty("/EnlMarAnterior", true);
                        var mssg = codigo + " - " + ce_embaElement.NMEMB + ":" + this.getResourceModel().getText("EMBMAREAABIERTA");
                        console.log(mssg);
                        MessageBox.error(mssg);
                        clearData = true;
                    } else {
                        var mssg = codigo + " - " + ce_embaElement.NMEMB + ":" + this.getResourceModel().getText("MAREATRATADAADMIN");
                        MessageBox.error(mssg);
                        clearData = true;
                    }
                }
            } else {
                var mssg = this.getResourceModel().getText("NORESULTADOEMB");
                MessageBox.information(mssg);
                clearData = true;
            }
            if (clearData) {

                this.bckEmbarcacion = null;
                form.setProperty("/Embarcacion", null);
                form.setProperty("/DescEmbarcacion", null);
                form.setProperty("/Armador", null);
                form.setProperty("/DescArmador", null);
                form.setProperty("/SistPesca", null);
                form.setProperty("/MotMarea", null);
            } else {
                this.validarIndPropiedad(indPropiedad);
                this.bckEmbarcacion = codigo;
            }
            utils.setProperty("/VedaVerificada", false);
            return clearData;
        },

        buscarArmador: async function (codigo) {
            var clearData = false;
            var dataSesionModel = this.getModel("DataSession");
            var usuario = dataSesionModel.getProperty("/User");
            var response = await TasaBackendService.buscarArmador(codigo, usuario);
            if (response) {
                var form = this.getModel("Form");
                var data = response.data[0];
                form.setProperty("/DescArmador", data.DSEMP);
            } else {
                var mssg = this.getResourceModel().getText("NORESULTADOARMADOR");
                MessageBox.information(mssg);
                clearData = true;
            }
            if (clearData) {
                this.bckArmador = null;
                form.setProperty("/Armador", null);
                form.setProperty("/DescArmador", null);
            } else {
                this.bckArmador = codigo;
            }
        },

        validarIndPropiedad: function (ind) {
            var visible = this.getModel("Visible");
            var form = this.getModel("Form");
            if (ind == null || (ind != null && ind == "T")) {
                visible.setProperty("/BtnArmador", true);
                visible.setProperty("/EnlNueArmador", true);
                form.setProperty("/Armador", null);
                form.setProperty("/DescArmador", null);
                form.setProperty("/IndPropiedad", "T");
            } else {//setArmLectura
                visible.setProperty("/BtnArmador", false);
                visible.setProperty("/EnlNueArmador", false);
                form.setProperty("/IndPropiedad", "P");
            }
        },

        obtenerDatosMareaAnt: async function (marea, codigo) {
            var utilitario = this.getModel("Utilitario");
            var dataSesionModel = this.getModel("DataSession");
            var usuario = dataSesionModel.getProperty("/User");
            var mareaAnterior = this.getModel("MareaAnterior");
            var response = await TasaBackendService.obtenerMareaAnterior(marea, codigo, usuario);
            if (response) {
                var mareaAnt = response.data[0];
                mareaAnterior.setProperty("/Marea", parseInt(mareaAnt.NRMAR));
                mareaAnterior.setProperty("/MotMarea", mareaAnt.CDMMA);
                mareaAnterior.setProperty("/EstMarea", mareaAnt.ESMAR);
                mareaAnterior.setProperty("/DescMotivoMarea", mareaAnt.DESC_CDMMA);
                mareaAnterior.setProperty("/FecApertura", mareaAnt.FEMAR);
                mareaAnterior.setProperty("/HorApertura", mareaAnt.HAMAR);
                mareaAnterior.setProperty("/FecCierre", mareaAnt.FXMAR);
                mareaAnterior.setProperty("/HorCierre", mareaAnt.HXMAR);
                mareaAnterior.setProperty("/FecInicio", mareaAnt.FIMAR);
                mareaAnterior.setProperty("/HorInicio", mareaAnt.HIMAR);
                mareaAnterior.setProperty("/FecFin", mareaAnt.FFMAR);
                mareaAnterior.setProperty("/HorFin", mareaAnt.HFMAR);
                mareaAnterior.setProperty("/EstCierre", mareaAnt.ESCMA);
                if (!utilitario.getProperty("/motivoSinZarpe").includes(mareaAnt.CDMMA)) {
                    var response1 = await TasaBackendService.obtenerEventoAnterior(parseInt(mareaAnt.NRMAR), usuario);
                    if (response1) {
                        var eventoAnt = response1.data[0];
                        if (eventoAnt) {
                            mareaAnterior.setProperty("/EventosMarAnt/Numero", parseInt(eventoAnt.NREVN));
                            mareaAnterior.setProperty("/EventosMarAnt/TipoEvento", eventoAnt.CDTEV);
                            mareaAnterior.setProperty("/EventosMarAnt/DescTipoEvento", eventoAnt.DESC_CDTEV);
                            mareaAnterior.setProperty("/EventosMarAnt/FechIni", eventoAnt.FIEVN);
                            mareaAnterior.setProperty("/EventosMarAnt/HoraIni", eventoAnt.HIEVN);
                            mareaAnterior.setProperty("/EventosMarAnt/FechFin", eventoAnt.FFEVN);
                            mareaAnterior.setProperty("/EventosMarAnt/HoraFin", eventoAnt.HFEVN);
                        }
                    }
                }
            }
        },

        obtenerDatosDistribFlota: async function (codigo) {
            var me = this;
            var dataSesionModel = this.getModel("DataSession");
            var usuario = dataSesionModel.getProperty("/User");
            var distribFlota = this.getModel("DistribFlota");
            var constantsUtility = this.getModel("ConstantsUtility");
            var caracterEditar = constantsUtility.getProperty("/CARACTEREDITAR");
            var response = await TasaBackendService.obtenerDatosDstrFlota(codigo, usuario);
            if (response) {
                distribFlota.setProperty("/Indicador", caracterEditar);
                distribFlota.setProperty("/Planta", response.CDPTA);
                distribFlota.setProperty("/DescPlanta", response.DESCR);
                distribFlota.setProperty("/Puerto", response.CDPTO);
                distribFlota.setProperty("/DescPuerto", response.DSPTO);
                distribFlota.setProperty("/LatPuerto", response.LTGEO);
                distribFlota.setProperty("/IntLatPuerto", parseInt(response.LTGEO));
                distribFlota.setProperty("/LonPuerto", response.LNGEO);
                distribFlota.setProperty("/IntLonPuerto", parseInt(response.LNGEO));
                distribFlota.setProperty("/FecArribo", response.FEARR);
                distribFlota.setProperty("/HorArribo", response.HEARR);
                distribFlota.setProperty("/Empresa", response.EMPLA);
                distribFlota.setProperty("/CentPlanta", response.WKSPT);
                distribFlota.setProperty("/UbicPlanta", response.CDUPT);
                if (response.DSEMP || response.INPRP) {
                    distribFlota.setProperty("/DescEmpresa", response.DSEMP);
                    distribFlota.setProperty("/IndPropPlanta", response.INPRP);
                } else {
                    var mssg = me.getResourceModel().getText("PLANTASINEMPRESA");
                    MessageBox.error(mssg);
                }
                return true;
            } else {
                return false;
            }
        },

        consultarPermisoZarpe: async function (codigo) {
            var me = this;
            var dataSesionModel = this.getModel("DataSession");
            var usuario = dataSesionModel.getProperty("/User");
            var form = this.getModel("Form");
            var puedeZarpar = await TasaBackendService.obtenerPermisoZarpe(codigo, usuario).then(function (response) {
                var bOk = true;
                if (response.data) {
                    var permiso = response.data[0];
                    if (permiso.ESPMS != "V") {
                        form.setProperty("/Armador", null);
                        form.setProperty("/DescArmador", null);
                        var mssg = codigo + " - " + ce_embaElement.NMEMB + ":" + me.getResourceModel().getText("EMBSUSPENDIDA");
                        MessageBox.error(mssg);
                        bOk = false;
                    }
                }
                return bOk;
            }).catch(function (error) {
                console.log("ERROR: FormCust.consultarPermisoZarpe - ", error);
                return null;
            });
            return puedeZarpar;
        },

        obtenerDatosPlantaDist: async function (planta) {
            var me = this;
            var dataSesionModel = this.getModel("DataSession");
            var usuario = dataSesionModel.getProperty("/User");
            var distribFlota = this.getModel("DistribFlota");
            var constantsUtility = this.getModel("ConstantsUtility");
            var caracterNuevo = constantsUtility.getProperty("/CARACTERNUEVO");
            var bOk = await TasaBackendService.obtenerDatosPlantaDist(planta, usuario).then(function (response) {
                if (response) {
                    distribFlota.setProperty("/Indicador", caracterNuevo);
                    distribFlota.setProperty("/Planta", response.CDPTA);
                    distribFlota.setProperty("/DescPlanta", response.DESCR);
                    distribFlota.setProperty("/Puerto", response.CDPTO);
                    distribFlota.setProperty("/DescPuerto", response.DSPTO);
                    distribFlota.setProperty("/LatPuerto", response.LTGEO);
                    distribFlota.setProperty("/IntLatPuerto", parseInt(response.LTGEO));
                    distribFlota.setProperty("/LonPuerto", response.LNGEO);
                    distribFlota.setProperty("/IntLonPuerto", parseInt(response.LNGEO));
                    distribFlota.setProperty("/Empresa", response.CDEMP);
                    distribFlota.setProperty("/UbicPlanta", response.CDUPT);
                    if (response.DSEMP || response.INPRP) {
                        distribFlota.setProperty("/DescEmpresa", response.DSEMP);
                        distribFlota.setProperty("/IndPropPlanta", response.INPRP);
                    } else {
                        var mssg = me.getResourceModel().getText("PLANTASINEMPRESA");
                        MessageBox.error(mssg);
                    }
                    return true;
                } else {
                    var mssg = me.getResourceModel().getText("NODATOSPLANTA");
                    MessageBox.error(mssg);
                    return false;
                }
            }).catch(function (error) {
                console.log("ERROR: FormCust.obtenerDatosDistribFlota - ", error);
                return null;
            });
            return bOk;
        },

        validarPermisoPescaSur: function () {
            var me = this;
            var bOk = true;
            var distribFlota = this.getModel("DistribFlota");
            var form = this.getModel("Form");
            var constantes = this.getModel("Constantes");
            var ubicPlanta = distribFlota.getProperty("/UbicPlanta");
            var permisoSur = form.getProperty("/PermisoSur");
            var fechaPerSur = form.getProperty("/FechaPermisoSur");
            var fechaPermiso = Utils.strDateToDate(fechaPerSur);
            var fechaActual = new Date();
            if (ubicPlanta == constantes.getProperty("/CodUbicSur")) {
                if (permisoSur == "S") {
                    if (fechaActual > fechaPermiso) {
                        bOk = false;
                        var mssg = me.getResourceModel().getText("PERMISOSURVENCIO", [fechaPerSur]);
                        MessageBox.error(mssg);
                    }
                } else {
                    bOk = false;
                    var mssg = me.getResourceModel().getText("NOPERMISOSUR");
                    MessageBox.error(mssg);
                }
            }
            return bOk;
        },

        validarBodegaCert: async function (codEmba, codPlanta) {
            var bOk = false;
            var response = await TasaBackendService.validarBodegaCert(cdemb, cdpta);
            if (response) {
                bOk = response.estado;
            } else {
                bOk = null;
                MessageBox.error(this.oBundle.getText("EMBANOPER", [nmemb]));
            }
            return bOk;
        },

        ValidacionMareaProduce: async function (codEmba, codPlanta) {
            var response1 = await TasaBackendService.validarMareaProd(cdemb, cdpta);
            if (response1.p_correcto == "X") {
                bOk = true;
            } else {
                MessageBox.error(this.oBundle.getText("EMBANOPROD", [nmemb]));
            }
        }


    }
});