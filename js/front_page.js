$(document).ready(function(){
	$.ajaxSetup({ cache: false });
	function Front(){	
	
		var that=this;	
		
		this.showTable=function(id){
			$('.table-regata').addClass('hide');
			/*заглушка*/
			$('.no-info').addClass('hide');
			$('#r'+id).removeClass('hide');
			$('.bottom_area').addClass('hide');
			/**********/
		}
		
		
		this.getHostory=function(){
			var data={};
			$.ajax({
				type: "POST",
				url: 'action.php',
				cache:false,
				data:{type:'HistoryGetDays',data:data},
				success: function(data) {
					$('.on-line').html(data);
					
					$('.tracksForDate').bind('click', function(){
						var data={};
						data['day']=$(this).attr('id');
						$.ajax({
							type: "POST",
							url: 'action.php',
							cache:false,
							data:{type:'TracksDate',data:data},
							success: function(data) {
								loadTracks($.parseJSON(data));
								$('.wrap').hide();	
								$('#btn_back').show();
							}
						})	
					});
					
				}
			})		
		}
		
		this.getListRaces=function(id){
			var data={};
			$.ajax({
				type: "POST",
				url: 'action.php',
				cache:false,
				data:{type:'get_r'+id,data:data},
				success: function(data) {				
					$('.on-line').html(data);
					
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
				type: "POST",
				url: 'action.php',
				cache:false,
				data:{type:'RaceList',data:data},
				success: function(data) {
					$('.on-line').html(data);
					
					$('.regata_list tr').bind('click', function(){	
						that.getListRaces($(this).attr('id'));
					});	
				}
			})	

		}
		
			
		$('#history').bind('click', function(){
			$('.top-button').removeClass('top-button-yellow');
			$(this).addClass('top-button-yellow');	
			that.getHostory();
		});
		
	
		$('#race').bind('click', function(){	
			$('.top-button').removeClass('top-button-yellow');
			$(this).addClass('top-button-yellow');	
			that.getRace();	
		});
		
				
		$('#profileCloseImg').bind('click', function(){
			$('.bottom_area').addClass('hide');
			$('.top-button').removeClass('top-button-yellow');	
		});
	
	}
	
	
	var Init=new Front(); 
	 //выбор цвета
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
    var Color=new ColorSelect;
    Color.AppendToBody($('.front_page'),$('.front_page'));
});