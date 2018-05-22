var ads = require('ads');
//var http = require('http');
var fs = require('fs');
var randomizer = require('./randomizer');
var url = require('url');
var client;
var data = [];
var res = [];
var machineState = '';
var express = require('express');
var app = express();
var rdb = require('rethinkdb');
var http = require('http').Server(app);
var io = require('socket.io').listen(http);
var ficheiroGcode = '';
var inserted_id='';
var register_parameters = false;
var global_conn;
const config = require('./config.json');

const db = Object.assign(config.rethinkdb, {  
    db: 'hmi'
});

var options = {
	//The IP or hostname of the target machine 
    //host: "192.168.200.113", 
    host: "192.168.202.218", 
    //The NetId of the target machine 
    //amsNetIdTarget: "10.1.35.204.1.1",
    amsNetIdTarget: "192.168.200.135.1.1",
    //The NetId of the source machine. 
    //You can choose anything in the form of x.x.x.x.x.x, 
    //but on the target machine this must be added as a route. 
    //amsNetIdSource: "192.168.137.50.1.1",
    amsNetIdSource: "192.168.200.135.1.2",
 
    //OPTIONAL: (These are set by default)  
    //The tcp destination port 
    //port: 48898 
    //The ams source port 
    //amsPortSource: 32905 
    //The ams target port 
    amsPortTarget: 851 
}

var hl_Teste = {
    symname: 'GVL.Teste',  
    bytelength: ads.STRING,  
    propname: 'value'
}

var hl_Poweron = {
    symname: 'GVL.Poweron',  
    bytelength: ads.BOOL,  
    propname: 'value'      
};

var hl_CncHmiData = {
	symname: 'CncHmiData.PlcHmiData.Channel[0].Axis[0].current_position_acs',  
    bytelength: ads.STRING,  
    propname: 'value'
}

var hl_xActPos = {
	symname: 'CncHmiData.PlcHmiData.Channel[0].Axis[0].actCmdPosition',  
    bytelength: ads.LREAL,  
    propname: 'value'
}

var hl_yActPos = {
	symname: 'CncHmiData.PlcHmiData.Channel[0].Axis[2].actCmdPosition',  
    bytelength: ads.LREAL,  
    propname: 'value'
}

var hl_zActPos = {
	symname: 'CncHmiData.PlcHmiData.Channel[0].Axis[3].actCmdPosition',  
    bytelength: ads.LREAL,  
    propname: 'value'
}

var hl_bActPos = {
	symname: 'CncHmiData.PlcHmiData.Channel[0].Axis[4].actCmdPosition',  
    bytelength: ads.LREAL,  
    propname: 'value'
}

var hl_cActPos = {
	symname: 'CncHmiData.PlcHmiData.Channel[0].Axis[5].actCmdPosition',  
    bytelength: ads.LREAL,  
    propname: 'value'
}

var hl_VelAvanco = {
    symname: 'GVL.Vel_Avanco',  
    bytelength: ads.LREAL,  
    propname: 'value'      
};

var hl_VelExtrusaoPolimero = {
    symname: 'GVL.Vel_ExtrusaoPolimero',  
    bytelength: ads.LREAL,  
    propname: 'value'      
};

var hl_VelExtrusaoFibra = {
    symname: 'GVL.Vel_ExtrusaoFibra',  
    bytelength: ads.LREAL,  
    propname: 'value'      
};

var hl_VelPolimeroTrabalho = {
    symname: 'GVL.Vel_PolimeroTrabalho',  
    bytelength: ads.LREAL,  
    propname: 'value'      
};

var hl_VelFibraTrabalho = {
    symname: 'GVL.Vel_FibraTrabalho',  
    bytelength: ads.LREAL,  
    propname: 'value'      
};

var hl_TempCamara = {
    symname: 'GVL.Temp_Camara_in',  
    bytelength: ads.INT,  
    propname: 'value'      
};

var hl_TempCamaraSet = {
    symname: 'Global_Variables.Temp_Camara_set',  
    bytelength: ads.DINT,  
    propname: 'value'      
};

var hl_TempTabuleiro = {
    symname: 'GVL.Temp_Tabuleiro',  
    bytelength: ads.INT,  
    propname: 'value'      
};

var hl_TempTabuleiroSet = {
    symname: 'Global_Variables.Temp_Tabuleiro_set',  
    bytelength: ads.DINT,  
    propname: 'value'      
};

var hl_TempExtrusor = {
    symname: 'GVL.Temp_Extrusor_1',  
    bytelength: ads.INT,  
    propname: 'value'      
};

var hl_TempExtrusorSet = {
    symname: 'Global_Variables.Temp_Extrusor_1_set',  
    bytelength: ads.DINT,  
    propname: 'value'      
};

var hl_TempAguaChiller = {
    symname: 'GVL.Temp_Chiller',  
    bytelength: ads.INT,  
    propname: 'value'      
};

var hl_TempMotorB = {
    symname: 'GVL.Temp_MotorB',  
    bytelength: ads.LREAL,  
    propname: 'value'      
};

var hl_TempQuadro = {
    symname: 'GVL.Temp_Quadro',  
    bytelength: ads.Temp_Quadro,  
    propname: 'value'      
};

var hl_TempSaidaCablagem = {
    symname: 'GVL.Temp_Cabos',  
    bytelength: ads.INT,  
    propname: 'value'      
};

