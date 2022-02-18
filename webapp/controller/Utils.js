sap.ui.define([
	"./Utils"
], function(
) {
	"use strict";

	return {

        formatDate: function (date) {
            var d = new Date(date),
                month = '' + (d.getMonth() + 1),
                day = '' + (d.getDate() + 1),
                year = d.getFullYear();

            if (month.length < 2)
                month = '0' + month;
            if (day.length < 2)
                day = '0' + day;

            return [day, month, year].join('/');
        },

        removeDuplicateArray: function(data, key){
            return [
                ...new Map(
                    data.map(x => [key(x), x])
                ).values()
            ];
        },

        getDegrees :function(value){
            if (value != "") {
                let type = null;
                value = value.trim();		
                type = this.getFormatGeo(value);
                if (type != null) {
                    return value.substring(0, 3);
                }
            }
            return 0;
        },

        getMinutes :function(value){
            if (value != "") {
                let type = null;
                value = value.trim();		
                type = this.getFormatGeo(value);
                if (type != null) {
                    if (type == "D") {
                        return value.substring(3);
                    } else if (type == "G") {
                        return value.substring(4, 7);
                    }
                } 
            }
            return 0;
        },
        
        getFormatGeo :function(value){
            if (value != "") {
                let myPattern = /(\d){5}/;
                let myGeoPattern =/(\d){3}º(\d){2}'/;
                value = value.trim();
                let myMatcher = myPattern.test(value);
                let myGeoMatcher = myGeoPattern.test(value);
                if (myMatcher) {
                    return "D";
                } else if (myGeoMatcher) {
                    return "G";
                }
            }
            return null;
        },

        strDateToDate: function(strDate){
            let p_fech = strDate + "";
            var date = null;
            if(p_fech.length == 8){
                date = p_fech;
            }else{
                if(strDate){ // dd/MM/yyyy
                    var anio = parseInt(strDate.split("/")[2]);
                    var mes = parseInt(strDate.split("/")[1]) - 1;
                    var dia = parseInt(strDate.split("/")[0]);
                    date = new Date(anio, mes, dia);
                }
            }
            return date;
        },

        strDateHourToDate: function(strDate, strHour){ // dd/MM/yyyy hh:mm
            var date = null;
            if(strDate && strHour){
                var anio = parseInt(strDate.split("/")[2]);
                var mes = parseInt(strDate.split("/")[1]) - 1;
                var dia = parseInt(strDate.split("/")[0]);
                if(strHour.length == 6){ 
                    let c_hora = strHour + "";
                    var hour = c_hora.substr(0,2);
                    var minute = c_hora.substr(2,2);
                    
                }else{
                    var hour = parseInt(strHour.split(":")[0]);
                    var minute = parseInt(strHour.split(":")[1]);
                }
                
                date = new Date(anio, mes, dia, hour, minute);
            }
            return date;
        },

        dateToStrDate: function(date){
            if(date){
                var dia = date.getDate();
                var mes = date.getMonth() + 1;
                var anio = date.getFullYear();
                var strDia = "";
                if(dia > 0 && dia < 10){
                    strDia = "0" + dia;
                }else{
                    strDia = dia;
                }
                var strMes = "";
                if(mes > 0 && mes < 10){
                    strMes = "0" + mes;
                }else{
                    strMes = mes;
                }
                return strDia + "/" + strMes + "/" + anio;
            }else{
                return null;
            }
        },
        dateToStrHours: function(date){
            if(date){
                let hora = date.getHours();
                let minutos = date.getMinutes();
                let segundos = date.getSeconds();
                let strHor = "";
                if(hora >= 0 && hora < 10){
                    strHor = "0" + hora;
                }else{
                    strHor = hora;
                }
                let strMin = "";
                if(minutos > 0 && minutos < 10){
                    strMin = "0" + minutos;
                }else{
                    strMin = minutos;
                }
                let strSec = "";
                if(segundos > 0 && segundos < 10){
                    strSec = "0" + segundos;
                }else{
                    strSec = segundos;
                }
                return strHor + ":" + strMin + ":" + strSec;
            }else{
                return null;
            }
        },

        strDateToSapDate: function(date){ //dd/MM/yyyy
            let p_fecha = date + "";
            var newDate = "";
            if(p_fecha.length > 8){
                if(date){
                    var dateSplit = date.split("/");
                    var dia = dateSplit[0];
                    var mes = dateSplit[1];
                    var anio = dateSplit[2];
                    newDate = anio + mes + dia + "";
                }
            }else{
                newDate = p_fecha;
            }
            return newDate;
            
        },

        strHourToSapHo: function(hour){
            let p_hora = hour + ""
            var newHour = "";
            if(p_hora.length == 6){
                newHour = p_hora;
                
            }else{
                if(hour){
                    var dateSplit = hour.split(":");
                    var hora = dateSplit[0];
                    var minuto = dateSplit[1];
                    var sec = dateSplit[2] ? dateSplit[2] : "00";
                    newHour = hora + minuto + sec + "";
                }
            }
            return newHour;
        },

        getEtiqueta: function(path){
            var etiqueta = "";
            if(path == "/Form/CDEMB"){
                etiqueta = "Embarcación";
            }
            if(path == "/Form/CDMMA"){
                etiqueta = "Motivo de Marea";
            }
            if(path == "/Form/INUBC"){
                etiqueta = "Ubicación de Pesca";
            }
            if(path == "/Form/RUC"){
                etiqueta = "R.U.C";
            }
            if(path == "/Form/RAZON"){
                etiqueta = "Razón Social";
            }
            if(path == "/Form/CALLE"){
                etiqueta = "Calle";
            }
            if(path == "/Form/DISTRITO"){
                etiqueta = "Distrito";
            }
            if(path == "/Form/PROVINCIA"){
                etiqueta = "Provincia";
            }
            if(path == "/Form/DEPARTAMENTO"){
                etiqueta = "Departamento";
            }
            if(path == "/Form/CDEMP"){
                etiqueta = "Armador Comercial";
            }
            if(path == "/Form/FIMAR"){
                etiqueta = "Fecha de Inicio";
            }
            if(path == "/Form/FFMAR"){
                etiqueta = "Fecha de Fin";
            }
            if(path == "/Form/HIMAR"){
                etiqueta = "Hora de Inicio";
            }

            return etiqueta;
        },
        difPtosLongOPtosLati:function(d1,m1,d2,m2,cDec){
            let  fReturn = [];
            let val1 = d1*100 + m1;
            let val2 = d2*100 + m2;
            let dDif = 0;
            let mDif = 0;
            let signo = -1;
            let susD = 0;
            
            if (val1 > val2) {	
                let tempD = d1;
                let tempM = m1;
                d1 = d2;
                m1 = m2;
                d2 = tempD;
                m2 = tempM; 	
                signo = 1;
            }
            
            if (m1 > m2) {
                susD = 1;
                m2 += 60;
            } 
                
            d2 -= susD;
            dDif = d2 - d1;
            mDif = m2 - m1;
        
            let bd = Number(mDif);
            mDif = bd.toFixed(2);
            
            fReturn = [signo, dDif, mDif];
            
            return fReturn;

        },
        compPtosLongOPtosLati : function(difPtos){
            let valor = 0;
            if (difPtos != null && difPtos.length > 2) {
                let rPtos = difPtos[0]*(difPtos[1]*100 + difPtos[2]);
            
                if (rPtos > 0.0) {
                    valor = 1;
                } else if (rPtos == 0.0) {
                    valor = 0;
                } else {
                    valor = -1;
                }
            }
            
            return valor;
        },
        distPtosLongitud:function(difPtos,dl,ml,medida){
            let longEcuador = 40076;
            const degrees_to_radians = deg => (deg * Math.PI) / 180.0;
            let paralelo = Math.cos(degrees_to_radians(dl + ml/60))*longEcuador;
            let longGradoKM = paralelo/360;
            let longMinutoKM = longGradoKM/60;
            let valor  = this.distPtosLatOPtosLong(difPtos, longGradoKM, longMinutoKM, medida);
            return valor;
        },
        distPtosLatOPtosLong :function(difPtos,longGradoKM,longMinutoKM,medida){
            const medidas_cons = ['MN', 'KM', 'MT'];
            let valor = Number(0);
            medida = ((medida != "") || medidas_cons.includes(medida)) ? medida : "MN";
            if (medida == "MN") {
                valor =  difPtos[0]*(difPtos[1]*(this.convKmAMillNaut(longGradoKM)) + difPtos[2]*(this.convKmAMillNaut(longMinutoKM)));
            } else if (medida == "KM" || medida == "MT") {
                let eq = 1;
                
                if (medida == "MT") {
                    eq = 1000;
                }
                
                valor =  difPtos[0]*(difPtos[1]*longGradoKM + difPtos[2]*longMinutoKM)*eq;
            }
            
            return valor.toFixed(2);	
        },
        convKmAMillNaut :function(km){
            return km/1.852;
        },
        formatHoraBTP : function(hora){
            let horaFormat = ""
            let hora_size = hora.length

            if(hora_size == 6 || hora_size == 4){
                let c_hora = hora + "";
                let hour_v = c_hora.substr(0,2);
                let minute_v = c_hora.substr(2,2);
                horaFormat = hour_v + ":" + minute_v ;
            }
            else{
                horaFormat = hora;
            }

            return horaFormat;
        },
        formatfechaBTP : function(fecha){
            let fechaFormat = ""
            let fecha_size = fecha.length

            if(fecha_size == 8){
                let c_fecha = fecha + "";
                let dia_v = c_fecha.substr(6,2);
                let mes_v = c_fecha.substr(4,2);
                let anio_v = c_fecha.substr(0,4);
                fechaFormat = dia_v + "/" + mes_v + "/" + anio_v;
            }
            else{
                fechaFormat = fecha;
            }

            return fechaFormat;
        },
        formatCoordenadaBTP : function(cord){
            let cordenada = ""
            let coord_size = cord.length

            if(coord_size == 7){
                let c_coord = cord + "";
                let gra_v = c_coord.substr(0,3);
                let min_v = c_coord.substr(4,2);
                cordenada = gra_v + min_v;
            }
            else{
                cordenada = cord;
            }

            return cordenada;
        },

        formatoNroEvento : function(nro_evn){
            let ne = Number(nro_evn);
            let ne_format = "";
            if(ne<10){
                ne_format = "0" + ne;
            }else{
                ne_format = ne;
            }
            return ne_format;
        },
        formatoPescaDcl : function(numero){
            let num_format = "" + numero;
            let v_n = num_format.split(".");
            let v_decimal = v_n[1] ? v_n[1].length : 0;
            if(v_decimal == 0){
                num_format = numero + ".000";
            }else{
                num_format = numero;
            }
            return num_format;
        },

        formatGraInput :function(gra){
            let val = "";
            let n_lat = Number(gra);

            if(n_lat<10){
                val = "00" + n_lat;
            }else if(10 <= n_lat && n_lat > 100){
                val = "0" + n_lat;
            }else{
                val = n_lat;
            }
            return val;

        },

        formatMinInput :function(min){
            let val = "";
            let n_lat = Number(min);

            if(n_lat<10){
                val = "0" + n_lat;
            }else if(10 <= n_lat && n_lat > 100){
                val = n_lat;
            }
            return val;

        },
        formatoDosDecimales : function(numero){
            let num_format = "" + numero;
            let v_n = num_format.split(".");
            let v_decimal = v_n[1] ? v_n[1].length : 0;
            if(v_decimal == 0){
                num_format = numero + ".00";
            }else{
                if(v_decimal ==  1 ){
                    num_format = num_format + "0";
                }else{
                    num_format = numero;
                }
            }
            return num_format;
        },

        daysBetween: function(first, second) {

            // Copy date parts of the timestamps, discarding the time parts.
            var one = new Date(first.getFullYear(), first.getMonth(), first.getDate());
            var two = new Date(second.getFullYear(), second.getMonth(), second.getDate());
        
            // Do the math.
            var millisecondsPerDay = 1000 * 60 * 60 * 24;
            var millisBetween = two.getTime() - one.getTime();
            var days = millisBetween / millisecondsPerDay;
        
            // Round down.
            return Math.floor(days);
        }


    }
});