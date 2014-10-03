$(document).ready(function(){
	$.ajaxSetup({ cache: false, type:"POST", url:'/action.php'});
	function Front(){	
	
		var that=this;	
		
		this.showTable=function(id){
			$('.table-regata').addClass('hide');
			/*��������*/
			$('.no-info').addClass('hide');
			$('#r'+id).removeClass('hide');
			$('.bottom_area').addClass('hide');
			/**********/
		}
		
		
		this.getHostory=function(){
			var data={};
            $.ajax({
                data:{type:'HistoryGetDays',data:data},
                success: function(data) {
                    $('.on-line').html(data);
                    $('#player-panel').hide();
                    $('.tracksForDate').bind('click', function(){
                        loadHistory($(this).attr('id'),parseInt($(this).attr('id'))+24*60*60);
                        $('.wrap').hide();
                        $('#btn_back').show();
                    });
                }
            })
		}
		
		this.getListRaces=function(id){
			var data={};
			$.ajax({
				data:{type:'get_r'+id,data:data},
				success: function(data) {				
					$('.on-line').html(data);
                    $('#player-panel').hide();
					$('div.table-regata .show').bind('click', function(){	
						$('.wrap').hide();	
						$('#btn_back').show();
						loadTrack($(this).attr('data-track-id'));
					});
				}
			})
		}
		
		this.getRace=function(){
			var data={};
			$.ajax({
				data:{type:'RaceList',data:data},
				success: function(data) {
					$('.on-line').html(data);
                    $('#player-panel').hide();
					$('.regata_list tr').bind('click', function(){	
						that.getListRaces($(this).attr('id'));
					});	
				}
			})	

		}
		
		this.MemberList=function(){	
			var obj_user_id=regata.getTracks();
			var user_id=[];
			$.each(obj_user_id, function( index ){
				var info={'id':this.id,'label':this.label,'color':this.color};
				user_id.push(info);
			});
			return user_id;
		}
		
		this.CreateMembersCheckbox=function(list){
			var tmp='';
			for(var i=0;i<list.length;i++){
				//console.log(list[i].id);	
				tmp+='<div style="display:inline-block;margin-right:20px"><input style="" class="MemberMark" id="'+list[i].id+'" type="checkbox" checked="">'+'<div class="circle" style="border: 2px solid '+list[i].color+'; background:'+list[i].color+'">&nbsp;</div>'+list[i].label+'</div>';
				if(i==8){
					tmp+='</br>';
				}
			}		
			return tmp;
		}
		
		this.newRace=function(){
			var fields=[];
			fields[0]='<div>№ гонки: <input type="text" id="number"></div>';
			fields[1]='<div>время старта: <input type="text" id="time_start"></div>';
			fields[2]='<div>время финиша: <input type="text" id="time_finish"></div>';
			fields[3]='<div>координаты судейской лодки:</br> lat <input type="text" id="judge_cord_lat"> lng <input type="text" id="judge_cord_lng"></div>';
			fields[4]='<div>координаты стартового буя:</br> lat <input type="text" id="start_buoy_lat"> lng <input type="text" id="start_buoy_lng"></div>';
			//fields[5]='<div>направление стартового буя: <input type="text" id="direct_buoy"></div>';
			fields[5]='<div style="margin-top:5px">круговая гонка<input id="no_finish" type="checkbox"></div>';
			fields[6]='<div>координаты финишного буя:<br> lat <input type="text" id="finish_buoy_lat"> lng <input type="text" id="finish_buoy_lng"></div>';
			fields[7]='<div>координаты второго финишного буя: </br> lat <input type="text" id="finish_buoy_2_lat"> lng <input type="text" id="finish_buoy_2_lng"></div>';
			//fields[8]='<div>направление второго финишного буя: <input type="text" id="finish_buoy_direction_2"></div>';
			fields[8]='<div style="margin-top:10px">'+that.CreateMembersCheckbox(that.MemberList())+'</div>';
			
			var form='<div class="new_race_form">';
			for(var i=0;i<fields.length;i++){
				form+=fields[i];
			}
			form+='<div id="race_save">сохранить</div>';
			form+='</div>';
			return form;
		}
		
			
		$('#history').bind('click', function(){
            clearInterval(updateInterval);
			$('.top-button').removeClass('top-button-yellow');
			$(this).addClass('top-button-yellow');	
			that.getHostory();
		});
		
	
		$('#race').bind('click', function(){
            clearInterval(updateInterval);
			$('.top-button').removeClass('top-button-yellow');
			$(this).addClass('top-button-yellow');	
			that.getRace();	
		});
		
				
		$('#profileCloseImg').bind('click', function(){
			$('.bottom_area').addClass('hide');
			$('.top-button').removeClass('top-button-yellow');	
		});
		
		//вызов окна создания новой гонки
		$('#new_race').bind('click', function(){
            var data = regata.getData();
			$(this).css('background-color', '#FFF6AC');
			
			$("#dialog").html(that.newRace());
			$('#race_save').button()
			$("#dialog").attr('title','Создание новой гонки');
			$("#dialog").dialog({width:'auto'});

            //заполнение формы
            if (data) {
                $('.new_race_form input').each(function(){
                    var elem=$(this);
                    if(elem.attr('id')=='time_start' || elem.attr('id')=='time_finish'){
                        //время начала и конца
                        elem.val(regata.getTime(data[elem.attr('id')]));
                    } else if(elem.attr('type') == 'checkbox'){
                        if (elem.attr('class') != 'MemberMark'){
                            elem.prop('checked', (data[elem.attr('id')]=='on'));
                        } else {
                            elem.prop('checked', (data['members'].indexOf(elem.attr('id'))!=-1));
                        }
                    } else{
                        $(this).val(data[elem.attr('id')]);
                    }
                });
            }
			
			//галочка что финишный буй и стартовый одинаковый
			$('#no_finish').unbind();
			$('#no_finish').bind('click', function(){
				if($(this).prop('checked')==true){
					$('#finish_buoy_lat').prop('disabled', true);
					$('#finish_buoy_2_lat').prop('disabled', true);
					$('#finish_buoy_direction_2_lat').prop('disabled', true);
					$('#finish_buoy_lng').prop('disabled', true);
					$('#finish_buoy_2_lng').prop('disabled', true);
					$('#finish_buoy_direction_2_lng').prop('disabled', true);
				} else{
					$('#finish_buoy_lat').prop('disabled', false);
					$('#finish_buoy_2_lat').prop('disabled', false);
					$('#finish_buoy_direction_2_lat').prop('disabled', false);
					$('#finish_buoy_lng').prop('disabled', false);
					$('#finish_buoy_2_lng').prop('disabled', false);
					$('#finish_buoy_direction_2_lng').prop('disabled', false);
				}
			});
			
			//создание новой гонки
			$('#race_save').unbind();
			$('#race_save').bind('click', function(){
				var form_data={};
				var members=[];
				//обработка формы
				$('.new_race_form input').each(function(){
					var elem=$(this);
					if(elem.attr('id')=='time_start' || elem.attr('id')=='time_finish'){
						//время начала и конца
						form_data[elem.attr('id')]=regata.getTimestamp(elem.val());
					} else if(elem.attr('type')=='checkbox'){
						if(elem.prop('checked')==true && elem.attr('class')!='MemberMark'){
							form_data[elem.attr('id')]='on';	
						} else{
							if(elem.attr('class')=='MemberMark' && elem.prop('checked')==false){
								members.push(elem.attr('id'));
							} 
							if(elem.attr('class')!='MemberMark' && elem.prop('checked')==false){
								form_data[elem.attr('id')]='off';
							}
						}
					} else{
						form_data[elem.attr('id')]=$(this).val();	
					}	
				});
				form_data['members']=members;
				if(form_data['no_finish']=='on'){
					form_data['finish_buoy_lat']=form_data['start_buoy_lat'];
					form_data['finish_buoy_lng']=form_data['start_buoy_lng'];
				}
				form_data['date'] = moment.utc(form_data['time_start']).format('YYYY.MM.DD');
                form_data['angle'] = regata.getAngle();
                form_data['globalTimeStart'] = regata.getTimeStart();
                if (data && data.id) form_data['id'] = data.id;
				console.log(form_data);
				$.ajax({
					data:{type:'CreateRace',data:form_data},
					success: function(data) {
						$("#dialog").dialog('close');
					}
				});
			});		
			
		});	
		
		
		$('#ready_races').bind('click', function(){
            clearInterval(updateInterval);
			$('.top-button').removeClass('top-button-yellow');
			$(this).addClass('top-button-yellow');
			$.ajax({
				data:{type:'ReadyRaceList'},
				success: function(data) {
					$('.on-line').html(data);
					 $('#player-panel').hide();
					$('.ReadyRace').bind('click', function(){
                        loadRace($(this).attr('id'));
					});
				}
			});
		});
	}
	
	
	var Init=new Front(); 
	 //����� �����
    function ColorSelect(){

        this.themes=[];

        this.themes.push('#EBEBEB');
        this.themes.push('#F3F3F3');
        this.themes.push('#F0E8FF');
        this.themes.push('#F7F3FF');
        this.themes.push('#FFEEC3');
        this.themes.push('#D7D6D8');
        this.themes.push('#F3DCCF');
        this.themes.push('#FCFCEA');
        this.themes.push('#FFF1C6');
        this.themes.push('#B3D1FF');
        this.themes.push('#86B5E8');
        this.themes.push('#F0EDE5');
        this.themes.push('#D2E4C8');


        this.CreateInterface=function(){
            var that=this;
            var body=$('<div class="colorInterface" style="position:absolute;display: block;width:50px"></div>');
            for(var i=0;i<=that.themes.length-1;i++){
                body.append('<div class="color" style="cursor:pointer;border:1px solid gray;width:25px;height:25px;overflow:hidden;margin-top:5px;background:'+that.themes[i]+'"></div>');
            }
            return body;
        }

        this.AppendToBody=function(elem,change){
            var color_html=this.CreateInterface();
            color_html.css({left:10,top:50});
            $('body').append(color_html);

            $('.color').bind('click',function(){
                change.animate({ backgroundColor: change.css('background-color',$(this).css('background-color'))});
                $('.color').css('border-color','gray');
                $(this).css('border-color','red');
            });
        }

    }
    //var Color=new ColorSelect;
    //Color.AppendToBody($('.front_page'),$('.front_page'));

    showOnline(false, 600);
    var updateInterval = setInterval(function(){
        showOnline(true, 600);
    }, 2000);
});