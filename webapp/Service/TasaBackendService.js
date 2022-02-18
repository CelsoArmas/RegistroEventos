sap.ui.define([
    "./CoreService",
    "./UtilService"
], function (
    CoreService,
    UtilService
) {
    "use strict";

    var TasaBackend = CoreService.extend("com.tasa.registroeventospescav2.Service.TasaBackendService", {

        obtenerTipoEmbarcacion: async function (sUsuario) {
            var uri = UtilService.getHostService() + "/api/embarcacion/listaTipoEmbarcacion";
            var arg = {
                usuario: sUsuario
            };
            var data = await this.http(uri).get(null, arg).then(function (response) {
                var data = JSON.parse(response);
                var sData = JSON.parse(data);
                return sData;
            }).catch(function(error){
                console.log("ERROR: TasaBackendService.obtenerTipoEmbarcacion: ", error);
                return null;
            });
            return data;
        },

        obtenerPlantas: async function (sUsuario) {
            var uri = UtilService.getHostService() + "/api/embarcacion/listaPlantas";
            var arg = {
                usuario: sUsuario
            };
            var data = await this.http(uri).get(null, arg).then(function (response) {
                var data = JSON.parse(response);
                var sData = JSON.parse(data);
                return sData;
            }).catch(function(error){
                console.log("ERROR: TasaBackendService.obtenerPlantas: ", error);
                return null;
            });
            return data;
        },

        cargarListaMareas: async function (sUsuario) {
            var uri = UtilService.getHostService() + "/api/embarcacion/ObtenerFlota";
            var arg = {
                usuario: sUsuario
            };
            var data = await this.http(uri).get(null, arg).then(function (response) {
                var data = JSON.parse(response);
                var sData = JSON.parse(data);
                return sData;
            }).catch(function(error){
                console.log("ERROR: TasaBackendService.cargarListaMareas: ", error);
                return null;
            });
            return data;
        },

        obtenerDetalleMarea: async function (marea, sUsuario) {
            var uri = UtilService.getHostService() + "/api/embarcacion/consultaMarea/";
            var sBody = UtilService.getBodyDetalleMarea();
            sBody.p_marea = marea;
            sBody.user = sUsuario;
            var data = await this.http(uri).post(null, sBody).then(function (response) {
                var data = JSON.parse(response);
                return data;
            }).catch(function(error){
                console.log("ERROR: TasaBackendService.obtenerDetalleMarea: ", error);
                return null;
            });
            return data
        },

        obtenerDominio: async function (dominio) {
            var uri = UtilService.getHostService() + "/api/dominios/Listar";
            var sBody = UtilService.getBodyDominio();
            sBody.dominios[0].domname = dominio;
            var data = await this.http(uri).post(null, sBody).then(function (response) {
                var data = JSON.parse(response);
                return data;
            }).catch(function(error){
                console.log("ERROR: TasaBackendService.obtenerDominio: ", error);
                return null;
            });
            return data;
        },

        obtenerDominioVarios: async function(listaDominios){
            var uri = UtilService.getHostService() + "/api/dominios/Listar";
            var sBody = UtilService.getBodyDominiosVarios();
            sBody.dominios = listaDominios;
            var data = await this.http(uri).post(null, sBody).then(function (response) {
                var data = JSON.parse(response);
                return data;
            }).catch(function(error){
                console.log("ERROR: TasaBackendService.obtenerDominio: ", error);
                return null;
            });
            return data;
        },

        obtenerDepartamentos: async function (sUsuario) {
            var uri = UtilService.getHostService() + "/api/General/ConsultaGeneral/";
            var sBody = UtilService.getConsultaGeneral();
            sBody.nombreConsulta = "CONSGENDPTO";
            sBody.p_user = sUsuario;
            var data = await this.http(uri).post(null, sBody).then(function (response) {
                var data = JSON.parse(response);
                return data;
            }).catch(function(error){
                console.log("ERROR: TasaBackendService.obtenerDepartamentos: ", error);
                return null
            });
            return data;
        },

        validarBodegaCert: async function (embarcacion, planta, usuario) {
            var uri = UtilService.getHostService() + "/api/embarcacion/ValidarBodegaCert/";
            var sBody = UtilService.getBodyValidaCert();
            sBody.codEmba = embarcacion;
            sBody.codPlanta = planta;
            sBody.usuario = usuario;
            var data = await this.http(uri).post(null, sBody).then(function (response) {
                var data = JSON.parse(response);
                return data;
            }).catch(function(error){
                console.log("ERROR: TasaBackendService.validarBodegaCert: ", error);
                return null;
            });
            return data;
        },

        validarMareaProd: function (embarcacion, planta) {
            var uri = UtilService.getHostService() + "/api/embarcacion/ValidarMarea/";
            var sBody = UtilService.getValidaMarea();
            sBody.p_codemb = embarcacion;
            sBody.p_codpta = planta;
            var data = this.http(uri).post(null, sBody).then(function (response) {
                var data = JSON.parse(response);
                return data;
            }).catch(function(error){
                console.log("ERROR: TasaBackendService.validarMareaProd: ", error);
                return null;
            });
            return data;
        },

        obtenerDatosDstrFlota: async function (embarcacion, sUsuario) {
            var uri = UtilService.getHostService() + "/api/General/ConsultaGeneral/";
            var sBody = UtilService.getConsultaGeneral();
            sBody.nombreConsulta = "CONSGENDSTRFLOTA";
            sBody.parametro1 = embarcacion;
            sBody.p_user = sUsuario;
            var data = await this.http(uri).post(null, sBody).then(function (response) {
                var data = JSON.parse(response);
                if(data.data){
                    return data.data[0];
                }else{
                    return null;
                }
            }).catch(function(error){
                console.log("ERROR: TasaBackendService.obtenerDatosDstrFlota: ", error);
                return null
            });
            return data;
            /*
            var uri = UtilService.getHostService() + "/api/General/Read_Table/";
            var sBody = UtilService.getBodyReadTable();
            sBody.delimitador = "|";
            sBody.fields = ["CDPTA", "DESCR", "CDPTO", "DSPTO", "LTGEO", "LNGEO", "FEARR", "HEARR", "EMPLA", "WKSPT", "CDUPT", "MANDT"];;
            sBody.option[0].wa = "CDEMB LIKE '" + embarcacion + "'";
            sBody.p_user = sUsuario;
            sBody.tabla = "ZV_FLDF";
            var data1 = null;
            var data = await this.http(uri).post(null, sBody).then(function (response) {
                var data = JSON.parse(response);
                if (data) {
                    if (data.data) {
                        return data.data;
                    } else {
                        return null;
                    }
                } else {
                    return null;
                }
            }).catch(function (error) {
                console.log("ERROR: TasaBackendService.obtenerDatosDstrFlota 1 : ", error);
                return null;
            });
            if (data) {
                var empla = data[0].EMPLA;
                sBody.fields = ["DSEMP", "INPRP", "MANDT"];
                sBody.option[0].wa = "CDEMP LIKE '" + empla + "'";
                sBody.tabla = "ZV_FLMP";
                data1 = await this.http(uri).post(null, sBody).then(function (sResponse) {
                    var sData = JSON.parse(sResponse);
                    if (sData) {
                        if (sData.data) {
                            var objReturn = {
                                CDPTA: data[0].CDPTA,
                                DESCR: data[0].DESCR,
                                CDPTO: data[0].CDPTO,
                                DSPTO: data[0].DSPTO,
                                LTGEO: data[0].LTGEO,
                                LNGEO: data[0].LNGEO,
                                FEARR: data[0].FEARR,
                                HEARR: data[0].HEARR,
                                EMPLA: data[0].EMPLA,
                                WKSPT: data[0].WKSPT,
                                CDUPT: data[0].CDUPT,
                                DSEMP: sData.data.length > 0 ? sData.data[0].DSEMP : null,
                                INPRP: sData.data.length > 0 ? sData.data[0].INPRP : null,
                            }
                            return objReturn;
                        } else {
                            return null;
                        }
                    } else {
                        return null;
                    }
                }).catch(function (error) {
                    console.log("ERROR: TasaBackendService.obtenerDatosDstrFlota 2 : ", error);
                    return null;
                });
            }
            return data1;*/
        },

        obtenerMareaAnterior: async function (marea, embarcacion, sUsuario) {
            var uri = UtilService.getHostService() + "/api/General/ConsultaGeneral/";
            var sBody = UtilService.getConsultaGeneral();
            sBody.nombreConsulta = "CONSGENMAREAANT";
            sBody.parametro1 = marea;
            sBody.parametro2 = embarcacion;
            sBody.p_user = sUsuario;
            var data = await this.http(uri).post(null, sBody).then(function (response) {
                var data = JSON.parse(response);
                if(data.data){
                    return data;
                }else{
                    return null;
                }
            }).catch(function(error){
                console.log("ERROR: TasaBackendService.obtenerDepartamentos: ", error);
                return null
            });
            return data;
            /*
            var uri = UtilService.getHostService() + "/api/General/Read_Table/";
            var sBody = UtilService.getBodyReadTable();
            sBody.delimitador = "|";
            sBody.fields = ["NRMAR", "ESMAR", "CDMMA", "FEMAR", "HAMAR", "FXMAR", "HXMAR", "FIMAR", "HIMAR", "FFMAR", "HFMAR", "ESCMA", "MANDT", "CDEMB"];
            sBody.option[0].wa = marea > 0 ? "NRMAR < " + marea + " AND CDEMB LIKE '" + embarcacion + "'" : "CDEMB = '" + embarcacion + "'";
            sBody.order = "NRMAR DESCENDING";
            sBody.tabla = "ZFLMAR";
            sBody.rowcount = 1;
            sBody.p_user = sUsuario;
            var data = await this.http(uri).post(null, sBody).then(function (response) {
                var data = JSON.parse(response);
                return data;
            }).catch(function (error) {
                console.log("ERROR: TasaBackendService.obtenerMareaAnterior : ", error);
                return null;
            });
            return data;*/
        },

        obtenerEventoAnterior: async function (marea, sUsuario) {
            var uri = UtilService.getHostService() + "/api/General/ConsultaGeneral/";
            var sBody = UtilService.getConsultaGeneral();
            sBody.nombreConsulta = "CONSGENEVENTANT";
            sBody.parametro1 = marea;
            sBody.p_user = sUsuario;
            var data = await this.http(uri).post(null, sBody).then(function (response) {
                var data = JSON.parse(response);
                if(data.data){
                    return data;
                }else{
                    return null;
                }
            }).catch(function(error){
                console.log("ERROR: TasaBackendService.obtenerDepartamentos: ", error);
                return null
            });
            return data;
            /*
            var uri = UtilService.getHostService() + "/api/General/Read_Table/";
            var sBody = UtilService.getBodyReadTable();
            sBody.delimitador = "|";
            sBody.fields = ["NREVN", "CDTEV", "FIEVN", "HIEVN", "FFEVN", "HFEVN", "MANDT"];
            sBody.option[0].wa = "NRMAR = " + marea;
            sBody.order = "NREVN DESCENDING";
            sBody.tabla = "ZFLEVN";
            sBody.rowcount = 1;
            sBody.p_user = sUsuario;
            var data = this.http(uri).post(null, sBody).then(function (response) {
                var data = JSON.parse(response);
                return data;
            }).catch(function (error) {
                console.log("ERROR: TasaBackendService.obtenerEventoAnterior : ", error);
                return null;
            });
            return data;*/
        },

        obtenerNroReserva: async function (nrmar, sUsuario) {
            var uri = UtilService.getHostService() + "/api/General/ConsultaGeneral/";
            var sBody = UtilService.getConsultaGeneral();
            sBody.nombreConsulta = "CONSGENNRORESERVA";
            sBody.parametro1 = nrmar;
            sBody.p_user = sUsuario;
            var data = await this.http(uri).post(null, sBody).then(function (response) {
                var data = JSON.parse(response);
                if(data.data){
                    return data;
                }else{
                    return null;
                }
            }).catch(function(error){
                console.log("ERROR: TasaBackendService.obtenerDepartamentos: ", error);
                return null
            });
            return data;
            /*
            var uri = UtilService.getHostService() + "/api/General/Read_Table/";
            var sBody = UtilService.getBodyReadTable();
            sBody.delimitador = "|";
            sBody.fields = ["NRRSV"];
            sBody.option[0].wa = "NRMAR = " + nrmar + " AND ESRSV EQ 'S'";
            sBody.tabla = "ZFLRSC";
            sBody.p_user = sUsuario;
            return this.http(uri).post(null, sBody).then(function (response) {
                return response;
            });*/
        },

        obtenerCodigoTipoPreservacion: function (cdemb, user) {
            var uri = UtilService.getHostService() + "/api/General/ConsultaGeneral/";
            var sBody = UtilService.getConsultaGeneral();
            sBody.nombreConsulta = "CONSGENCODTIPRE";
            sBody.parametro1 = cdemb;
            sBody.p_user = user;
            return this.http(uri).post(null, sBody).then(function (response) {
                return response;
            });
        },

        obtenerListaEquipamiento: function (cdemb, user) {
            var uri = UtilService.getHostService() + "/api/General/ConsultaGeneral/";
            var sBody = UtilService.getConsultaGeneral();
            sBody.nombreConsulta = "CONSGENLISTEQUIP";
            sBody.parametro1 = cdemb;
            sBody.p_user = user;
            return this.http(uri).post(null, sBody).then(function (response) {
                return response;
            });
        },

        obtenerListaCoordZonaPesca: function (zonaPesca, user) {
            var uri = UtilService.getHostService() + "/api/General/ConsultaGeneral/";
            var sBody = UtilService.getConsultaGeneral();
            sBody.nombreConsulta = "CONSGENCOOZONPES";
            sBody.parametro1 = zonaPesca;
            sBody.p_user = user;
            return this.http(uri).post(null, sBody).then(function (response) {
                return response;
            });
        },

        obtenerListaPescaDeclarada: function (nroMarea, nroEvento, user) {
            var uri = UtilService.getHostService() + "/api/General/ConsultaGeneral/";
            var sBody = UtilService.getConsultaGeneral();
            sBody.nombreConsulta = "CONSGENPESDECLA";
            sBody.parametro1 = nroMarea;
            sBody.parametro2 = nroEvento;
            sBody.p_user = user;
            return this.http(uri).post(null, sBody).then(function (response) {
                return response;
            });
        },

        obtenerListaBodegas: function (cdemb, user) {
            var uri = UtilService.getHostService() + "/api/General/ConsultaGeneral/";
            var sBody = UtilService.getConsultaGeneral();
            sBody.nombreConsulta = "CONSGENLISTBODE";
            sBody.parametro1 = cdemb;
            sBody.p_user = user;
            return this.http(uri).post(null, sBody).then(function (response) {
                return response;
            });
        },

        obtenerListaPescaBodegas: function (cdmarea, nroEvento, user) {
            var uri = UtilService.getHostService() + "/api/General/ConsultaGeneral/";
            var sBody = UtilService.getConsultaGeneral();
            sBody.nombreConsulta = "CONSGENPESBODE";
            sBody.parametro1 = cdmarea;
            sBody.parametro2 = nroEvento;
            sBody.p_user = user;
            return this.http(uri).post(null, sBody).then(function (response) {
                return response;
            });
        },

        validarErroresDescarga: function (nro_desc, user) {
            var uri = UtilService.getHostService() + "/api/General/ConsultaGeneral/";
            var sBody = UtilService.getConsultaGeneral();
            sBody.nombreConsulta = "CONSGENERRDSCG";
            sBody.parametro1 = nro_desc;
            sBody.p_user = user;
            var data = this.http(uri).post(null, sBody).then(function (response) {
                return JSON.parse(response);
            }).catch(function (error){
                console.log("ERROR : TasaBackendService.validarErroresDescarga - ", error);
                return null;
            });
            return data;
        },

        obtenerMedidaEspecie: async function(cod_especie, user){
            var uri = UtilService.getHostService() + "/api/General/ConsultaGeneral/";
            var sBody = UtilService.getConsultaGeneral();
            sBody.nombreConsulta = "CONSGENOBTTALLAMIN";
            sBody.parametro1 = cod_especie;
            sBody.p_user = user;
            var data = await this.http(uri).post(null, sBody).then(function (response) {
                var data = JSON.parse(response);
                return data;
            }).catch(function(error){
                console.log("ERROR: TasaBackendService.obtenerMedidaEspecie: ", error);
                return null;
            });
            return data;
        },
        obtenerListaPuntosDescarga: function (codPlanta, user) {
            var uri = UtilService.getHostService() + "/api/General/ConsultaGeneral/";
            var sBody = UtilService.getConsultaGeneral();
            sBody.nombreConsulta = "CONSGENPUNTDES";
            sBody.parametro1 = codPlanta;
            sBody.p_user = user;
            return this.http(uri).post(null, sBody).then(function (response) {
                return response;
            });
        },

        obtenerListaPescaDescargada: function (nroDescarga, user) {
            var uri = UtilService.getHostService() + "/api/General/ConsultaGeneral/";
            var sBody = UtilService.getConsultaGeneral();
            sBody.nombreConsulta = "CONSGENPESDESC";
            sBody.parametro1 = nroDescarga;
            sBody.p_user = user;
            return this.http(uri).post(null, sBody).then(function (response) {
                return response;
            });
        },

        obtenerListaSiniestros: function (cdmarea, nroEvento) {
            var uri = UtilService.getHostService() + "/api/General/Read_Table/";
            var sBody = UtilService.getBodyReadTable();
            sBody.delimitador = "|";
            sBody.fields = ["CDINC", "TTINC", "CDSIS", "EQKTX", "AUSWK", "ESOPA", "ESOPP"];
            sBody.option[0].wa = "NRMAR = " + cdmarea + " AND NREVN = " + nroEvento + " AND SPRAS EQ 'S'";
            sBody.tabla = "ZV_FLSI";
            return this.http(uri).post(null, sBody).then(function (response) {
                return response;
            });


        },
        obtenerListaHorometro: function (centro, evento, marea, nroEvento) {
            var uri = UtilService.getHostService() + "/api/eventospesca/obtenerHoroEvento/";
            var sBody = UtilService.getHorometro();
            sBody.centro = centro;
            sBody.evento = evento;
            sBody.marea = marea;
            sBody.nroEvento = nroEvento;
            return this.http(uri).post(null, sBody).then(function (response) {
                var data = JSON.parse(response);
                return data;
            });
        },

        obtenerConfiguracionEvento: function () {
            var uri = UtilService.getHostService() + "/api/eventospesca/ObtenerConfEventosPesca/";
            var sBody = {};
            return this.http(uri).post(null).then(function (response) {
                var data = JSON.parse(response);
                return data;
            });
        },

        obtenerListaDescargaPopUp: function (matricula, nom_embarcacion, cod_planta, nom_planta, fecha_inicio, user, nro_descarga,estado) {
            var uri = UtilService.getHostService() + "/api/General/ConsultaGeneral/";
            var sBody = UtilService.getConsultaGeneral();
            sBody.nombreConsulta = "CONSGENLISTDESCPP";
            sBody.parametro1 = matricula;
            sBody.parametro2 = nom_embarcacion;
            sBody.parametro3 = cod_planta;
            sBody.parametro4 = nom_planta;
            sBody.parametro5 = fecha_inicio;
            sBody.parametro6 = nro_descarga;
            sBody.parametro7 = estado;
            sBody.p_user = user;
            return this.http(uri).post(null, sBody).then(function (response) {
                return response;
            });
        },

        obtenerListaDescargaCHDPopUp: function (p_options) {
            var uri = UtilService.getHostService() + "/api/General/Read_Table/";
            var sBody = UtilService.getBodyReadTable();
            sBody.delimitador = "|";
            sBody.fields = ["NRO_ASIGNACION", "CDEMB", "NMEMB", "MREMB", "CDPTA", "DSPTA", "WERKS", "CANT_RECIBIDA", "ESPECIE",
                "FEPROD", "FECLLEGA", "HORLLEGA", "FECINIBOD", "HORINIBOD", "MANDT"];
            sBody.option = [];
            sBody.options = p_options
            sBody.tabla = "ZV_FLAE";
            return this.http(uri).post(null, sBody).then(function (response) {
                return response;
            });


        },

        eliminarPescaDescargada: function (marea, numero, user) {
            var uri = UtilService.getHostService() + "/api/calendariotemporadapesca/Eliminar";
            var sBody = UtilService.getElimPescaDesc();
            sBody.p_user = user;
            sBody.i_table = "ZFLEVN";
            sBody.t_data = "|" + marea + "|" + numero;
            return this.http(uri).post(null, sBody).then(function (response) {
                var data = JSON.parse(response);
                return data;
            });
        },

        actualizarPescaDescargada: function (marea, numero, user) {
            let array = [];
            array.push({
                cmopt: "NRMAR = " + marea + " AND NREVN = " + numero,
                cmset: "NRDES = '' FIEVN = '' HIEVN = '' FFEVN = '' HFEVN = ''",
                nmtab: "ZFLEVN"
            });
            var uri = UtilService.getHostService() + "/api/General/Update_Camp_Table/";
            var sBody = UtilService.getActuaPescaDesc();
            sBody.str_set = array;
            sBody.p_user = user;
            return this.http(uri).post(null, sBody).then(function (response) {
                var data = JSON.parse(response);
                return data;
            });
        },
        anularDescargaRFC: function (NroDescarga) {
            var uri = UtilService.getHostService() + "/api/eventospesca/AnularDescarga/";
            var sBody = UtilService.getAnularDescRFC();
            sBody.p_nrdes = NroDescarga;
            return this.http(uri).post(null, sBody).then(function (response) {
                var data = JSON.parse(response);
                return data;
            });
        },
        verificarTemporada: async function (codTemp, fecha) {
            var uri = UtilService.getHostService() + "/api/General/ConsultaGeneral/";
            var sBody = UtilService.getConsultaGeneral();
            sBody.nombreConsulta = "CONSGENVERIFTEMP";
            sBody.parametro1 = codTemp;
            sBody.parametro2 = fecha;
            sBody.p_user = "Fgarcia";
            var data = await this.http(uri).post(null, sBody).then(function (response) {
                var data = JSON.parse(response);
                if(data.data){
                    return data;
                }else{
                    return null;
                }
            }).catch(function(error){
                console.log("ERROR: TasaBackendService.obtenerDepartamentos: ", error);
                return null
            });
            return data;


            /*var uri = UtilService.getHostService() + "/api/General/Read_Table/";
            var sBody = UtilService.getBodyReadTable();
            sBody.delimitador = "|";
            sBody.fields = ["CDTPC"];
            sBody.option[0].wa = "CDTPC = '" + codTemp + "' AND FHCAL LIKE '" + fecha + "'";
            sBody.tabla = "ZFLCLT";
            return this.http(uri).post(null, sBody).then(function (response) {
                return response;
            });*/
        },

        obtenerTemporadas: async function (codTemp, fecha) {
            var uri = UtilService.getHostService() + "/api/General/ConsultaGeneral/";
            var sBody = UtilService.getConsultaGeneral();
            sBody.nombreConsulta = "CONSGENTEMP";
            sBody.parametro1 = codTemp;
            sBody.parametro2 = fecha;
            sBody.p_user = "Fgarcia";
            var data = await this.http(uri).post(null, sBody).then(function (response) {
                var data = JSON.parse(response);
                if(data.data){
                    return data;
                }else{
                    return null;
                }
            }).catch(function(error){
                console.log("ERROR: TasaBackendService.obtenerDepartamentos: ", error);
                return null
            });
            return data;

            /*var uri = UtilService.getHostService() + "/api/General/Read_Table/";
            var sBody = UtilService.getBodyReadTable();
            sBody.delimitador = "|";
            sBody.fields = ["CDSPC", "DSSPC", "LTINI", "LNINI", "LTFIN", "LGFIN", "MILLA", "MANDT"];
            sBody.option[0].wa = "CDTPC = '" + codTemp + "' AND FHCAL LIKE '" + fecha + "'";
            sBody.tabla = "ZV_FLCP";
            return this.http(uri).post(null, sBody).then(function (response) {
                return response;
            });*/
        },

        obtenerEspeciesPermitidas: function (cdemb, codTemp) {
            var uri = UtilService.getHostService() + "/api/General/Read_Table/";
            var sBody = UtilService.getBodyReadTable();
            sBody.delimitador = "|";
            sBody.fields = ["CDSPC"];
            sBody.option[0].wa = "CDEMB = '" + cdemb + "' AND CDTPC LIKE '" + codTemp + "' AND INPMS = 'I'";
            sBody.tabla = "ZFLPEC";
            return this.http(uri).post(null, sBody).then(function (response) {
                return response;
            });
        },

        obtenerCapaTanBarca: function (cdemb) {
            var uri = UtilService.getHostService() + "/api/General/Read_Table/";
            var sBody = UtilService.getBodyReadTable();
            sBody.delimitador = "|";
            sBody.fields = ["CDTAN"];
            sBody.option[0].wa = "CDEMB = '" + cdemb + "'";
            sBody.tabla = "ZFLEMB";
            return this.http(uri).post(null, sBody).then(function (response) {
                var data = JSON.parse(response);
                return data;
            });
        },

        consultarHorometro: function (cdemb, nrmar) {
            var uri = UtilService.getHostService() + "/api/embarcacion/consultarHorometro/";
            var sBody = UtilService.getBodyConHorom();
            sBody.ip_cdemb = cdemb;
            sBody.ip_nrmar = nrmar;
            var data = this.http(uri).post(null, sBody).then(function (response) {
                var data = JSON.parse(response);
                return data;
            }).catch(function(error){
                console.log("ERROR: TasaBackendService.consultarHorometro : ", error);
                return null;
            });
            return data;
        },

        obtenerMillasLitoral: function (latiCalaD, latiCalaM) {
            var uri = UtilService.getHostService() + "/api/General/Read_Table/";
            var sBody = UtilService.getBodyReadTable();
            sBody.delimitador = "|";
            sBody.fields = ["LATGR", "LATMI", "LONGR", "LONMI"];
            sBody.option[0].wa = "LATGR = '" + latiCalaD + "' AND LATMI >= '" + latiCalaM + "' AND LATMI < '" + (latiCalaM + 1) + "' ";
            sBody.order = "LATMI ASCENDING";
            sBody.tabla = "ZFLLLL";
            return this.http(uri).post(null, sBody).then(function (response) {
                var data = JSON.parse(response);
                return data;
            });
        },

        obtenerMareaBiometria: function (embarcacion, p_marea, user) {
            var uri = UtilService.getHostService() + "/api/embarcacion/consultaMarea2/";
            var sBody = UtilService.getConsultaMareaBio();
            sBody.p_embarcacion = embarcacion;
            sBody.p_marea = p_marea;
            sBody.user = user;
            return this.http(uri).post(null, sBody).then(function (response) {
                var data = JSON.parse(response);
                return data;
            });
        },

        ayudaBusqueda: function (nombreAyuda, usuario) {
            var uri = UtilService.getHostService() + "/api/General/AyudasBusqueda/";
            var sBody = UtilService.getBodyAyudaBusq();
            sBody.nombreAyuda = nombreAyuda;
            sBody.p_user = usuario;
            return this.http(uri).post(null, sBody).then(function (response) {
                var data = JSON.parse(response);
                return data;
            });
        },

        buscarEmbarcacion: async function (codigo, usuario) { 
            var uri = UtilService.getHostService() + "/api/embarcacion/BusquedasEmbarcacion/";
            var sBody = UtilService.getBodyBuscarEmba();
            sBody.option[0].wa = "CDEMB = '" + codigo + "'";
            sBody.p_user = usuario;
            var data = await this.http(uri).post(null, sBody).then(function (response) {
                var data = JSON.parse(response);
                return data.data;
            }).catch(function (error) {
                console.log("ERROR: TasaBackendService.buscarEmbarcacion : ", error);
                return null;
            });
            return data;
        },

        obtenerPermisoZarpe: function (codigo, usuario) { //pendiente de mover a backend
            var uri = UtilService.getHostService() + "/api/General/Read_Table/";
            var sBody = UtilService.getBodyReadTable();
            sBody.delimitador = "|";
            sBody.fields = ["CDEMB", "ESPMS"];
            sBody.option[0].wa = "CDEMB LIKE '" + codigo + "' AND CDTPM LIKE 'Z'";
            sBody.p_user = usuario;
            sBody.tabla = "ZFLPPE";
            return this.http(uri).post(null, sBody).then(function (response) {
                var data = JSON.parse(response);
                return data;
            });
        },

        obtenerDatosPlantaDist: async function (planta, sUsuario) { //pendiente de mover a backend
            var uri = UtilService.getHostService() + "/api/General/Read_Table/";
            var sBody = UtilService.getBodyReadTable();
            sBody.delimitador = "|";
            sBody.fields = ["CDPTA", "DESCR", "CDPTO", "DSPTO", "LTGEO", "LNGEO", "CDEMP", "CDUPT", "MANDT"];;
            sBody.option[0].wa = "CDPTA LIKE '" + planta + "'";
            sBody.p_user = sUsuario;
            sBody.tabla = "ZV_FLPL";
            var data1 = null;
            var data = await this.http(uri).post(null, sBody).then(function (response) {
                var data = JSON.parse(response);
                if(data){
                    if(data.data){
                        return data.data;
                    }else{
                        return null;
                    }
                }else{
                    return null;
                }
            }).catch(function(error){
                console.log("ERROR: TasaBackendService.obtenerDatosPlantaDist 1: ", error);
                return null;
            });
            if(data && data.length > 0){
                var cdemp = data[0].CDEMP;
                sBody.fields = ["DSEMP", "INPRP", "MANDT"];
                sBody.option[0].wa = "CDEMP LIKE '" + cdemp + "'";
                sBody.tabla = "ZV_FLMP";
                data1 = await this.http(uri).post(null, sBody).then(function (sResponse) {
                    var sData = JSON.parse(sResponse);
                    var objReturn = {
                        CDPTA: data[0].CDPTA,
                        DESCR: data[0].DESCR,
                        CDPTO: data[0].CDPTO,
                        DSPTO: data[0].DSPTO,
                        LTGEO: data[0].LTGEO,
                        LNGEO: data[0].LNGEO,
                        CDEMP: data[0].CDEMP,
                        CDUPT: data[0].CDUPT,
                        DSEMP: sData.data.length > 0 ? sData.data[0].DSEMP : null,
                        INPRP: sData.data.length > 0 ? sData.data[0].INPRP : null,
                    }
                    return objReturn;
                }).catch(function(error){
                    console.log("ERROR: TasaBackendService.obtenerDatosPlantaDist 2: ", error);
                    return null;
                });
            }
            return data1;
        },

        buscarArmador: async function(codigo, usuario){ //pendiente de mover a backend
            var uri = UtilService.getHostService() + "/api/General/Read_Table/";
            var sBody = UtilService.getBodyReadTable();
            sBody.delimitador = "|";
            sBody.fields = ["CDEMP", "DSEMP"];
            sBody.option[0].wa = "CDEMP LIKE '" + codigo + "' AND ESREG = 'S'";
            sBody.p_user = usuario;
            sBody.tabla = "ZV_FLMP";
            var data = await this.http(uri).post(null, sBody).then(function (response) {
                var data = JSON.parse(response);
                return data;
            }).catch(function(error){
                console.log("ERROR: TasaBackendService.buscarArmador: ", error);
                return null;
            });
            return data;
        },

        obtenerEmbarcacion: async function(options, options2){
            var uri = UtilService.getHostService() + "/api/embarcacion/ConsultarEmbarcacion/";
            var sBody = UtilService.getBodyEmba();
            sBody.options = options;
            sBody.options2 = options2;
            sBody.p_user = "BUSQEMB";
            var data = await this.http(uri).post(null, sBody).then(function (response) {
                var data = JSON.parse(response);
                if(data.data){
                    return data.data;
                }else{
                    return null;
                }
            }).catch(function(error){
                console.log("ERROR: TasaBackendService.obtenerEmbarcacion: ", error);
                return null;
            });
            return data;
        },

        obtenerTemporadaVeda: async function(fecha, usuario){
            var uri = UtilService.getHostService() + "/api/General/Read_Table/";
            var sBody = UtilService.getBodyReadTable();
            sBody.delimitador = "|";
            sBody.fields = ["LTINI", "LNINI", "LTFIN", "LGFIN", "MILLA"];
            sBody.option[0].wa = "CDTPC = 'V' AND FHCAL LIKE '" + fecha + "'";
            sBody.p_user = usuario;
            sBody.tabla = "ZFLCLT";
            var data = await this.http(uri).post(null, sBody).then(function (response) {
                var data = JSON.parse(response);
                return data;
            }).catch(function(error){
                console.log("ERROR: TasaBackendService.obtenerTemporadaVeda: ", error);
                return null;
            });
            return data;
        },
        
        obtenerReservas: async function(marea, reserva, flag, usuario){
            var uri = UtilService.getHostService() + "/api/embarcacion/ConsultaReserva/";
            var sBody = UtilService.getConsultaReserva();
            sBody.flagDetalle = flag ? flag : "";
            sBody.marea = marea ? parseInt(marea) : 0;
            sBody.reserva = reserva ? reserva : "";
            sBody.usuario = usuario;
            var data = await this.http(uri).post(null, sBody).then(function (response) {
                var data = JSON.parse(response);
                return data;
            }).catch(function(error){
                console.log("ERROR: TasaBackendService.obtenerReservas: ", error);
                return null;
            });
            return data;
        },

        crearActualizarMarea: async function(sBody){
            var uri = UtilService.getHostService() + "/api/embarcacion/CrearMarea/";
            var data = await this.http(uri).post(null, sBody).then(function (response) {
                var data = JSON.parse(response);
                return data;
            }).catch(function(error){
                console.log("ERROR: TasaBackendService.crearActualizarMarea: ", error);
                return null;
            });
            return data;
        },

        obtenerConfigReservas: async function(usuario){
            var uri = UtilService.getHostService() + "/api/embarcacion/ObtenerConfigReservas/";
            var sBody = UtilService.getBodyConfigRes();
            sBody.usuario = usuario;
            var data = await this.http(uri).post(null, sBody).then(function (response) {
                var data = JSON.parse(response);
                return data;
            }).catch(function(error){
                console.log("ERROR: TasaBackendService.obtenerConfigReservas: ", error);
                return null;
            });
            return data;
        },

        obtenerSuministro: async function(usuario, material){
            var uri = UtilService.getHostService() + "/api/embarcacion/ObtenerSuministro/";
            var sBody = UtilService.getBodySuministro();
            sBody.material = material;
            sBody.usuario = usuario;
            var data = await this.http(uri).post(null, sBody).then(function (response) {
                var data = JSON.parse(response);
                return data;
            }).catch(function(error){
                console.log("ERROR: TasaBackendService.obtenerSuministro: ", error);
                return null;
            });
            return data;
        },

        obtenerEmbaComb: async function(usuario, cdemb){
            var uri = UtilService.getHostService() + "/api/embarcacion/ObtenerEmbaComb/";
            var sBody = UtilService.getBodyEmbaComb();
            sBody.embarcacion = cdemb;
            sBody.usuario = usuario;
            var data = await this.http(uri).post(null, sBody).then(function (response) {
                var data = JSON.parse(response);
                return data;
            }).catch(function(error){
                console.log("ERROR: TasaBackendService.obtenerEmbaComb: ", error);
                return null;
            });
            return data;
        },

        crearReserva: async function(reserva){
            var uri = UtilService.getHostService() + "/api/embarcacion/CrearReserva/";
            var data = await this.http(uri).post(null, reserva).then(function (response) {
                var data = JSON.parse(response);
                return data;
            }).catch(function(error){
                console.log("ERROR: TasaBackendService.crearReserva: ", error);
                return null;
            });
            return data;
        },

        anularReservas: async function(sBody){
            var uri = UtilService.getHostService() + "/api/embarcacion/AnularReserva/";
            var data = await this.http(uri).post(null, sBody).then(function (response) {
                var data = JSON.parse(response);
                return data;
            }).catch(function(error){
                console.log("ERROR: TasaBackendService.anularReservas: ", error);
                return null;
            });
            return data;
        },

        crearVenta: async function(venta){
            var uri = UtilService.getHostService() + "/api/embarcacion/CrearVenta/";
            var data = await this.http(uri).post(null, venta).then(function (response) {
                var data = JSON.parse(response);
                return data;
            }).catch(function(error){
                console.log("ERROR: TasaBackendService.crearVenta: ", error);
                return null;
            });
            return data;
        },

        anularVenta: async function(listaVentas){
            var uri = UtilService.getHostService() + "/api/embarcacion/AnularVenta/";
            var data = await this.http(uri).post(null, listaVentas).then(function (response) {
                var data = JSON.parse(response);
                return data;
            }).catch(function(error){
                console.log("ERROR: TasaBackendService.anularVenta: ", error);
                return null;
            });
            return data;
        },

        obtenerCodZonaArea: async function(cdpta){

        },

        obtenerconsTeorico: async function(embarcacion, motMarea, puerto, usuario){
            var uri = UtilService.getHostService() + "/api/General/ConsultaGeneral/";
            var sBody = UtilService.getConsultaGeneral();
            sBody.nombreConsulta = "CONSGENTEORICO";
            sBody.p_user = usuario;
            sBody.parametro1 = embarcacion;
            sBody.parametro2 = motMarea;
            sBody.parametro3 = puerto;
            var data = await this.http(uri).post(null, sBody).then(function (response) {
                var data = JSON.parse(response);
                return data;
            }).catch(function(error){
                console.log("ERROR: TasaBackendService.obtenerDepartamentos: ", error);
                return null
            });
            return data;
        },

        anularMarea: async function(marea){
            var uri = UtilService.getHostService() + "/api/embarcacion/anularMarea/";
            var sBody = UtilService.getBodyAnularMar();
            sBody.p_marea = marea;
            var data = await this.http(uri).post(null, sBody).then(function (response) {
                var data = JSON.parse(response);
                return data;
            }).catch(function(error){
                console.log("ERROR: TasaBackendService.anularMarea: ", error);
                return null
            });
            return data;
        },

        obtenerEveElim: async function(marea, nroEvento, estructura, usuario){
            var uri = UtilService.getHostService() + "/api/embarcacion/ObtenerEveElim/";
            var sBody = UtilService.getBodyEveElim();
            sBody.marea = marea;
            sBody.numero_evento = nroEvento;
            sBody.estructura = estructura;
            sBody.usuario = usuario;
            var data = await this.http(uri).post(null, sBody).then(function (response) {
                var data = JSON.parse(response);
                return data;
            }).catch(function(error){
                console.log("ERROR: TasaBackendService.obtenerEveElim: ", error);
                return null
            });
            return data;
        },

        obtenerAlmExterno: async function(usuario){
            var uri = UtilService.getHostService() + "/api/embarcacion/ObtenerAlmacenExterno/";
            var sBody = UtilService.getBodyAlmExt();
            sBody.usuario = usuario;
            var data = await this.http(uri).post(null, sBody).then(function (response) {
                var data = JSON.parse(response);
                return data;
            }).catch(function(error){
                console.log("ERROR: TasaBackendService.ObtenerAlmacenExterno: ", error);
                return null
            });
            return data;
        },

        test: function () {
            var latiCalaD = "";
            var latiCalaM = "";
            var uri = UtilService.getHostService() + "/api/General/Read_Table/";
            var sBody = UtilService.getBodyReadTable();
            sBody.delimitador = "|";
            sBody.fields = ["LATGR", "LATMI", "LONGR", "LONMI"];
            sBody.option[0].wa = "LATGR = '" + latiCalaD + "' AND LATMI >= '" + latiCalaM + "' AND LATMI < '" + (latiCalaM + 1) + "' ";
            sBody.order = "LATMI ASCENDING";
            sBody.tabla = "ZFLLLL";
            return this.http(uri).post(null, sBody).then(function (response) {
                var data = JSON.parse(response);
                return data;
            });
        },
        envioCorreoHoroAve: async function (nom_embarcacion, listaHoroAve) {
            var uri = UtilService.getHostService() + "/api/correo/EnviarInfoHorometroAveriado";
            var sBody = UtilService.getBodyCorreoHoroAve();
            sBody.embarcacion.descripcion = nom_embarcacion;
            sBody.embarcacion.eventos = listaHoroAve;
            var data = await this.http(uri).post(null, sBody).then(function (response) {
                var data = JSON.parse(response);
                return data;
            }).catch(function(error){
                console.log("ERROR: TasaBackendService.envioCorreoHoroAve: ", error);
                return null;
            });
            return data;
        },

        obtenerArmadorPropietario: async function(usuario){
            var uri = UtilService.getHostService() + "/api/General/AyudasBusqueda";
            var sBody = UtilService.getConsultaGeneral();
            sBody.nombreAyuda = "BSQAMADORPROP";
            sBody.p_user = usuario;
            var data = await this.http(uri).post(null, sBody).then(function (response) {
                var data = JSON.parse(response);
                return data;
            }).catch(function(error){
                console.log("ERROR: TasaBackendService.obtenerArmadorPropietario: ", error);
                return null;
            });
            return data;
        }

    });

    return new TasaBackend();
});