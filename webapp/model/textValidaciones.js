sap.ui.define([], function () {
	"use strict";
	var productItems =
		{
			CantPescaDeclaRestante : 0,
			EspMareaAct: false,
			FechFinEspera : "",
			HoraFinEspera : "",
			INDIC_PROPIEDAD_PROPIOS: "P",
			INDIC_PROPIEDAD_TERCEROS: "T",
			TIPOEVENTOCALA: "3",
			TIPOEVENTODESCARGA: "6",
			TIPOEVENTOSINIESTRO: "8",
			TIPOEVENTOACCIDENTE: "9",
			TIPOEVENTOZARPE: "1",
			TIPOEVENTOLLEGADAZONA: "2",
			TIPOEVENTOESPERA: "7",
			TIPOEVENTOARRIBOPUE: "5",
			TIPOEVENTOSALIDAZONA: "4",
			TIPOEVENTOHOROMETRO: "H",
			TIPOEVENTOTRASVASE: "T",
			MOTIVOPESCADES : [
				{id : "1"},
				{id : "2"}
			],
			EVEVISTABHOROM : [
				{id : "1"},
				{id : "5"},
				{id : "6"},
				{id : "H"},
				{id : "T"}
			],
			EVEVISTABEQUIP : [
				{id : "1"},
				{id : "5"}
			],
			EVEVISTABPEDCL : [
				{id : "3"}
			],
			EVEVISTABPEDSC : [
				{id : "6"}
			],
			EVEVISTABBIOME : [
				{id : "3"}
			],
			EVEVISUEMPRESA : [
				{id : "5"},
				{id : "6"}
			],
			EVEVISZONPESCA : [
				{id : "2"},
				{id : "3"},
				{id : "4"},
				{id : "8"}
			],
			EVEVISFECHABIO : [
				{id : "3"}
			],
			EVEVISFECHAFIN : [
				{id : "3"},
				{id : "6"},
				{id : "7"}
			],
			EVEVISESTAOPER : [
				{id : "1"},
				{id : "5"},
				{id : "6"},
				{id : "2"},
				{id : "4"}
			],
			READONLYZONPES : [
				{id : "3"},
				{id : "4"}
			],
			EVEFEINIFEFIN : [ // Eventos cuya fecha de inicio puede ser igual a la fecha fin del evento anterior
				{id : "3"},
				{id : "4"},
				{id : "6"},
				{id : "7"}
			],
			COPIARZONAPESC : [
				{id : "3"},
				{id : "4"}
			],
			KeyTabs : [
				{
					"General" : "Gen",
					"Distribucion" : "Dist",
					"Biometria" : "Biom",
					"Pesca descargada" : "PDesc",
					"Pesca declarada" : "PDecl",
					"Horómetro" : "Horo",
					"Equipamiento" : "Equi",
					"Siniestro" : "Sini",
					"Accidente" : "Acci"
				}
			],
			//////////////////////////////////////////////////////////
			eventAttTabGeneral: [
					[],
					[
						{id : "FIEVN"},
						{id : "HIEVN"},
						{id : "ESOPE"},
						{id : "STCMB"}
					],
					[
						{id : "CDZPC"},
						{id : "FIEVN"},
						{id : "HIEVN"}
					],
					[
						{id : "FIEVN"},
						{id : "HIEVN"},
						{id : "FFEVN"},
						{id : "HFEVN"}
					],
					[
						{id : "CDZPC"},
						{id : "FIEVN"},
						{id : "HIEVN"}
					],
					[
						{id : "CDPTO"},
						{id : "CDPTA"},
						{id : "CDEMP"},
						{id : "FIEVN"},
						{id : "HIEVN"},
						{id : "ESOPE"},
						{id : "STCMB"}
					],
					[
						{id : "FIEVN"},
						{id : "HIEVN"},
						{id : "FFEVN"},
						{id : "HFEVN"},
						{id : "FechProduccion"}, //valor no viene de la estructura de modelo
						{id : "STCMB"}
					],
					[
						{id : "FIEVN"},
						{id : "HIEVN"}
					],
					[
						{id : "CDZPC"},
						{id : "FIEVN"},
						{id : "HIEVN"}
					],
					[
						{id : "CDZPC"},
						{id : "FIEVN"},
						{id : "HIEVN"}
					],
					[
						{id : "FIEVN"},
						{id : "HIEVN"},
						{id : "ESOPE"},
						{id : "CDMLM"}
					],
					[
						{id : "CDPTO"},
						{id : "CDPTA"},
						{id : "CDEMP"},
						{id : "FIEVN"},
						{id : "HIEVN"},
						{id : "ESOPE"},
						{id : "CDMLM"}
					],
					[
						{id : "CDPTO"},
						{id : "CDPTA"},
						{id : "CDEMP"},
						{id : "FIEVN"},
						{id : "HIEVN"},
						{id : "ESOPE"},
						{id : "CDMNP"}
					],
					[
						{id : "CDPTO"},
						{id : "CDPTA"},
						{id : "CDEMP"},
						{id : "FIEVN"},
						{id : "HIEVN"},
						{id : "ESOPE"},
						{id : "CDMLM"},
						{id : "CDMNP"}
					],
					[
						{id : "FIEVN"},
						{id : "HIEVN"},
						{id : "ESOPE"}
					],
					[
						{id : "CDPTO"},
						{id : "CDPTA"},
						{id : "CDEMP"},
						{id : "FIEVN"},
						{id : "HIEVN"},
						{id : "ESOPE"}
					],
					[
						{id : "STCMB"}
					],
					[
						{id : "STCMB"}
					],
					[
						
					],
					[
						{id : "CDPTO"},
						{id : "CDPTA"},
						{id : "CDEMP"},
						{id : "FIEVN"},
						{id : "HIEVN"},
						{id : "ESOPE"}
					],
					[
						{id : "FIEVN"},
						{id : "HIEVN"},
						{id : "STCMB"}
					],
					[
						
					]

				
			],
			eventAttTabGeneral_1 : [
				{id : "FIEVN"},
				{id : "HIEVN"},
				{id : "ESOPE"},
				{id : "STCMB"}
			],
			eventAttTabGeneral_2 : [
				{id : "CDZPC"},
				{id : "FIEVN"},
				{id : "HIEVN"}
			],
			eventAttTabGeneral_3 : [
				{id : "FIEVN"},
				{id : "HIEVN"},
				{id : "FFEVN"},
				{id : "HFEVN"}
			],
			eventAttTabGeneral_4 : [
				{id : "CDZPC"},
				{id : "FIEVN"},
				{id : "HIEVN"}
			],
			eventAttTabGeneral_5 : [
				{id : "CDPTO"},
				{id : "CDPTA"},
				{id : "CDEMP"},
				{id : "FIEVN"},
				{id : "HIEVN"},
				{id : "ESOPE"},
				{id : "STCMB"}
			],
			eventAttTabGeneral_6 : [
				{id : "FIEVN"},
				{id : "HIEVN"},
				{id : "FFEVN"},
				{id : "HFEVN"},
				{id : "FechProduccion"}, //valor no viene de la estructura de modelo
				{id : "STCMB"}
			],
			eventAttTabGeneral_7 : [
				{id : "FIEVN"},
				{id : "HIEVN"}
			],
			eventAttTabGeneral_8 : [
				{id : "CDZPC"},
				{id : "FIEVN"},
				{id : "HIEVN"}
			],
			eventAttTabGeneral_9 : [
				{id : "CDZPC"},
				{id : "FIEVN"},
				{id : "HIEVN"}
			],
			eventAttTabGeneral_10 : [
				{id : "FIEVN"},
				{id : "HIEVN"},
				{id : "ESOPE"},
				{id : "CDMLM"}
			],
			eventAttTabGeneral_11 : [
				{id : "CDPTO"},
				{id : "CDPTA"},
				{id : "CDEMP"},
				{id : "FIEVN"},
				{id : "HIEVN"},
				{id : "ESOPE"},
				{id : "CDMLM"}
			],
			eventAttTabGeneral_12 : [
				{id : "CDPTO"},
				{id : "CDPTA"},
				{id : "CDEMP"},
				{id : "FIEVN"},
				{id : "HIEVN"},
				{id : "ESOPE"},
				{id : "CDMNP"}
			],
			eventAttTabGeneral_13 : [
				{id : "CDPTO"},
				{id : "CDPTA"},
				{id : "CDEMP"},
				{id : "FIEVN"},
				{id : "HIEVN"},
				{id : "ESOPE"},
				{id : "CDMLM"},
				{id : "CDMNP"}
			],
			eventAttTabGeneral_14 : [
				{id : "FIEVN"},
				{id : "HIEVN"},
				{id : "ESOPE"}
			],
			eventAttTabGeneral_15 : [
				{id : "CDPTO"},
				{id : "CDPTA"},
				{id : "CDEMP"},
				{id : "FIEVN"},
				{id : "HIEVN"},
				{id : "ESOPE"}
			],
			eventAttTabGeneral_16 : [
				{id : "STCMB"}
			],
			eventAttTabGeneral_17 : [
				{id : "STCMB"}
			],
			eventAttTabGeneral_18 : [
				
			],
			eventAttTabGeneral_19 : [
				{id : "CDPTO"},
				{id : "CDPTA"},
				{id : "CDEMP"},
				{id : "FIEVN"},
				{id : "HIEVN"},
				{id : "ESOPE"}
			],
			eventAttTabGeneral_20 : [
				{id : "FIEVN"},
				{id : "HIEVN"},
				{id : "STCMB"}
			],
			eventAttTabGeneral_21 : [
				
			],
			EVEVISTABFECHAFIN : [
				{id : "3"},
				{id : "6"},
				{id : "7"}
			],
			MOTIVOMARPESCA : [
				{id : "1"},
				{id : "2"}
			],
			MOTIVOSINZARPE : [
				{id : "3"},
				{id : "7"},
				{id : "8"}
			],
			EVEPERVALFECHA : [
				{id : "5"},
				{id : "6"},
				{id : "7"}
			],
			visible : {
				VisibleDescarga :false,
				MotiLimitacion :false,
				MotiNoPesca :false,
				FechFin: false,
				Links:false,
				LinkRemover:false,
				LinkDescartar:false,
				TabHorometro : false,
				VisibleObsvComb:false,
				VisibleObservAdicional :false
			}
		}

	return productItems;
});