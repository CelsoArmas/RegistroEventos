sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
    "sap/ui/model/resource/ResourceModel"
], function (JSONModel, Device, ResourceModel) {
	"use strict";

	return {

		createDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		createInitModel: function(){
			var initModel = {
                Form:{
                    INDICADOR: "",
					NRMAR: "",
                    CDMMA: "",
                    OBMAR: "",
                    CDEMB: "",
                    NMEMB: "",
                    MREMB: "",
                    CDPTA: "",
                    CDEMP: "",
                    NAME1: "",
                    INPRP: "",
                    WERKS: "",
                    CNVPS: "",
                    FCVPS: "",
                    LIFNR: "",
                    CPPMS: "",
                    TCBPS: "",
                    CBODP: 0,
                    ESCMA: "",
                    FCCRE: "",
                    HRCRE: "",
                    ATCRE: "",
                    FCMOD: "",
                    HRMOD: "",
                    ATMOD: "",
                    CDTEV: "",
                    DESC_CDTEV: "",
                    FIEVN: "",
                    DESC_CDMMA: "",
                    TXTNOTIF: "",
                    TXTNOTIF1: "",
                    TERRORES: false,
                    VEDAVERIF: false,
                    NUEVOARM: "",
                    OBSCOMB: "",
                    CantTotalPescDecla: "",
                    EsNuevo: false,
					CDSPE: "",
					DSSPE: "",
					INUBC: "",
					ESMAR: "",
					FEARR: "",
                    HEARR: "",
                    FIMAR: "",
                    HIMAR: "",
                    FFMAR: "",
                    HFMAR: "",
                    FEMAR: "",
                    HAMAR: "",
					RUC: "",
                    RAZON: "",
                    CALLE: "",
                    DISTRITO: "",
                    PROVINCIA: "",
                    DEPARTAMENTO: "",
                    AAMAR: "",
                    AXMAR: "",
                    DESCR: "",
                    DESC_INPRP: "",
                    ESBLO: "",
                    FCBLO: "",
                    FXMAR: "",
                    HRBLO: "",
                    HXMAR: "",
                    USBLO: "",
                    CapBodegaPermiso: 0
                },
                Eventos: {
                    BiometriaRest : [],
                    ListaDominios : [],
                    ConfEventos :{},
					TituloEventos: "",
                    CantPescaDescDeclText : "",
                    Lista: [],
                    ListaBck: [],
                    ListaBiometriaElim: [],
                    EvenEliminados: [],
                    PreciosMareaElim: [],
                    DistribFlotaElim: {
                        CDEMB: ""
                    },
                    LeadSelEvento: 0
				},
                Incidental: [],
                Biometria: [],
                DetalleSuministro: {
                    NRRSV: "",
                    DESC_ESRSV: "",
                    CDEMB: "",
                    NMEMB: "",
                    NRMAR: "",
                    DESC_CDMMA: "",
                    DESC_CDTEV: "",
                    FHRSV: "",
                    Lista: []
                },
                Suministro: [],
                ReservasCombustible: [],
                VentasCombustible: [],
                ConfigReservas: {
                    BWART: "",
                    MATNR: "",
                    WERKS: "",
                    Almacenes: [],
                    AlmacenesExt: []
                },
                EmbaComb: {
                    CDTAN: "",
                    MANDT: "",
                    CDEMB: "",
                    CPSDM: "",
                    CVPMS: "",
                    CPPMS: "",
                    CVADM: "",
                    STCMB: ""
                },
                VentaCombustible: {},
                DistribFlota: {
                    Indicador: "",
                    CDPTA: "",
                    DESCR: "",
                    CDPTO: "",
                    DSPTO: "",
                    LTGEO: "",
                    IntLatPuerto: 0,
                    LNGEO: "",
                    IntLonPuerto: 0,
                    FEARR: "",
                    HEARR: "",
                    EMPLA: "",
                    WKSPT: "",
                    CDUPT: "",
                    DSEMP: "",
                    INPRP: "",
                    CDEMP: ""
                },
                MareaAnterior:{
                    NRMAR: "",
                    ESMAR: "",
                    CDMMA: "",
                    FEMAR: "",
                    HAMAR: "",
                    FXMAR: "",
                    HXMAR: "",
                    FIMAR: "",
                    HIMAR: "",
                    FFMAR: "",
                    HFMAR: "",
                    ESCMA: "",
                    DESC_CDMMA: "",
                    EventoMarAnt: {
                        NREVN: "",
                        CDTEV: "",
                        DESC_CDTEV: "",
                        FIEVN: "",
                        HIEVN: "",
                        FFEVN: "",
                        HFEVN: ""
                    }
                },
                EsperaMareaAnt: {

                },
                MareaCLH: {
                    NRMAR: "",
                    EventoCLH:{
                        FIEVN: "",
                        HIEVN: "",
                        NREVN: "",
                        CDTEV: "",
                        HorometrosCLH:[]
                    }
                },
                Config: {
                    visibleArmador: false,
                    visibleBusArmador: false,
                    visibleNueArmador: false,
                    visibleEnlNueArmador: false,
                    visibleBtnArmador: false,
                    visibleBtnEventos: false,
                    visibleEnlDetalleEvento: false,

					visibleArmadorComercial: true,
                    visibleLinkCrearArmador: true,
                    visibleLinkSelecArmador: false,
                    visibleArmadorRuc: false,
                    visibleArmadorRazon: false,
                    visibleArmadorCalle: false,
                    visibleArmadorDistrito: false,
                    visibleArmadorProvincia: false,
                    visibleArmadorDepartamento: false,
                    visibleMotMarea: true,
                    visibleUbiPesca: true,
                    visibleEstMarea: true,
                    visibleFecHoEta: true,
                    visibleFechIni: true,
                    visibleFechFin: true,
                    visibleTabReserva: true,
                    visibleTabVenta: true,
                    visibleTabSepComb: true,
                    readOnlyFechIni: true,
                    readOnlyEstaMar: true,
                    readOnlyMotMarea: true,
                    visibleReserva1: false,
                    visibleReserva2: false,
                    visibleReserva3: false,
                    visibleBtnNuevaReserva: false,
                    visibleCheckReserva: true,
                    visibleAnulaReserva: true,
                    visibleBtnNuevaVenta: true,
                    visibleAnulaVenta: true,
                    visibleCheckVenta: true,
                    visibleVenta1: true,
                    visibleVenta2: true,
                    visibleDetalleEvento: true,
                    visibleAgregarEvento: true,
                    visibleEliminarEvento: true,
                    visibleBtnGuardar: true,
                    visibleBtnSiguiente: true,
                    visibleBtnCrear: true,
                    visibleBtnReabrir: true,
                    visibleBuscarArmador: true,
                    visibleAlmacenReserva: false,
                    visibleAlmacenExterno: false,
                    visibleBtnAtras: false,
                    enableBtnArmador: true,
                    readOnlyUbicPesca: true,
                    readOnlyObs: true,
                    readOnlyFechaEta: true,
                    readOnlyHoraEta: true,
                    readOnlyFechFin: true,
                    readOnlyHorFin: true,
                    readOnlyFecHoEta: true,
                    initSelectKeyTab: "",
					datosCombo: {
                        Departamentos: [],
                        MotivosMarea: [],
                        UbicPesca: [],
                        EstMar: [],
                        TipoEventos: [],
                        Plantas: [],
                        ListaTipoEventos: []
                    }
				},
                FormNewMarea: {
                    Planta: "",
                    Embarcacion: "",
                    EmbarcacionDesc: ""
                },
                DataSession:{
                    User: "FGARCIA",
                    IsAllOk: false,
                    IsRollngComb: false,
                    IsRolRadOpe: false,
                    MareaReabierta: false,
                    RolFlota: "",
                    SoloLectura: false,
                    Type: ""
                },
                RolesFlota:{
                    RolRadOpe: [
                        "pcd:portal_content/com.tasa.SistemaFlota/com.tasa.Roles/com.tasa.flota_ro",
                        "pcd:portal_content/com.tasa.SistemaFlota/com.tasa.Roles/com.tasa.flota_rcp",
                        "pcd:portal_content/com.tasa.SistemaFlota/com.tasa.Roles/com.tasa.flota_ro_protesto"
                    ],
                    RolIngCom: [
                        "pcd:portal_content/com.tasa.SistemaFlota/com.tasa.Roles/com.tasa.flota_acc"
                    ]
                },
                Utils:{
                    VedaVerificada: true,
                    BtnEnabled: false,
                    BckMotMarea: [],
                    ArmadorPropietario: [],
                    TextoConfirmacion: "",
                    VisibleEstCierre: false,
                    VisibleObsvComb: false,
                    OpSistFrio : false,
                    TipoEvento : "1",
                    DescTipoEvento : "",
                    FlagVistaBiometria : false,
                    NroEvento_Incidental : "",
                    NroEvento_Biometria : "",
                    TipoConsulta:"",
                    MensajeGrabacion : "",
                    NumeroMarea : "",
                    MessageItemsDM: [],
                    MessageItemsEP: [],
                    MessageItemsMA: [],
                    TxtBtnSuministro: "",
                    TxtNuevaVentaRes: "",
                    CrearMarea: [],
                    TxtMareaConfirm: "",
                    TxtEmbaConfirm: "",
                    NumeroReservaGen: "",
                    NumeroPedidoGen: "",
                    TituloReviewReVe: "",
                    ConfirmDialog: null,
                    SetInitTab: "",
                    TextoErrorMarea: "",
                    FecVedaMax: "",
                    bckEmbarcacion: null,
                    bckArmador: null,
                    BckFecInicio: "",
                    BckTipoEvento: [],
                    BuscarEmba: false,
                    CargarMarea: false,
                    AppName: "RegEventosPesca"
                },
                InputsDescargas :{
                    CentPlanta : "",
                    DescEmbarcacion : "",
                    DescPlanta : "",
                    Embarcacion : "",
                    Estado : "",
                    FechInicio : "",
                    HoraInicio : "",
                    Matricula : "",
                    Planta : "",
                    TipoPesca : ""
                },
                calendarioPescaCHD :[],
                calendarioPescaCHI :[],
                calendarioPescaVED :[],
                Constantes:{
                    CodUbicSur: "",
                    PorcCalRangComb: "",
                    ValMaxFlujPanga: 250
                },
                HelpHost: "",
                input: null,
                idDialogComp: null,
                helpArma: null,
                user: {
                    name: ""
                },
                EmbaItem: null
			};
			var oModel = new JSONModel(initModel);
			//oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

        createFiltroModel: function(){
            var data = {
                DescUbicacion: "",
                IndPropiedad: "",
                Planta: "",
                TipoEmbarcacion: "",
                ValFijoPlanta: ""
            };
            var oModel = new JSONModel(data);
			return oModel;
        },

        createCombosModel: function(){
            var data = {
                Plantas: [],
                Embarcaciones: [],
                IndPropiedad: [],
                TituloEmba: "",
                NumerosPaginacion: [],
            };
            var oModel = new JSONModel(data);
			return oModel;
        },

        createDataSession: function(){
            var data = {
                User: "FGARCIA",
                IsAllOk: false,
                IsRollngComb: false,
                IsRolRadOpe: false,
                MareaReabierta: false,
                RolFlota: "",
                SoloLectura: false,
                Type: ""
            };
            var oModel = new JSONModel(data);
			return oModel;
        },

        createVisibleModel: function(){
            var data = {
                EnlMarAnterior: false
            };
            var oModel = new JSONModel(data);
			return oModel;
        },

        createResourceModel: function(){
            var config = {
                bundleName: "com.tasa.registroeventospescav2.i18n.i18n"
            };
            var oModel = new ResourceModel(config);
            return oModel;
        },

        createUtilsModel: function(){
            var data = {
                VedaVerificada: true,
                BtnEnabled: false
            };
            var oModel = new JSONModel(data);
			return oModel;
        },

        createFormModel: function(){
            var data = {
                MotMarea: "",
                Embarcacion: "",
                DescEmbarcacion: "",
                MatrEmbarcacion: "",
                SistPesca: "",
                Armador: "",
                DescArmador: "",
                PermisoSur: "",
                FechaPermisoSur: "",
                CapBodegaPermiso: 0,
                CenEmbarcacion: ""
            };
            var oModel = new JSONModel(data);
			return oModel;
        },

        createMareaAnteriorModel: function(){
            var data = {
                Marea: 0,
                MotMarea: "",
                DescMotivoMarea: "",
                EstCierre: "",
                EstMarea: "",
                FecApertura: "",
                FecCierre: "",
                FecFin: "",
                FecInicio: "",
                HorAperttura: "",
                HorCierre: "",
                HorFin: "",
                HorInicio: "",
                EventosMarAnt: {
                    DescTipoEvento: "",
                    Empresa: "",
                    Estado: "",
                    FechFIn: "",
                    FechIni: "",
                    HoraFin: "",
                    HoraIni: "",
                    Numero: 0,
                    Planta: "",
                    Puerto: "",
                    TipoEvento: ""
                }
            };
            var oModel = new JSONModel(data);
			return oModel;
        },

        createUttilitarioModel: function(){
            var data = {
                motivoSinZarpe: ["3", "7", "8"]
            };
            var oModel = new JSONModel(data);
			return oModel;
        },

        createConstantsUtility: function(){
            var data = {
                CARACTERNUEVO: "N",
                CARACTEREDITAR: "E",
                CARACTERBORRAR: "D",
                HelpHost: "",
                input: null,
                idDialogComp: null,
                helpArma: null,
                user: {
                    name: ""
                }
            };
            var oModel = new JSONModel(data);
			return oModel;
        },

        createDistribFlotaModel: function(){
            var data = {
                CentPlanta: "",
                DescEmpresa: "",
                DescPlanta: "",
                DescPuerto: "",
                Editado: false,
                Empresa: "",
                FecArribo: "",
                HorArribo: "",
                Indicador: "",
                IndPropPlanta: "",
                IntLatPuerto: "",
                IntLonPuerto: "",
                LatPuerto: "",
                LonPuerto: "",
                Planta: "",
                Puerto: "",
                UbicPlanta: ""
            };
            var oModel = new JSONModel(data);
			return oModel;
        },

        createConstantesModel: function(){
            var data = {
                CodUbicSur: "",
                PorcCalRangComb: "",
                ValMaxFlujPanga: ""
            };
            var oModel = new JSONModel(data);
			return oModel;
        },

        createPlantasModel: function(){
            var data = {
                Items: []
            };
            var oModel = new JSONModel(data);
			return oModel;
        },

        ListaMareas: function(){
            var data = {
                Propios: [],
                Terceros: [],
                PropiosFiltro: [],
                TercerosFiltro: [],
                Utils:{
                    CountPropios: 0,
                    CountTerceros: 0,
                    SelectedKey: "",
                    TotalPescDecl: 0,
                    readOnlyNuevaMarea: false,
                    readOnlyActualizar: false,
                    readOnlyPescDecl: false,
                    visibleRowsPropios: 0,
                    visibleRowsTerceros: 0,
                    CantEmbProp : 0,
                    CantEmbTerc : 0,
                    PescaDclPropio : 0,
                    PescaDclTercero :0
                }
            };
            var oModel = new JSONModel(data);
			return oModel;
        },
        busquedaEmba: function(){
            var data = {
                HelpHost: "",
                input: null,
                idDialogComp: null,
                helpArma: null,
                user: {
                    name: ""
                },
                Utils:{
                    BuscarEmba: false
                }
            };
            var oModel = new JSONModel(data);
			return oModel;
        },

	};
});