var hl_TempPontoMovel = {
    symname: 'GVL.Temp_8',  
    bytelength: ads.INT,  
    propname: 'value'      
};

var hl_BlockNumber = {
    symname: 'GVL.gvl_blockcount',  
    bytelength: ads.DINT,  
    propname: 'value'      
};

var hl_File = {
    symname: 'GVL.gvl_sprogramname',  
    bytelength: ads.STRING,  
    propname: 'value'      
};

var hl_FileStart = {
    symname: 'GVL.gvl_bstate_start',  
    bytelength: ads.BOOL,  
    propname: 'value'      
};

var hl_CurrentState = {
    symname: 'HLI_CncChannel.currentState',  
    bytelength: ads.DWORD,  
    propname: 'value'      
};

var hl_ModeAuto = {
    symname: 'HLI_CncChannel.pChannel^.Mode.Auto',  
    bytelength: ads.BOOL,  
    propname: 'value'      
};

var hl_AutomaticoPausar = {
    symname: 'GVL.gvl_automaticstop',  
    bytelength: ads.BOOL,  
    propname: 'value'      
};

var hl_AutomaticoReset = {
    symname: 'GVL.gvl_automaticreset',  
    bytelength: ads.BOOL,  
    propname: 'value'      
};

var hl_AutomaticoSelected = {
    symname: 'GVL.gvl_automaticselected',  
    bytelength: ads.BOOL,  
    propname: 'value'      
};

var hl_Homing = {
    symname: 'GVL.gvl_homing',  
    bytelength: ads.BOOL,  
    propname: 'value'      
};

var hl_HomingGeral = {
    symname: 'GVL.gvl_hominggeral',  
    bytelength: ads.BOOL,  
    propname: 'value'      
};

var hl_PlcManualModeSelectedAxis = {
    symname: 'Global_Variables.PlcManualModeSelectedAxis',  
    bytelength: ads.UINT,  
    propname: 'value'      
};

var hl_PlcManualModeRightKey = {
    symname: 'Global_Variables.PlcManualModeRightKey',  
    bytelength: ads.BOOL,  
    propname: 'value'      
};

var hl_PlcManualModeLeftKey = {
    symname: 'Global_Variables.PlcManualModeLeftKey',  
    bytelength: ads.BOOL,  
    propname: 'value'      
};

var hl_PlcManualModeSpeed = {
    symname: 'Global_Variables.PlcManualModeSpeed',  
    bytelength: ads.UDINT,  
    propname: 'value'      
};

var hl_DesligarMotores = {
    symname: 'GVL.gvl_desligarmotores',  
    bytelength: ads.BOOL,  
    propname: 'value'      
};

var hl_DesligarAquecimentoCamara = {
    symname: 'GVL.gvl_desligaraquecimentocamara',  
    bytelength: ads.BOOL,  
    propname: 'value'      
};

var hl_DesligarSistemaAquecimento = {
    symname: 'GVL.gvl_desligarsistemaaquecimento',  
    bytelength: ads.BOOL,  
    propname: 'value'      
};

var hl_DesligarTudo = {
    symname: 'GVL.gvl_desligartudo',  
    bytelength: ads.BOOL,  
    propname: 'value'      
};

var hl_AquecimentoTabuleiro = {
    symname: 'GVL.gvl_aquecimento_mesa',  
    bytelength: ads.BOOL,  
    propname: 'value'      
};

var hl_AquecimentoExtrusor = {
    symname: 'GVL.gvl_aquecimento_extrusor',  
    bytelength: ads.BOOL,  
    propname: 'value'      
};

var hl_InsuflacaoArCamara = {
    symname: 'GVL.gvl_insuflacaoarcamara',  
    bytelength: ads.BOOL,  
    propname: 'value'      
};

var hl_InsuflacaoArEixoX = {
    symname: 'GVL.gvl_insuflacaoareixox',  
    bytelength: ads.BOOL,  
    propname: 'value'      
};

var hl_InsuflacaoArQuadro = {
    symname: 'GVL.gvl_insuflacaoarquadro',  
    bytelength: ads.INT,  
    propname: 'value'      
};

var hl_OutrosIluminacaoCamara = {
    symname: 'GVL.gvl_iluminacaocamara',  
    bytelength: ads.BOOL,  
    propname: 'value'      
};

var hl_OutrosAjusteMesa = {
    symname: 'GVL.gvl_outrosajustedemesa',  
    bytelength: ads.BOOL,  
    propname: 'value'      
};

var hl_MachineState = {
    symname: 'GVL.gvl_machine_state',  
    bytelength: ads.STRING,  
    propname: 'value'      
};

var hl_EnableTracking = {
    symname: 'GVL.gvl_bEnableTracking',  
    bytelength: ads.BOOL,  
    propname: 'value'      
};

var hl_plcAxisEnable = {
    symname: 'GVL.gvl_hl_plcAxisEnable',  
    bytelength: ads.BOOL,  
    propname: 'value'      
};

var hl_operationMode = {
    symname: 'GVL.gvl_operationMode',  
    bytelength: ads.STRING,  
    propname: 'value'      
};

var hl_manualMode = {
    symname: 'GVL.gvl_manualMode',  
    bytelength: ads.BOOL,  
    propname: 'value'      
};

