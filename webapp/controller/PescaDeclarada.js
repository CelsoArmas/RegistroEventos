sap.ui.define([
	"sap/ui/base/ManagedObject",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
	"sap/ui/integration/library",
    "sap/m/MessageBox",
], function(
	ManagedObject,
    JSONModel,
    MessageToast,
    integrationLibrary,
    MessageBox
) {
	"use strict";

	return ManagedObject.extend("com.tasa.registroeventospescav2.controller.PescaDeclarada", {

        constructor: function(oView,sFragName,o_this) {

            this._oView = oView;
            var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.session);
            let flag = oStore.get("flagFragment");
            if(flag){
                this._oControl = sap.ui.xmlfragment(oView.getId(), "com.tasa.registroeventospescav2.fragments."+ sFragName,this);
            }
            this._bInit = false;
            this.ctr = o_this;

        },

        onButtonPress3:function(o_event){
            console.log(o_event);
        },

        getcontrol:function(){
            return this._oControl;
        },

        validarPescaDeclarada: function(verMensajes){
            this.oBundle = this.ctr.getOwnerComponent().getModel("i18n").getResourceBundle();
            var bOk = true;
            var motivo = this.ctr._motivoMarea; //motivo de marea de modelo detalle marea
            var eventoActual = this.ctr._listaEventos[this.ctr._elementAct]; //modelo del evento actual
            var pescaDeclarada = eventoActual.ListaPescaDeclarada;
            for (let index = 0; index < pescaDeclarada.length; index++) {
                const element = pescaDeclarada[index];
                var valorPesca = null;
                var mensaje = "";
                if(motivo == "1" || motivo == "2"){
                    if(motivo === "1"){
                        valorPesca = element.PorcPesca;
                        mensaje = this.oBundle.getText("ALGPORCPESCACERO");
                    }else{
                        valorPesca = element.CNPCM;
                        mensaje = this.oBundle.getText("ALGCANTPESCACERO"); 
                    }

                    if(valorPesca == "" || valorPesca == undefined || Number(valorPesca) <= 0){
                        bOk = false;
                        if(verMensajes){
                            this.ctr.agregarMensajeValid("Error",mensaje);
                            //MessageBox.error(mensaje);
                        }   
                    }

                    if(bOk && motivo == "1"){
                        if(element.ZMODA < 1){
                            bOk = false;
                            if(verMensajes){
                                mensaje = "";//no se encontro en el pool de mensajes ALGVALMODACERO
                                MessageBox.error(mensaje);
                            }
                        }


                    }

                    if(!bOk){
                        break;
                    }
                }
                
            }

            return bOk;
        },

        calcularPescaDeclarada: function(){
            var eventoActual = this.ctr._listaEventos[this.ctr._elementAct]; //modelo del evento actual
            var cantPescaDec = eventoActual.ListaPescaDeclarada.length;
            var cantTotal = eventoActual.CantTotalPescDecla;
            if(cantTotal > 0 && cantPescaDec > 0){
                var pescaDecla = eventoActual.ListaPescaDeclarada;
                for (let index = 0; index < pescaDecla.length; index++) {
                    const element = pescaDecla[index];
                    var porcPesca = element.PorcPesca;
                    element.Editado = true;
                    element.PorcPesca = porcPesca;
                    element.CantPesca = cantTotal * (porcPesca * 0.01);
                    element.CNPCM = Number(element.CantPesca).toFixed(2);
                }
            }
            this._oView.getModel("eventos").updateBindings(true);
            //refrescar modelo
        },

        validarPorcPesca: function(){
            var bOk = true;
            this.oBundle = this.ctr.getOwnerComponent().getModel("i18n").getResourceBundle();
            var eventoActual = this.ctr._listaEventos[this.ctr._elementAct]; //modelo del evento actual
            var cantPescaDec = eventoActual.ListaPescaDeclarada.length;
            var cantTotal = eventoActual.CantTotalPescDecla;
            if(cantTotal > 0 && cantPescaDec > 0){
                var pescaDeclarada = eventoActual.ListaPescaDeclarada;
                var porcTotal = 0;
                for (let index = 0; index < pescaDeclarada.length; index++) {
                    const element = pescaDeclarada[index];
                    var porcPesca = element.PorcPesca;
                    porcPesca = porcPesca != null ? porcPesca : 0;
                    porcTotal += porcPesca;
                }

                if(porcTotal < 100){
                    bOk = false;
                    var mssg = this.oBundle.getText("PORCPESCMENOR100");
                    MessageBox.error(mssg);
                }else if(porcTotal > 100){
                    bOk = false;
                    var mssg = this.oBundle.getText("PORCPESCMAYOR100");
                    MessageBox.error(mssg);
                }
            
            }
            return bOk;
        },

        calcularCantTotalPescDeclEve: function(){
            var eventoActual = this.ctr._listaEventos[this.ctr._elementAct]; //modelo del evento actual
            var pescaDeclarada = eventoActual.ListaPescaDeclarada;
            var cantTotal = 0;
            for (let index = 0; index < pescaDeclarada.length; index++) {
                const element = pescaDeclarada[index];
                var cantPesca = element.CNPCM;
                cantPesca = cantPesca != null ? cantPesca : 0;
                cantTotal += cantPesca;
            }
            eventoActual.CantTotalPescDecla = cantTotal;
            this._oView.getModel("eventos").updateBindings(true);
            //refrescar modelo
        },

        validarCantidadTotalPesca:async function(){
            var bOk = true;
            this.oBundle = this.ctr.getOwnerComponent().getModel("i18n").getResourceBundle();
            var detalleMarea = this.ctr._FormMarea;//modelo de detalle de marea
            var indProp =  this.ctr._indicadorProp;//obtener indicador de propeidad del modelo de marea
            var cantTotal = 0;
            cantTotal = await this.obtenerCantTotalDeclMarea(0);

            if(indProp == "T" && (cantTotal == null || cantTotal == 0)){
                var mssg = this.oBundle.getText("CANTPESCANOCERO");
                this.ctr.agregarMensajeValid("Error", mssg);
                bOk = false;
            }

            return bOk;
        },
        obtenerCantTotalDeclMarea : async function(nroEventoTope){
            let cantTotal_v = Number(0);
            let codEventoCala = "3";
            let indActual = this.ctr._elementAct;
            let nodoEventos = this.ctr._listaEventos;
            let eventoConsultado =  this.ctr._listaEventos[indActual].NREVN;
            let cantTotal = Number(0);
	
            for (let i = 0; i < nodoEventos.length; i++) {
                let nroEvento = nodoEventos[i].NREVN;		
                let tipoEvento = nodoEventos[i].CDTEV;
                this.ctr._elementAct = i; 
                
                if (tipoEvento == codEventoCala) {
                    await this.ctr.obtenerPescaDeclarada();
                    if (eventoConsultado == nroEvento) {
                        if (nodoEventos[i].CantTotalPescDecla != null) {
                            let cantidadPescaDecl = nodoEventos[i].CantTotalPescDecla ? nodoEventos[i].CantTotalPescDecla : 0;
                            cantTotal += Number(cantidadPescaDecl);
                        }
                    } else {       
                          let cantidadPescaDecl = nodoEventos[i].CantTotalPescDecla ? nodoEventos[i].CantTotalPescDecla : 0;             
                          cantTotal += Number(cantidadPescaDecl);
                    }
                } 
                
                if (nroEvento == nroEventoTope) {
                    break;
                }
            }
	
	
            cantTotal_v = cantTotal;
            
            this.ctr._FormMarea.CantTotalPescDecla = cantTotal;
            this.ctr._elementAct = indActual;

            return cantTotal_v;
        },
        buscarEspeciePopup: function (oEvent) {

            let me = this;
            me.getDialog_add_especie().open();
            if (this.ctr._motivoMarea == "1") {
                sap.ui.getCore().byId("fe_popup_cantPesca_2").setVisible(false);
            
                        
            } else {
                sap.ui.getCore().byId("fe_popup_cantPesca_2").setVisible(true);
            }
            
		},
        getDialog_add_especie: function () {
            if (!this.oDialog_e) {
                this.oDialog_e = sap.ui.xmlfragment("com.tasa.registroeventospescav2.fragments.Popup_especie_pescaDcl", this);
                this._oView.addDependent(this.oDialog_e);
            }
            return this.oDialog_e;
        },
        deleteItemsBiometria: function(oevent){
            let tablaBio = this._oView.byId("tablePescaDesclarada");
            let ListadeIndices  = tablaBio.getSelectedIndices();

            /*****************************ELIMINACION DE PESCA DECLARADA************************************** */
            let ListaPescaDecl = this._oView.getModel("eventos").getData().ListaPescaDeclarada;
            for (var i = ListaPescaDecl.length - 1; i >= 0; i--) {
                for (let index = 0; index < ListadeIndices.length; index++) {
                    if(ListadeIndices[index] == i){
                        ListaPescaDecl.splice(i, 1);
                    }
                    
                }
                    
            }
            this._oView.getModel("eventos").setProperty("/ListaPescaDeclarada",ListaPescaDecl);
        },

        obtenerEspecies: function(){
            let nodoPescaDeclarada = this._oView.getModel("eventos").getData().ListaPescaDeclarada;
			let motivoMarea = this.ctr._motivoMarea;
			let especie = sap.ui.getCore().byId("cb_especies_espec_2").getSelectedKey();
			let cantPesca = sap.ui.getCore().byId("ip_especies_cp_2").getValue();
			let especiePermitida = this.ctr._listaEventos[this.ctr._elementAct].EspePermitida;//trae vacio
            let bOk = true;
            let Pesca= {};
            
            if(especie == ""){
                let nomCampo = this.ctr.obtenerMensajesCamposValid("Especie");
                let mensaje = this.ctr.oBundle.getText("MISSINGFIELD", nomCampo);
                this.ctr.agregarMensajeValid("Error", mensaje);
            }else{
                for (let i = 0; i < nodoPescaDeclarada.length; i++) {			
                    if (nodoPescaDeclarada[i].CDSPC == especie ) {
                        bOk = false;
                        let mensaje = this.ctr.oBundle.getText("EXISTEESPDECLARADA");
                        this.ctr.agregarMensajeValid("Error", mensaje);
                        break;
                    }
                                             
                }
            }
			
			
			if (bOk) {
				if (!this._containsKey(especiePermitida,especie)) {
					let permisoEspecies = this.ctr._FormMarea.EspPermitida; //falta cargar data consultarPermisoPesca
					let especieZonaPesca = this.ctr._listaEventos[this.ctr._elementAct].EspeZonaPesca;
					let especieVeda = this.ctr._listaEventos[this.ctr._elementAct].EspeVeda;
					let obsvEspecie = "";
					let espOk = true;
								
					if (permisoEspecies == null || permisoEspecies.length == 0 || (permisoEspecies != null && !this._containsKey(permisoEspecies,especie))) {
						espOk = false;
						obsvEspecie += this.ctr.oBundle.getText("EMBNOPERMISOESP") + " ";
					}
					
					if (especieZonaPesca == null || especieZonaPesca.length == 0 || (especieZonaPesca != null && !this._containsKey(especieZonaPesca,especie))) {
						espOk = false;
						obsvEspecie += this.ctr.oBundle.getText("ESPNOPERMITZONA") + " ";
					}
					
					if ((especieVeda != null || especieVeda.length == 0) && this._containsKey(especieVeda,especie)) {
						espOk = false;
						obsvEspecie += this.ctr.oBundle.getText("ESPECIEENVEDA") + " ";
					}
				
					if (!espOk) {
						this.ctr._listaEventos[this.ctr._elementAct].ObseAdicional = this.ctr.oBundle.getText("OBSADICCALAESPNOVALIDA");
						this.ctr.modeloVisible.VisibleObservAdicional = true;
					}
				
					Pesca.Observacion =obsvEspecie;
				}
                if(motivoMarea == "2"){
                    this.ctr._listaEventos[this.ctr._elementAct].ListaPescaDeclarada.push({
                        CDSPC: especie,
                        DSSPC: sap.ui.getCore().byId("cb_especies_espec_2").getSelectedItem().getText(),
                        PorcPesca: "",
                        CNPCM: Number(cantPesca).toFixed(2),
                        DSUMD: this.ctr._ConfiguracionEvento.calaDescUMPescaDeclDesc,
                        UnidMedida: this.ctr._ConfiguracionEvento.calaDescUMPescaDecl,
                        ZMODA: "",
                        OBSER: Pesca.Observacion,
                        Indicador:"N"
                     });

                     let lista_PescaDecl = this.ctr._listaEventos[this.ctr._elementAct].ListaPescaDeclarada;
                     let cantTotPescDcl = Number(0);
                     for (let index = 0; index < lista_PescaDecl.length; index++) {
                         const element = lista_PescaDecl[index];
                         cantTotPescDcl = cantTotPescDcl + Number(element.CNPCM);
                     }
                     this.ctr._listaEventos[this.ctr._elementAct].CantTotalPescDecla = cantTotPescDcl;

                }else{
                    this.ctr._listaEventos[this.ctr._elementAct].ListaPescaDeclarada.push({
                        CDSPC: especie,
                        DSSPC: sap.ui.getCore().byId("cb_especies_espec_2").getSelectedItem().getText(),
                        PorcPesca: "",
                        CNPCM: "",
                        DSUMD: this.ctr._ConfiguracionEvento.calaDescUMPescaDeclDesc,
                        UnidMedida: this.ctr._ConfiguracionEvento.calaDescUMPescaDecl,
                        ZMODA: "",
                        OBSER: Pesca.Observacion,
                        Indicador:"N"
                     });
                }
				

                 this._oView.getModel("eventos").updateBindings(true);
                
			}

            this.getDialog_add_especie().close();
        },

        cerrarPopup_esp :function(){
            this.getDialog_add_especie().close();
        },
        _containsKey :function(Lista_Busq,cod_especie){
            let especieEncontrada = false;
            for (let index = 0; index < Lista_Busq.length; index++) {
                let codEspe = Lista_Busq[index].CodEspecie ? Lista_Busq[index].CodEspecie : Lista_Busq[index].CDSPC;
                if(codEspe == cod_especie){
                    especieEncontrada = true;
                }
            }

            return especieEncontrada;

        }


	});
});