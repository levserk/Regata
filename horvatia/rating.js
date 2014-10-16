var active_td='';

function Rating(){

	that=this;

	this.table=$('.sortable');
	this.sortable='';
	
	
	//передаем столбец по которому будем сортировать
	this.doSortable=function(target){
		this.sortable=target;
		that.Rebild(that.getNumber(target));			
	}
	
	//узнаем порядковый номер
	this.getNumber=function(target){
		var tr=target.parent();
		var number=0;
		tr.find('td').each(function(){		
			if(typeof($(this).attr('colspan'))!='undefined'){
				number+=parseInt($(this).attr('colspan'));
			} else{
				number++;
			}
			if($(this).attr('id')==target.attr('id')){
				return false;
			}
		});
		return number;
	}
	
	this.StringObj=function(string,number){	
	
		if(this.sortable.attr('id')=='gandicap' || this.sortable.attr('id')=='points'){
			var sort=parseFloat(string.find('td').eq(number-1).text());
		} else if(this.sortable.attr('id')=='boat_number' || this.sortable.attr('id')=='place'){
			var sort=parseInt(string.find('td').eq(number-1).text());
		} else{
			var sort=string.find('td').eq(number-1).text();
		}
	
		var tmp={
			sort_param: sort,
			ready_string:string[0].outerHTML		
		};
		return tmp;
	}
	
	this.SortArray=function(array,param){
		array.sort(function(a,b){
			if(param=='desc'){
				if (a.sort_param > b.sort_param) return -1;
				if (a.sort_param < b.sort_param) return 1;
			}
			if(param=='asc'){
				if (a.sort_param > b.sort_param) return 1;
				if (a.sort_param < b.sort_param) return -1;		
			}
			return 0;
		});	
		return array;
	}
	
	this.CreateTable=function(array){
		this.table.find('tr').each(function(){		
			if($(this).attr('class')!='table_head' && $(this).attr('class')!='days table_head'){
				$(this).remove();
			}
		});

		for(var i=0;i<=array.length-1;i++){
			this.table.append(array[i].ready_string);
		}
	}
	
	//перестройка таблицы в зависимости от того по чему кликнули
	this.Rebild=function(number){
		var tr_array=[];
		this.table.find('tr').each(function(){
			if($(this).attr('class')!='table_head' && $(this).attr('class')!='days table_head'){
				tr_array.push(that.StringObj($(this),number));
			}	
		});
		
		if(this.sortable.hasClass('active')){
			this.sortable.removeClass('active');
			this.CreateTable(this.SortArray(tr_array,'asc'));
		} else{
			this.table.find('td').removeClass('active');
			this.sortable.addClass('active');
			this.CreateTable(this.SortArray(tr_array,'desc'));
		}
		
	}
	
}

$(document).ready(function(){

	$('body').on('click','td.raiting', function(){
	
		$('tr.table_head td').css('background-color','white');
		$('tr.table_head td.show').css('background-color','#f7f791'); 
		$(this).css('background-color','lightgray');
		var new_rating=new Rating();
		new_rating.doSortable($(this));	
	});


});	