var hl_automaticMode = {
    symname: 'GVL.gvl_automaticMode',  
    bytelength: ads.BOOL,  
    propname: 'value'      
};

var hl_manualMode_isActivated = {
    symname: 'GVL.gvl_manualmode_isactivated',  
    bytelength: ads.BOOL,  
    propname: 'value'    
};

var hl_manualMode_busy = {
    symname: 'GVL.gvl_manualmode_busy',  
    bytelength: ads.BOOL,  
    propname: 'value'    
};

var hl_currentMode = {
    symname: 'GVL.gvl_currentMode',  
    bytelength: ads.DWORD,  
    propname: 'value'    
};

var hl_currentState = {
    symname: 'GVL.gvl_currentState',  
    bytelength: ads.DWORD,  
    propname: 'value'  
};

var hl_Manual_nOpMode = {
    symname: 'GVL.gvl_Manual_nOpMode',  
    bytelength: ads.UINT,  
    propname: 'value'  
};



function setValue(){
	client.read(hl_Poweron, function(err, handle) {
		console.log('reading...');
        //result is the myHandle object with the new properties filled in 
        console.log(handle.value);
        //All handles will be released automaticly here 
    });
}

function automatic_pausar_false(){
    hl_AutomaticoPausar.value = '0';
    client.write(hl_AutomaticoPausar, function(err,handle) {
        console.log('err: '+ err);
        client.read(hl_AutomaticoPausar, function(err, handle) {
            console.log(err);
        });
    });
}

function homing_false(){
    hl_Homing.value = '0';
    client.write(hl_Homing, function(err,handle) {
        console.log('err: '+ err);
        client.read(hl_Homing, function(err, handle) {
            console.log(err);
        });
    });
}

function homing_geral_false(){
    hl_HomingGeral.value = '0';
    client.write(hl_HomingGeral, function(err,handle) {
        console.log('err: '+ err);
        client.read(hl_HomingGeral, function(err, handle) {
            console.log(err);
        });
    });
}


function automatic_selected_true(){
	hl_AutomaticoSelected.value = '1';
    client.write(hl_AutomaticoSelected, function(err,handle) {
        console.log('err: '+ err);
        client.read(hl_AutomaticoSelected, function(err, handle) {
            console.log(err);
        });
    });

    setTimeout(automatic_selected_false, 2000); 
}

function automatic_selected_false(){
	hl_AutomaticoSelected.value = '0';
    client.write(hl_AutomaticoSelected, function(err,handle) {
        console.log('err: '+ err);
        client.read(hl_AutomaticoSelected, function(err, handle) {
            console.log(err);
        });
    });
}

function automatic_reset_false(){
	hl_AutomaticoReset.value = '0';
    client.write(hl_AutomaticoReset, function(err,handle) {
        console.log('err: '+ err);
        client.read(hl_AutomaticoReset, function(err, handle) {
            console.log(err);
        });
    });
    setTimeout(automatic_selected_true, 1000); 
}

function automatic_register_parameters() {
  if(register_parameters){
    
	let data = {
        filename:ficheiroGcode, date:new Date(), file_id:inserted_id ,temp_camara:hl_TempCamara.value/100,temp_tabuleiro:hl_TempTabuleiro.value/100,temp_extrusor:hl_TempExtrusor.value/10,temp_aguaChiller:hl_TempAguaChiller.value/10,temp_motorB:hl_TempMotorB.value,temp_quadro:hl_TempQuadro.value/10,temp_saidaCablagem:hl_TempSaidaCablagem.value/10,temp_pontoMovel:hl_TempPontoMovel.value/10
    };
    
    rdb.table('file_execution').insert(data).run(global_conn, function(err, result) {
	    if (err) throw err;
	});


  	setTimeout(automatic_register_parameters, 30000);
  }
}


app.use(express.static('public'));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/public/index.html');
});

