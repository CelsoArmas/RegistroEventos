sap.ui.define([
	'sap/ui/model/FilterOperator',
    'sap/ui/model/Filter',
    "sap/ui/core/syncStyleClass",
    'sap/ui/core/Fragment',
	"sap/ui/base/ManagedObject",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
	"sap/ui/integration/library",
    "sap/m/MessageBox",
    "../Service/TasaBackendService",
	"com/tasa/registroeventospescav2/controller/Utils",
	"sap/ui/test/matchers/Matcher"
], function(
	FilterOperator,
	Filter,
	syncStyleClass,
	Fragment,
	ManagedObject,
	JSONModel,
	MessageToast,
	library,
	MessageBox,
	TasaBackendService,
	Utils,
	Matcher
) {
	"use strict";

	return ManagedObject.extend("com.tasa.registroeventospescav2.controller.Biometria", {

        constructor: function(oView,sFragName,idBiometria, oThis) {

            this._oView = oView;
            var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.session);
            let flag = oStore.get("flagFragment");
            if(flag){
                this._oControl = sap.ui.xmlfragment(oView.getId(), "com.tasa.registroeventospescav2.fragments."+ sFragName,this);
            }
            this.ctr = oThis;
            this._navBio = idBiometria;
            console.log("TextoNav : " + idBiometria);
            this._oView.byId("table_biometria").destroyColumns();
            this.getTableDefault();

        },

        onButtonPress3:function(){
            //console.log(o_event);
            let mod = this.ctr.getOwnerComponent().getModel("DetalleMarea");
            console.log("TextoNav2 : " + this._navBio);
            var i_tme =  this._oView.byId("idTallaMenor").getValue();
            var i_tma =  this._oView.byId("idTallaMayor").getValue();
            this.ctr._listaEventos[this.ctr._elementAct].TallaMin = i_tme;
            this.ctr._listaEventos[this.ctr._elementAct].TallaMax = i_tma;
            mod.setProperty("/Utils/TallaMin",i_tme);
            mod.setProperty("/Utils/TallaMax",i_tma);

            let v_rest = i_tma - i_tme;
            let v_sumMen = Number('0');
            let v_tallamAyorA = Number(i_tme) + Number((2*v_rest));
            let v_tallamAyorB = Number(i_tme) + Number(v_rest);
            this._oView.byId("table_biometria").destroyColumns();

            this.setColumnDinamic("Cod. Especie","","CodEspecie");
            this.setColumnDinamic("Especie","","Especie");

            if(this.ctr._motivoMarea == "2"){
                var d1 = Number(i_tme);
                if(v_rest > 0){
                    for (var i=d1; i<= v_tallamAyorA; i++){
    
                        if(i==d1){v_sumMen = Number(d1);}
                        else{v_sumMen = Number(v_sumMen) + Number('0.5');}
    
                        console.log("ddd : " + v_sumMen);
                        let idCol = "col_" + i;
                        this.setColumnDinamic(v_sumMen,idCol,idCol);
                    }
                }

            }else if(this.ctr._motivoMarea == "1"){
                var d1 = Number(i_tme);
                if(v_rest > 0){
                    for (var i=d1; i<= v_tallamAyorB; i++){
    
                        if(i==d1){v_sumMen = Number(d1);}
                        else{v_sumMen = Number(v_sumMen) + Number('1');}
    
                        console.log("ddd : " + v_sumMen);
                        let idCol = "col_" + i;
                        this.setColumnDinamic(v_sumMen,idCol,idCol);
                    }
                }

            }

            this.setColumnDinamic("Moda","","Moda");
            this.setColumnDinamic("Muestra","","Muestra");
            this.setColumnDinamic("Porc. Juveniles","","PorcJuveniles");

            //this._oView.getModel("eventos").updateBindings(true);

        },

        getTableDefault:function(){

            this.setColumnDinamic("Cod. Especie","","CodEspecie");
            this.setColumnDinamic("Especie","","Especie");
            this.setColumnDinamic("Moda","","Moda");
            this.setColumnDinamic("Muestra","","Muestra");
            this.setColumnDinamic("Porc. Juveniles","","PorcJuveniles");

        },

        setColumnDinamic:function(textCol,idCol,paramModel){
            //let CampoSet = 'eventos>' + paramModel; //"{eventos>" + paramModel + "}";
            let that = this;
            if(idCol != ""){
                let CampoSet = 'eventos>' + paramModel;
                this._oView.byId("table_biometria").addColumn( new sap.ui.table.Column(idCol,{
                    label: new sap.m.Label({
                        text: textCol 
                    }),
                    template : new sap.m.Input({
                        type: "Number",
                        value: {
                            path :CampoSet,
                            type: 'sap.ui.model.type.Integer',
                            constraints : {
                                minimum: 0,
                                maximum: 99
                            }
                        },//CampoSet, 
                        liveChange : function(evt){
                            that.CargaDatosBiometria(evt);
                        }
                    }),
                    width : '4rem'
                }));
            }
            else{
                let CampoSet =  "{eventos>" + paramModel + "}";
                if(paramModel == "Moda" || paramModel == "Muestra" || paramModel == "PorcJuveniles"){
                    this._oView.byId("table_biometria").addColumn( new sap.ui.table.Column({
                        label: new sap.m.Label({
                            text: textCol 
                        }),
                        template : new sap.m.Text({
                            text: CampoSet 
                        }),
                        width : '7.5rem'
                    }));
                }else{
                    this._oView.byId("table_biometria").addColumn( new sap.ui.table.Column({
                        label: new sap.m.Label({
                            text: textCol 
                        }),
                        template : new sap.m.Text({
                            text: CampoSet 
                        }),
                        width : '10rem'
                    }));
                }
            }
        },
        CargaDatosBiometria :async function(event){

            let myPattern = /^[+]?([0-9]+(?:[\.][0-9]*)?|\.[0-9]+)$/;
            let value = event.getParameter("value");
            let idMod = event.getParameter("id");
            let valid = false;

            if(!value.match(myPattern)){
                if(value == ""){
                    valid = true
                    sap.ui.getCore().byId(idMod).setValue("");
                }
            }else{
                valid = true
            }

            if(!valid){
                sap.ui.getCore().byId(idMod).setValue("0");
            }else{
                let cantidadCol = Number(event.getSource().getParent().getAggregation("cells").length);
                let lista_Cols = cantidadCol -3;
                let o_control_muestra = event.getSource().getParent().getAggregation("cells")[cantidadCol - 2];
                let o_control_porcPesca = event.getSource().getParent().getAggregation("cells")[cantidadCol - 1];
                let o_control_moda = event.getSource().getParent().getAggregation("cells")[cantidadCol - 3];
                let TallaMinPorcJuvenil = Number(0);
                let col_CodEspecie = event.getSource().getParent().getAggregation("cells")[0];
                let o_Source = event.getSource();
                let ser_medidaMin = await TasaBackendService.obtenerMedidaEspecie(col_CodEspecie.getProperty("text"), this.ctr.getCurrentUser());
                TallaMinPorcJuvenil = Number(ser_medidaMin.data[0].TMMIN);
                console.log(o_Source.getParent().getParent().getAggregation("columns")[0].getAggregation("label").getProperty("text"));
            
                let sumaTotal_Muestra = Number(0);
                let sumaMuestraJuvenil = Number(0);
                let v_Moda = Number(0);
                let v_cant_col = Number(0);
                for(let i = 2; i < lista_Cols; i++){
                    let talla_col = Number(o_Source.getParent().getParent().getAggregation("columns")[i].getAggregation("label").getProperty("text"));
                    let v_col = o_Source.getParent().getAggregation("cells")[i];
                    if(idMod == v_col.sId){
                        if(v_cant_col<value){
                            v_cant_col = value;
                            v_Moda = talla_col;
                        }
                        sumaTotal_Muestra += Number(value);
                    }else{
                        let v_sum = v_col.getProperty("value") == '' ? Number(0) : Number(v_col.getProperty("value"));
                        if(v_cant_col<v_sum){
                            v_cant_col = v_sum;
                            v_Moda = talla_col;
                        }
                        sumaTotal_Muestra += v_sum;
                    }
                    
                    if(talla_col < TallaMinPorcJuvenil){
                        if(idMod == v_col.sId){
                            sumaMuestraJuvenil += Number(value);
                        }else{
                            let v_sum = v_col.getProperty("value") == '' ? Number(0) : Number(v_col.getProperty("value"));
                            sumaMuestraJuvenil += v_sum;
                        } 
                    }
                }
                o_control_moda.setText(Utils.formatoDosDecimales(v_Moda));
                o_control_muestra.setText(sumaTotal_Muestra);
                let calculo_porc = Number(0);
                calculo_porc = (sumaMuestraJuvenil * 100)/sumaTotal_Muestra
                let cal_fix =  calculo_porc.toFixed(2);
                o_control_porcPesca.setText(cal_fix + "%")

                //----------------------------Lista pesca declarada -----------------//
                let ListaPescaDeclarada = this.ctr._listaEventos[this.ctr._elementAct].ListaPescaDeclarada;
                let ListaBiometria = this.ctr._listaEventos[this.ctr._elementAct].ListaBiometria;
                let Muestra_Total = Number(0);
                for(let j = 0; j < ListaBiometria.length; j++){
                    Muestra_Total +=  Number(ListaBiometria[j].Muestra);
                }

                for(let j = 0; j < ListaBiometria.length; j++){
                    for(let i = 0; i < ListaPescaDeclarada.length; i++){
                        if(ListaPescaDeclarada[i].CDSPC == ListaBiometria[j].CodEspecie){
                            let porcentPD = Number(0);
                            porcentPD = (Number(ListaBiometria[j].Muestra) * 100)/Muestra_Total;
                            ListaPescaDeclarada[i].PorcPesca = porcentPD.toFixed(2);
                            ListaPescaDeclarada[i].ZMODA = Utils.formatoDosDecimales(ListaBiometria[j].Moda);
                        }
                    }
                }
                
                this.ctr.onActionCalcCantPescaDecla();
            }
            


        },

        getcontrol:function(){
            return this._oControl;
        },

        handleTableSelectDialogPress: function (oEvent) {

            let me = this;
            me.getDialog_add_especie().open();
            if (this.ctr._motivoMarea == "1") {
                sap.ui.getCore().byId("fe_popup_cantPesca").setVisible(false);
            
                        
            } else {
                sap.ui.getCore().byId("fe_popup_cantPesca").setVisible(true);
            }
            
		},
        getDialog_add_especie: function () {
            if (!this.oDialog_e) {
                this.oDialog_e = sap.ui.xmlfragment("com.tasa.registroeventospescav2.fragments.Popup_especie", this);
                this._oView.addDependent(this.oDialog_e);
            }
            return this.oDialog_e;
        },
        cerrarPopup_esp :function(){
            this.getDialog_add_especie().close();
        },

        _configDialog: function (oButton, oDialog) {

			// Multi-select if required
			// var bMultiSelect = !!oButton.data("multi");
			// oDialog.setMultiSelect(bMultiSelect);

			// toggle compact style
			syncStyleClass("sapUiSizeCompact", this._oView, oDialog);
		},

        handleSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("descripcion", FilterOperator.Contains, sValue);
			var oBinding = oEvent.getSource().getBinding("items");
            console.log(oBinding);
            oBinding.filter([oFilter]);
            if(oBinding.aLastContextData.length == 0){
                var oFilter2 = new Filter("id", FilterOperator.Contains, sValue);
                oBinding.filter([oFilter2]);
            }
		},

        obtenerEspecies: function(){
            let nodoPescaDeclarada = this._oView.getModel("eventos").getData().ListaPescaDeclarada;
            let enodoPescaDeclarada = this._oView.getModel("eventos").getData().eListaPescaDeclarada;
			let motivoMarea = this.ctr._motivoMarea;
			let especie = sap.ui.getCore().byId("cb_especies_espec").getSelectedKey();
			let cantPesca = sap.ui.getCore().byId("ip_especies_cp").getValue();
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
                        DSSPC: sap.ui.getCore().byId("cb_especies_espec").getSelectedItem().getText(),
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
                        DSSPC: sap.ui.getCore().byId("cb_especies_espec").getSelectedItem().getText(),
                        PorcPesca: "",
                        CNPCM: "",
                        DSUMD: this.ctr._ConfiguracionEvento.calaDescUMPescaDeclDesc,
                        UnidMedida: this.ctr._ConfiguracionEvento.calaDescUMPescaDecl,
                        ZMODA: "",
                        OBSER: Pesca.Observacion,
                        Indicador:"N"
                     });
                }
				
                 

                 this.ctr._listaEventos[this.ctr._elementAct].ListaBiometria.push({
                    CodEspecie: especie,
                    Especie: sap.ui.getCore().byId("cb_especies_espec").getSelectedItem().getText()
                 });

                 //ELIMINAR DE LA TABLA DE ELIMNADOS PESCA DECLARADA SI EXISTE EL REGISTRO
                 if(enodoPescaDeclarada != undefined){
                    
                    for (var i = enodoPescaDeclarada.length - 1; i >= 0; i--) {
                        if(enodoPescaDeclarada[i].CDSPC == especie){
                            enodoPescaDeclarada.splice(i, 1);
                        }  
                    }
                 }
                 

                 this._oView.getModel("eventos").updateBindings(true);
                
			}

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

        },

        deleteItemsBiometria: function(oevent){
            let tablaBio = this._oView.byId("table_biometria");
            let EventoCons = this._oView.getModel("eventos");
            let ListaBiometrias = this._oView.getModel("eventos").getData().ListaBiometria;
            let ListadeIndices  = tablaBio.getSelectedIndices();
            for (var i = ListaBiometrias.length - 1; i >= 0; i--) {
                for(let index = 0; index < ListadeIndices.length; index++){
                    if(ListadeIndices[index] == i){
                        ListaBiometrias.splice(i, 1);
                    }
                }
                 
            }
            /*****************************ELIMINACION DE PESCA DECLARADA************************************** */
            let ListaPescaDecl = this._oView.getModel("eventos").getData().ListaPescaDeclarada;
            let elimListaPescaDecl = this._oView.getModel("eventos").getData().eListaPescaDeclarada;
            for (var i = ListaPescaDecl.length - 1; i >= 0; i--) {
                for (let index = 0; index < ListadeIndices.length; index++) {
                    if(ListadeIndices[index] == i){
                        let ePescaDeclarada = {
                            INDTR: "D",
                            NRMAR: EventoCons.NRMAR,
                            NREVN: EventoCons.NREVN,
                            CDSPC: ListaPescaDecl[i].CDSPC
                        };
                        elimListaPescaDecl.push(ePescaDeclarada);
                        ListaPescaDecl.splice(i, 1);
                    }
                    
                }
                    
            }
            this._oView.getModel("eventos").setProperty("/ListaPescaDeclarada",ListaPescaDecl);
            this._oView.getModel("eventos").setProperty("/eListaPescaDeclarada",elimListaPescaDecl);
            this._oView.getModel("eventos").setProperty("/ListaBiometria",ListaBiometrias);
        },

        cargarDataBiometria: async function(){
            let lstBiometria = this.ctr._listaEventos[this.ctr._elementAct].ListaBiometria ? this.ctr._listaEventos[this.ctr._elementAct].ListaBiometria.length : 0;
            if(lstBiometria === 0){
                if (this.ctr._listaBiometriaRFC ? true : false) {
                    let lista_total_bio = this.ctr._listaBiometriaRFC;
                    let listaDataBio = [];
                    //-------------------------Cargar las biometria pertenecientes solo a ese evento --------------//
                    for(let w = 0; w < lista_total_bio.length; w++){
                        if(this.ctr._nroEvento == lista_total_bio[w].NREVN){
                            listaDataBio.push(lista_total_bio[w]);
                        }
                        
                    }
                    //------------------------ Cargar el Incidental pertenecientes a ese evento
                    let lista_incidental = this.ctr._listaIncidental;
                    let listaIncEve = [];
                    for(let w = 0; w < lista_incidental.length; w++){
                        if(this.ctr._nroEvento == lista_incidental[w].NREVN){
                            listaIncEve.push(lista_incidental[w]);
                        }
                        
                    }
                    this.ctr._listaEventos[this.ctr._elementAct].ListaIncidental = listaIncEve;
                    //this._oView.getModel("eventos").setProperty("/ListaPescaDeclarada",ListaPescaDecl);
    
    
                    if(listaDataBio.length != 0){
                        let tmn = Number(0);
                        let tmy = Number(0);;
                        let key_bio = Object.keys(listaDataBio[0]);
                        let contIni = 0;
                        //--------------- obtner la talla mayor y menor para armar la tabla dinamica
                        for (let i = 0; i < key_bio.length; i++) {
                            if(key_bio[i].slice(0,5) == "TNMED"){
                                contIni++;
                                let medida = key_bio[i].split("_");
                                let key_mn = Number(medida[1]);
                                if(contIni == 1){
                                    tmn = key_mn;
                                    tmy = key_mn;
                                }else if(tmn > key_mn){
                                    tmn = key_mn;
                                }else if(key_mn > tmy){
                                    tmy = key_mn;
                                }
                                console.log(key_bio[i]);
                            }
                        }
                        this._oView.byId("idTallaMenor").setValue(tmn);
                        this._oView.byId("idTallaMayor").setValue(tmy);
                        await this.onButtonPress3();
                        //------------------ cargar data dinamica -------------------------------------//
    
                        for (let i = 0; i < listaDataBio.length; i++) {
                            let TallaMinPorcJuvenil = Number(0);
                            let sumaMuestraJuvenil = Number(0);
                            let ser_medidaMin = await TasaBackendService.obtenerMedidaEspecie(listaDataBio[i].CDSPC, this.ctr.getCurrentUser());
                            TallaMinPorcJuvenil = Number(ser_medidaMin.data[0].TMMIN);
    
                            let obj_bio = {};
                            let item_bio_key = Object.keys(listaDataBio[i]);
                            let item_bio_value = Object.values(listaDataBio[i]);
                            obj_bio['CodEspecie'] = listaDataBio[i].CDSPC;
                            obj_bio['Especie'] = listaDataBio[i].DESC_CDSPC;
                            obj_bio['Moda'] =  Utils.formatoDosDecimales(listaDataBio[i].MODA);
                            obj_bio['Muestra'] = listaDataBio[i].CDSPC_TOTAL;
                            
                            if(this.ctr._motivoMarea == "2"){
                                let v_talla_bio = Number(0);
                                for (let k = tmn; k <= tmy; k = k + Number(0.5)) {
                                    if(k == tmn){
                                        v_talla_bio = tmn;
                                    }else{
                                        v_talla_bio++;
                                       // v_talla_bio = Number(v_talla_bio) + Number('0.5')
                                    }
                                    let v_talla_bio_s = "" + k;
                                    let val_dec = v_talla_bio_s.indexOf(".5");
                                    if(val_dec == "-1"){
                                        let contBio = 0;
                                        for (let j = 0; j < item_bio_key.length; j++) {
                                            contBio++;
                                            let v2 = "TNMED" + "_" + k + "_" + "00";
                                            if(item_bio_key[j] == v2 ){
                                                let v3 = Number(contBio) - Number(1);
                                                obj_bio['col_' + v_talla_bio] = item_bio_value[v3];
    
                                                if(v_talla_bio < TallaMinPorcJuvenil){
                                                    sumaMuestraJuvenil += Number(item_bio_value[v3]);
                                                }
                                                break;
                                            }
                                        }
    
                                    }else{
                                        let contBio = 0;
                                        for (let j = 0; j < item_bio_key.length; j++) {
                                            contBio++;
                                            let v1 = v_talla_bio_s.split(".");
                                            let v2 = "TNMED" + "_" + v1[0] + "_" + "50";
                                            if(item_bio_key[j] == v2 ){
                                                let v3 = Number(contBio) - Number(1);
                                                obj_bio['col_' + v_talla_bio] = item_bio_value[v3];
    
                                                if(v_talla_bio < TallaMinPorcJuvenil){
                                                    sumaMuestraJuvenil += Number(item_bio_value[v3]);
                                                }
                                                break;
                                            }
                                        }
                                    }
                                }
                                
                            }else if(this.ctr._motivoMarea == "1"){
                                
                                for (let k = tmn; k <= tmy; k++) {
                                    let contBio = 0;
                                    let v2 = "TNMED" + "_" + k + "_" + "00";
                                    for (let j = 0; j < item_bio_key.length; j++) {
                                        contBio++;
                                        if(item_bio_key[j] == v2 ){
                                            let v3 = Number(contBio) - Number(1);
                                            obj_bio['col_' + k] = item_bio_value[v3];
    
                                            if(k < TallaMinPorcJuvenil){
                                                sumaMuestraJuvenil += Number(item_bio_value[v3]);
                                            }
                                            break;
                                        }
                                    }
                                }
    
                            }
    
                            let calculo_porc = Number(0);
                            calculo_porc = (sumaMuestraJuvenil * 100)/ Number(listaDataBio[i].CDSPC_TOTAL)
                            let cal_fix =  calculo_porc.toFixed(2);
                            obj_bio['PorcJuveniles'] = cal_fix + "%";
                            
                            this.ctr._listaEventos[this.ctr._elementAct].ListaBiometria.push(obj_bio);
    
                        }
                        
    
                    }else{
                        this._oView.byId("table_biometria").destroyColumns();
                        this.getTableDefault();
                    }
                }else{
                    this._oView.byId("table_biometria").destroyColumns();
                    this.getTableDefault();
                }
            }else{
                this._oView.byId("table_biometria").destroyColumns();
                let tallaMax = Number(this.ctr._listaEventos[this.ctr._elementAct].TallaMax);
                let tallaMin = Number(this.ctr._listaEventos[this.ctr._elementAct].TallaMin);
                this._oView.byId("idTallaMenor").setValue(tallaMin);
                this._oView.byId("idTallaMayor").setValue(tallaMax);
                await this.onButtonPress3();
            }
            
        },
        abrirPopup_inc :function(){
            let me = this;
            me.getDialog_add_Incidental().open();
        },
        getDialog_add_Incidental: function () {
            if (!this.oDialog_I) {
                this.oDialog_I = sap.ui.xmlfragment("com.tasa.registroeventospescav2.fragments.Popup_Incidental", this);
                this._oView.addDependent(this.oDialog_I);
            }
            return this.oDialog_I;
        },
        cerrarPopup_inc :function(){
            this.getDialog_add_Incidental().close();
        },
        agregarPopup_Inc : function(){
            let listaInc = this.ctr._listaEventos[this.ctr._elementAct].ListaIncidental;
            let especie = sap.ui.getCore().byId("cb_incidental_espec").getSelectedKey();
            let key = true;
            
            if(especie == ""){
                let mensaje = this.ctr.oBundle.getText("MISSINGFIELD", "Especie");
                this.ctr.agregarMensajeValid("Error", mensaje);
            }else{
                for (let i = 0; i < listaInc.length; i++) {			
                    if (listaInc[i].CDSPC == especie ) {
                        key = false;
                        let mensaje = this.ctr.oBundle.getText("EXISTEESPDECLARADA");
                        this.ctr.agregarMensajeValid("Error", mensaje);
                        break;
                    }
                                             
                }
            }
            if(key){
                this.ctr._listaEventos[this.ctr._elementAct].ListaIncidental.push({
                    CDSPC: sap.ui.getCore().byId("cb_incidental_espec").getSelectedKey(),
                    DSSPC: sap.ui.getCore().byId("cb_incidental_espec").getSelectedItem().getText(),
                    PCSPC: sap.ui.getCore().byId("ip_incidental_porc").getValue()
                 });
                 
                 this._oView.getModel("eventos").updateBindings(true);
            }
            this.getDialog_add_Incidental().close();
        },
        deleteIncidentalItems : function(oevent){
            let tablaBio = this._oView.byId("table_Incidental");
            let ListaIncid = this._oView.getModel("eventos").getData().ListaIncidental;
            let ListadeIndicesInc  = tablaBio.getSelectedIndices();
            for (var i = ListaIncid.length - 1; i >= 0; i--) {
                for(let index = 0; index < ListadeIndicesInc.length; index++){
                    if(ListadeIndicesInc[index] == i){
                        ListaIncid.splice(i, 1);
                    }
                }
                 
            }
            this._oView.getModel("eventos").setProperty("/ListaIncidental",ListaIncid);
        }


	});
});