console.log('Trying to connect to database');
// Connecting to RethinkDB server
rdb.connect(db)  
    .then(conn => {
    	console.log('Database connected');

global_conn = conn;

console.log('Trying to connect socket');
io.sockets.on('connection',function(socket){
    console.log('Socket connected');
    console.log('Trying to connect Ads');
    client = ads.connect(options, function() {
        console.log('Ads connected');

        //this.notify(hl_MachineState);
    	//this.notify(hl_Poweron);
    	this.notify(hl_xActPos);
    	this.notify(hl_yActPos);
        this.notify(hl_TempCamara);
    	this.notify(hl_zActPos);
    	this.notify(hl_bActPos);
    	this.notify(hl_cActPos);
        /*this.notify(hl_VelExtrusaoPolimero);*/
    	/*this.notify(hl_VelAvanco);
		this.notify(hl_VelExtrusaoFibra);
		this.notify(hl_VelPolimeroTrabalho);
		this.notify(hl_VelFibraTrabalho);*/
		
		this.notify(hl_TempTabuleiro);
		this.notify(hl_TempExtrusor);
		this.notify(hl_TempAguaChiller);
        this.notify(hl_TempQuadro);
		this.notify(hl_TempMotorB);
		
		this.notify(hl_TempSaidaCablagem);
		this.notify(hl_TempPontoMovel);
		this.notify(hl_BlockNumber);
    });


    socket.on('power', function (power) {
        hl_Poweron.value = power;
        client.write(hl_Poweron, function(err) {
            console.log('err: '+ err);
            client.read(hl_Poweron, function(err, handle) {
                console.log(err);
            });
        });
    });

    socket.on('machine_state', function (value) {
        hl_MachineState.value = value;
        client.write(hl_MachineState, function(err) {
            console.log('err: '+ err);
            client.read(hl_MachineState, function(err, handle) {
                console.log(err);
            });
        });
    });

    socket.on('gcode_filename', function (filename) {
    	ficheiroGcode = filename;
        hl_File.value = 'C:\\Users\\User\\Desktop\\Gcodes\\' + filename;
        client.write(hl_File, function(err) {
            console.log('err: '+ err);
            client.read(hl_File, function(err, handle) {
                console.log(err);
            });
        });        
    });

    socket.on('automatico_iniciar', function (value) {
    	hl_MachineState.value='auto';
    	client.write(hl_MachineState, function(err) {
            console.log('err: '+ err);
            client.read(hl_MachineState, function(err, handle) {
                console.log(err);
            });
        });

        hl_EnableTracking.value='1';
    	client.write(hl_EnableTracking, function(err) {
            console.log('err: '+ err);
            client.read(hl_EnableTracking, function(err, handle) {
                console.log(err);
            });
        });

    	hl_FileStart.value=value;
        client.write(hl_FileStart, function(err) {
            console.log('err: '+ err);
            client.read(hl_FileStart, function(err, handle) {
                console.log(err);
            });
        });

        /*setTimeout(function(){
            hl_FileStart.value=value;
            client.write(hl_FileStart, function(err) {
                console.log('err: '+ err);
                client.read(hl_FileStart, function(err, handle) {
                    console.log(err);
                });
        })},1000);*/


        let data = {
            filename:ficheiroGcode, start_date:new Date(), pause_date:null,stop_date:null
        };
        
        let id = rdb.table('file_execution').insert(data).run(conn, function(err, result) {
		    if (err) throw err;
		    inserted_id = result.generated_keys['0'];
		});

        register_parameters = true;

        setTimeout(automatic_register_parameters, 1000);
    });

    socket.on('automatico_pausar', function (value) {
    	hl_AutomaticoPausar.value=value;
        client.write(hl_AutomaticoPausar, function(err) {
            console.log('err: '+ err);
            client.read(hl_AutomaticoPausar, function(err, handle) {
                console.log(err);
            });
        });
        
        rdb.table("file_execution").get(inserted_id).update({pause_date: new Date()}).run(conn);
        //rdb.table('file_execution').insert(data).run(conn);

        register_parameters = false;
        setTimeout(automatic_pausar_false, 2000);
    });

    socket.on('automatico_parar', function (value) {
    	if(value==='1'){
			hl_AutomaticoReset.value=value;
	        client.write(hl_AutomaticoReset, function(err) {
	            console.log('err: '+ err);
	            client.read(hl_AutomaticoReset, function(err, handle) {
	                console.log(err);
	            });
	        });
    	}

        rdb.table("file_execution").get(inserted_id).update({stop_date: new Date()}).run(conn);

        register_parameters = false;

        if(value==='1'){
        	setTimeout(automatic_reset_false, 2000); 
        }
    });

    socket.on('homing', function (value) {
    	hl_Homing.value=value;
        client.write(hl_Homing, function(err) {
            console.log('err: '+ err);
            client.read(hl_Homing, function(err, handle) {
                console.log(err);
            });
        });

        setTimeout(homing_false, 2000);
    });

    socket.on('homing_geral', function (value) {
    	hl_HomingGeral.value=value;
        client.write(hl_HomingGeral, function(err) {
            console.log('err: '+ err);
            client.read(hl_HomingGeral, function(err, handle) {
                console.log(err);
            });
        });

        setTimeout(homing_geral_false, 2000);
    });

	socket.on('move_eixo_manual', function (value) {
        console.log('move_eixo_manual:');
        console.log(value);
        hl_manualMode_isActivated.value='1';
        client.write(hl_manualMode_isActivated, function(err) {
            console.log('err: '+ err);
            client.read(hl_manualMode_isActivated, function(err, handle) {
                console.log(err);
            });
        });

        hl_manualMode_busy.value='1';
        client.write(hl_manualMode_busy, function(err) {
            console.log('err: '+ err);
            client.read(hl_manualMode_busy, function(err, handle) {
                console.log(err);
            });
        });

		if(value[0] === ''){
            console.log('1');
	        hl_PlcManualModeRightKey.value='0';
        	client.write(hl_PlcManualModeRightKey, function(err) {
	            console.log('err: '+ err);
	            client.read(hl_PlcManualModeRightKey, function(err, handle) {
	                console.log(err);
	            });
        	});
            console.log('2');
        	hl_PlcManualModeLeftKey.value='0';
        	client.write(hl_PlcManualModeLeftKey, function(err) {
	            console.log('err: '+ err);
	            client.read(hl_PlcManualModeLeftKey, function(err, handle) {
	                console.log(err);
	            });
        	});
            console.log('3');
		}else{
            hl_currentMode.value='4';
            client.write(hl_currentMode, function(err) {
                console.log('err: '+ err);
                client.read(hl_currentMode, function(err, handle) {
                    console.log(err);
                });
            });

            hl_currentState.value='4';
            client.write(hl_currentState, function(err) {
                console.log('err: '+ err);
                client.read(hl_currentState, function(err, handle) {
                    console.log(err);
                });
            });

            hl_EnableTracking.value='1';
            client.write(hl_EnableTracking, function(err) {
                console.log('err: '+ err);
                client.read(hl_EnableTracking, function(err, handle) {
                    console.log(err);
                });
            });

            hl_automaticMode.value='0';
            client.write(hl_automaticMode, function(err) {
                console.log('err: '+ err);
                client.read(hl_automaticMode, function(err, handle) {
                    console.log(err);
                });
            });

            
            
            hl_manualMode.value='1';
            client.write(hl_manualMode, function(err) {
                console.log('err: '+ err);
                client.read(hl_manualMode, function(err, handle) {
                    console.log(err);
                });
            });

            hl_Manual_nOpMode.value='2';
            client.write(hl_Manual_nOpMode, function(err) {
                console.log('err: '+ err);
                client.read(hl_Manual_nOpMode, function(err, handle) {
                    console.log(err);
                });
            });

			hl_PlcManualModeSelectedAxis.value=value[0];
	        client.write(hl_PlcManualModeSelectedAxis, function(err) {
	            console.log('err: '+ err);
	            client.read(hl_PlcManualModeSelectedAxis, function(err, handle) {
	                console.log(err);
	            });
	        });

	        hl_PlcManualModeSpeed.value=value[1];
	        client.write(hl_PlcManualModeSpeed, function(err) {
	            console.log('err: '+ err);
	            client.read(hl_PlcManualModeSpeed, function(err, handle) {
	                console.log(err);
	            });
	        });

	        let sinal=value[2];
	        if(sinal==='positivo'){
	        	hl_PlcManualModeRightKey.value='1';
	        	client.write(hl_PlcManualModeRightKey, function(err) {
		            console.log('err: '+ err);
		            client.read(hl_PlcManualModeRightKey, function(err, handle) {
		                console.log(err);
		            });
	        	});
	        }else{
	        	hl_PlcManualModeLeftKey.value='1';
	        	client.write(hl_PlcManualModeLeftKey, function(err) {
		            console.log('err: '+ err);
		            client.read(hl_PlcManualModeLeftKey, function(err, handle) {
		                console.log(err);
		            });
	        	});
	        }
		}
    });

    socket.on('temperatura_camara', function (value) {
    	let  atual_temp = hl_TempCamaraSet.value;

    	if(value[1]==='negativo'){
    		atual_temp = atual_temp - value[0];
    	}else{
			atual_temp = atual_temp + value[0];    		
    	}
    	
    	hl_TempCamaraSet.value = atual_temp;
	    client.write(hl_TempCamaraSet, function(err,handle) {
	        console.log('err: '+ err);
	        client.read(hl_TempCamaraSet, function(err, handle) {
	            console.log(err);
	        });
	    });
    });

    socket.on('temperatura_tabuleiro', function (value) {
    	let  atual_temp = hl_TempTabuleiroSet.value;

    	if(value[1]==='negativo'){
    		atual_temp = atual_temp - value[0];
    	}else{
			atual_temp = atual_temp + value[0];    		
    	}
    	
    	hl_TempTabuleiroSet.value = atual_temp;
	    client.write(hl_TempTabuleiroSet, function(err,handle) {
	        console.log('err: '+ err);
	        client.read(hl_TempTabuleiroSet, function(err, handle) {
	            console.log(err);
	        });
	    });
    });

    socket.on('temperatura_extrusor', function (value) {
    	let  atual_temp = hl_TempExtrusorSet.value;

    	if(value[1]==='negativo'){
    		atual_temp = atual_temp - value[0];
    	}else{
			atual_temp = atual_temp + value[0];    		
    	}
    	
    	hl_TempExtrusorSet.value = atual_temp;
	    client.write(hl_TempExtrusorSet, function(err,handle) {
	        console.log('err: '+ err);
	        client.read(hl_TempExtrusorSet, function(err, handle) {
	            console.log(err);
	        });
	    });
    });

    socket.on('velocidade_avanco', function (value) {
    	let  atual_temp = hl_VelAvanco.value;

    	if(value[1]==='negativo'){
    		atual_temp = atual_temp - value[0];
    	}else{
			atual_temp = atual_temp + value[0];    		
    	}
    	
    	hl_VelAvanco.value = atual_temp;
	    client.write(hl_VelAvanco, function(err,handle) {
	        console.log('err: '+ err);
	        client.read(hl_VelAvanco, function(err, handle) {
	            console.log(err);
	        });
	    });
    });

    socket.on('velocidade_extrPolimero', function (value) {
    	let  atual_temp = hl_VelExtrusaoPolimero.value;

    	if(value[1]==='negativo'){
    		atual_temp = atual_temp - value[0];
    	}else{
			atual_temp = atual_temp + value[0];    		
    	}
    	
    	hl_VelExtrusaoPolimero.value = atual_temp;
	    client.write(hl_VelExtrusaoPolimero, function(err,handle) {
	        console.log('err: '+ err);
	        client.read(hl_VelExtrusaoPolimero, function(err, handle) {
	            console.log(err);
	        });
	    });
    });

    socket.on('velocidade_extrFibra', function (value) {
    	let  atual_temp = hl_VelExtrusaoFibra.value;

    	if(value[1]==='negativo'){
    		atual_temp = atual_temp - value[0];
    	}else{
			atual_temp = atual_temp + value[0];    		
    	}
    	
    	hl_VelExtrusaoFibra.value = atual_temp;
	    client.write(hl_VelExtrusaoFibra, function(err,handle) {
	        console.log('err: '+ err);
	        client.read(hl_VelExtrusaoFibra, function(err, handle) {
	            console.log(err);
	        });
	    });
    });

    socket.on('desligar_motores', function (value) {
    	hl_DesligarMotores.value = value;
	    client.write(hl_DesligarMotores, function(err,handle) {
	        console.log('err: '+ err);
	        client.read(hl_DesligarMotores, function(err, handle) {
	            console.log(err);
	        });
	    });
    });

    socket.on('desligar_aquecimento_camara', function (value) {
    	hl_DesligarAquecimentoCamara.value = value;
	    client.write(hl_DesligarAquecimentoCamara, function(err,handle) {
	        console.log('err: '+ err);
	        client.read(hl_DesligarAquecimentoCamara, function(err, handle) {
	            console.log(err);
	        });
	    });
    });

    socket.on('desligar_sistema_aquecimento', function (value) {
    	hl_DesligarSistemaAquecimento.value = value;
	    client.write(hl_DesligarSistemaAquecimento, function(err,handle) {
	        console.log('err: '+ err);
	        client.read(hl_DesligarSistemaAquecimento, function(err, handle) {
	            console.log(err);
	        });
	    });
    });

    socket.on('desligar_tudo', function (value) {
    	hl_DesligarTudo.value = value;
	    client.write(hl_DesligarTudo, function(err,handle) {
	        console.log('err: '+ err);
	        client.read(hl_DesligarTudo, function(err, handle) {
	            console.log(err);
	        });
	    });
    });

    socket.on('desligar_aquecimento_tabuleiro', function (value) {
    	hl_AquecimentoTabuleiro.value = value;
	    client.write(hl_AquecimentoTabuleiro, function(err,handle) {
	        console.log('err: '+ err);
	        client.read(hl_AquecimentoTabuleiro, function(err, handle) {
	            console.log(err);
	        });
	    });
    });

    socket.on('desligar_aquecimento_extrusor', function (value) {
    	hl_AquecimentoExtrusor.value = value;
	    client.write(hl_AquecimentoExtrusor, function(err,handle) {
	        console.log('err: '+ err);
	        client.read(hl_AquecimentoExtrusor, function(err, handle) {
	            console.log(err);
	        });
	    });
    });

    socket.on('insuflacao_ar_camara', function (value) {
    	hl_InsuflacaoArCamara.value = value;
	    client.write(hl_InsuflacaoArCamara, function(err,handle) {
	        console.log('err: '+ err);
	        client.read(hl_InsuflacaoArCamara, function(err, handle) {
	            console.log(err);
	        });
	    });
    });

    socket.on('insuflacao_ar_eixox', function (value) {
    	hl_InsuflacaoArEixoX.value = value;
	    client.write(hl_InsuflacaoArEixoX, function(err,handle) {
	        console.log('err: '+ err);
	        client.read(hl_InsuflacaoArEixoX, function(err, handle) {
	            console.log(err);
	        });
	    });
    });

    socket.on('outros_iluminacao_camara', function (value) {
    	hl_OutrosIluminacaoCamara.value = value;
	    client.write(hl_OutrosIluminacaoCamara, function(err,handle) {
	        console.log('err: '+ err);
	        client.read(hl_OutrosIluminacaoCamara, function(err, handle) {
	            console.log(err);
	        });
	    });
    });

    socket.on('outros_ajuste_mesa', function (value) {
    	hl_OutrosAjusteMesa.value = value;
	    client.write(hl_OutrosAjusteMesa, function(err,handle) {
	        console.log('err: '+ err);
	        client.read(hl_OutrosAjusteMesa, function(err, handle) {
	            console.log(err);
	        });
	    });
    });

    socket.on('insuflacao_quadro', function (value) {
    	hl_InsuflacaoArQuadro.value = value;
	    client.write(hl_InsuflacaoArQuadro, function(err,handle) {
	        console.log('err: '+ err);
	        client.read(hl_InsuflacaoArQuadro, function(err, handle) {
	            console.log(err);
	        });
	    });
    });

    socket.on('historico', function (value) {
    	let array_historico = [];
		
		rdb.table('file_execution').indexCreate('start_date').run(conn,function(err){
			if(err){
				console.log('err: '+err);
			}
		});

    	rdb.table('file_execution')
    		.orderBy({index: rdb.desc('start_date')})
    		.run(conn)
            .then(cursor => {
                cursor.each((err, returnedData) => {
                	let duration = 0.00;
                	var linha_array_historico = {};
                	linha_array_historico.id = returnedData.id;
                	linha_array_historico.filename = returnedData.filename;
                	linha_array_historico.start_date = (returnedData.start_date == null) ? null : returnedData.start_date.toLocaleString('pt-PT');
                	linha_array_historico.pause_date = (returnedData.pause_date == null) ? null : returnedData.pause_date.toLocaleString('pt-PT');
                	linha_array_historico.stop_date = (returnedData.stop_date == null) ? null : returnedData.stop_date.toLocaleString('pt-PT');
                	if(returnedData.start_date != null && returnedData.stop_date != null){
                		duration = (returnedData.stop_date - returnedData.start_date)/1000/60;
                		linha_array_historico.duration = duration;
                	}else{
                		linha_array_historico.duration = 0;
                	}
                	array_historico.push(linha_array_historico);
                	socket.emit('historico_resp',linha_array_historico);
                });
    		});
    });

    socket.on('historico_detalhes', function (id) {
    	let min_temp_camara =0.0, max_temp_camara =0.0,avg_temp_camara =0.0,
    		min_temp_tabuleiro =0.0, max_temp_tabuleiro =0.0,avg_temp_tabuleiro =0.0,
    		min_temp_quadro =0.0, max_temp_quadro =0.0,avg_temp_quadro =0.0,
    		min_temp_extrusor =0.0, max_temp_extrusor =0.0,avg_temp_extrusor =0.0,
    		min_temp_motorb =0.0, max_temp_motorb =0.0,avg_temp_motorb =0.0,
    		min_temp_saidacablagem =0.0, max_temp_saidacablagem =0.0,avg_temp_saidacablagem =0.0,
    		min_temp_aguachiller =0.0, max_temp_aguachiller =0.0,avg_temp_aguachiller =0.0,
    		min_temp_pontomovel =0.0, max_temp_pontomovel =0.0,avg_temp_pontomovel =0.0;
    	let arrayGrafico = [];
        console.log('detalhes1');
        console.log('id:'+id);
    	rdb.table("file_execution").filter({file_id: id}).orderBy(rdb.asc('date')).run(conn)
    		.then(cursor => {
                cursor.each((err, returnedData) => {
                	arrayGrafico= [returnedData.date.toLocaleString('pt-PT'),returnedData.temp_camara,returnedData.temp_tabuleiro,returnedData.temp_extrusor,returnedData.temp_aguaChiller,returnedData.temp_motorB,returnedData.temp_saidaCablagem,returnedData.temp_pontoMovel,returnedData.temp_quadro];
                	socket.emit('historico_detalhes_grafico',arrayGrafico);
                });
    		});;
        console.log('detalhes2');
    	
    	rdb.table("file_execution")
    		.filter({file_id: id})
    		.min('temp_camara')
    		.run(conn,function(err,result){
    			min_temp_camara = result.temp_camara.toFixed(2);
    			socket.emit('historico_detalhes_min_temp_camara',min_temp_camara);
    		});


    	rdb.table("file_execution")
    		.filter({file_id: id})
    		.max('temp_camara')
    		.run(conn,function(err,result){
                console.log('temp_camara:');
                console.log(result);
    			max_temp_camara = result.temp_camara.toFixed(2);
    			socket.emit('historico_detalhes_max_temp_camara',max_temp_camara);
    		});

    	rdb.table("file_execution")
    		.filter({file_id: id})
    		.avg('temp_camara')
    		.run(conn,function(err,result){
    			avg_temp_camara = result.toFixed(2);
    			socket.emit('historico_detalhes_avg_temp_camara',avg_temp_camara);
    		});


    	rdb.table("file_execution")
    		.filter({file_id: id})
    		.min('temp_tabuleiro')
    		.run(conn,function(err,result){
    			min_temp_tabuleiro = result.temp_tabuleiro.toFixed(2);
    			socket.emit('historico_detalhes_min_temp_tabuleiro',min_temp_tabuleiro);
    		});


    	rdb.table("file_execution")
    		.filter({file_id: id})
    		.max('temp_tabuleiro')
    		.run(conn,function(err,result){
    			max_temp_tabuleiro = result.temp_tabuleiro.toFixed(2);
    			socket.emit('historico_detalhes_max_temp_tabuleiro',max_temp_tabuleiro);
    		});

    	rdb.table("file_execution")
    		.filter({file_id: id})
    		.avg('temp_tabuleiro')
    		.run(conn,function(err,result){
    			avg_temp_tabuleiro = result.toFixed(2);
    			socket.emit('historico_detalhes_avg_temp_tabuleiro',avg_temp_tabuleiro);
    		});


    	rdb.table("file_execution")
    		.filter({file_id: id})
    		.min('temp_extrusor')
    		.run(conn,function(err,result){
    			min_temp_extrusor = result.temp_extrusor.toFixed(2);
    			socket.emit('historico_detalhes_min_temp_extrusor',min_temp_extrusor);
    		});


    	rdb.table("file_execution")
    		.filter({file_id: id})
    		.max('temp_extrusor')
    		.run(conn,function(err,result){
    			max_temp_extrusor = result.temp_extrusor.toFixed(2);
    			socket.emit('historico_detalhes_max_temp_extrusor',max_temp_extrusor);
    		});

    	rdb.table("file_execution")
    		.filter({file_id: id})
    		.avg('temp_extrusor')
    		.run(conn,function(err,result){
    			avg_temp_extrusor = result.toFixed(2);
    			socket.emit('historico_detalhes_avg_temp_extrusor',avg_temp_extrusor);
    		});


    	rdb.table("file_execution")
    		.filter({file_id: id})
    		.min('temp_aguaChiller')
    		.run(conn,function(err,result){
    			min_temp_aguaChiller = result.temp_aguaChiller.toFixed(2);
    			socket.emit('historico_detalhes_min_temp_aguaChiller',min_temp_aguaChiller);
    		});


    	rdb.table("file_execution")
    		.filter({file_id: id})
    		.max('temp_aguaChiller')
    		.run(conn,function(err,result){
    			max_temp_aguaChiller = result.temp_aguaChiller.toFixed(2);
    			socket.emit('historico_detalhes_max_temp_aguaChiller',max_temp_aguaChiller);
    		});

    	rdb.table("file_execution")
    		.filter({file_id: id})
    		.avg('temp_aguaChiller')
    		.run(conn,function(err,result){
    			avg_temp_aguaChiller = result.toFixed(2);
    			socket.emit('historico_detalhes_avg_temp_aguaChiller',avg_temp_aguaChiller);
    		});

    	rdb.table("file_execution")
    		.filter({file_id: id})
    		.min('temp_motorB')
    		.run(conn,function(err,result){
    			min_temp_motorB = result.temp_motorB.toFixed(2);
    			socket.emit('historico_detalhes_min_temp_motorB',min_temp_motorB);
    		});


    	rdb.table("file_execution")
    		.filter({file_id: id})
    		.max('temp_motorB')
    		.run(conn,function(err,result){
    			max_temp_motorB = result.temp_motorB.toFixed(2);
    			socket.emit('historico_detalhes_max_temp_motorB',max_temp_motorB);
    		});

    	rdb.table("file_execution")
    		.filter({file_id: id})
    		.avg('temp_motorB')
    		.run(conn,function(err,result){
    			avg_temp_motorB = result.toFixed(2);
    			socket.emit('historico_detalhes_avg_temp_motorB',avg_temp_motorB);
    		});

    	rdb.table("file_execution")
    		.filter({file_id: id})
    		.min('temp_saidaCablagem')
    		.run(conn,function(err,result){
    			min_temp_saidaCablagem = result.temp_saidaCablagem.toFixed(2);
    			socket.emit('historico_detalhes_min_temp_saidaCablagem',min_temp_saidaCablagem);
    		});


    	rdb.table("file_execution")
    		.filter({file_id: id})
    		.max('temp_saidaCablagem')
    		.run(conn,function(err,result){
    			max_temp_saidaCablagem = result.temp_saidaCablagem.toFixed(2);
    			socket.emit('historico_detalhes_max_temp_saidaCablagem',max_temp_saidaCablagem);
    		});

    	rdb.table("file_execution")
    		.filter({file_id: id})
    		.avg('temp_saidaCablagem')
    		.run(conn,function(err,result){
    			avg_temp_saidaCablagem = result.toFixed(2);
    			socket.emit('historico_detalhes_avg_temp_saidaCablagem',avg_temp_saidaCablagem);
    		});

    	rdb.table("file_execution")
    		.filter({file_id: id})
    		.min('temp_pontoMovel')
    		.run(conn,function(err,result){
    			min_temp_pontoMovel = result.temp_pontoMovel.toFixed(2);
    			socket.emit('historico_detalhes_min_temp_pontoMovel',min_temp_pontoMovel);
    		});


    	rdb.table("file_execution")
    		.filter({file_id: id})
    		.max('temp_pontoMovel')
    		.run(conn,function(err,result){
    			max_temp_pontoMovel = result.temp_pontoMovel.toFixed(2);
    			socket.emit('historico_detalhes_max_temp_pontoMovel',max_temp_pontoMovel);
    		});

    	rdb.table("file_execution")
    		.filter({file_id: id})
    		.avg('temp_pontoMovel')
    		.run(conn,function(err,result){
    			avg_temp_pontoMovel = result.toFixed(2);
    			socket.emit('historico_detalhes_avg_temp_pontoMovel',avg_temp_pontoMovel);
    		});

    	rdb.table("file_execution")
    		.filter({file_id: id})
    		.min('temp_quadro')
    		.run(conn,function(err,result){
    			min_temp_quadro = result.temp_quadro.toFixed(2);
    			socket.emit('historico_detalhes_min_temp_quadro',min_temp_quadro);
    		});


    	rdb.table("file_execution")
    		.filter({file_id: id})
    		.max('temp_quadro')
    		.run(conn,function(err,result){
    			max_temp_quadro = result.temp_quadro.toFixed(2);
    			socket.emit('historico_detalhes_max_temp_quadro',max_temp_quadro);
    		});

    	rdb.table("file_execution")
    		.filter({file_id: id})
    		.avg('temp_quadro')
    		.run(conn,function(err,result){
    			avg_temp_quadro = result.toFixed(2);
    			socket.emit('historico_detalhes_avg_temp_quadro',avg_temp_quadro);
    		});
    });
    

    socket.on('historico_delete', function (value) {
    	rdb.table("file_execution").delete().run(conn);
    });
    

    client.on('notification', function(handle){
            socket.emit(handle.symname, handle.value );
    });

    client.on('error', function(error) {
    	console.log('client error');
        console.log(error);
    });

    process.on('exit', function () {
        console.log("exit");
    });

    process.on('SIGINT', function() {
        client.end(function() {
        	console.log('sigint');
            process.exit();
        });
    });
});

});


io.sockets.on('error', function(err) {
    console.log('Socket Error');
    console.log(err);
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
