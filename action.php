<?php 
require_once('./Classes/Db.php');
Db::connect('localhost', 'monitor', '12345678', 'races');

class action{

	public function __construct(){
	
	
	}
	
	public function getData($a,$b){
		return $this->$a($b);
	}
	
	public function DateConvert($a){
		if($a=='January'){
			$out='Января';
		}
		if($a=='February'){
			$out='Февраля';
		}
		if($a=='March'){
			$out='Марта';
		}
		if($a=='April'){
			$out='Апреля';
		}
		if($a=='May'){
			$out='Мая';
		}
		if($a=='June'){
			$out='Июня';
		}
		if($a=='July'){
			$out='Июля';
		}
		if($a=='August'){
			$out='Августа';
		}
		if($a=='September'){
			$out='Сентября';
		}
		if($a=='October'){
			$out='Октября';
		}
		if($a=='November'){
			$out='Ноября';
		}
		if($a=='December'){
			$out='Декабря';
		}
		if(isset($out)){
			return $out;
		}	

	}
	
	
	public function HistoryGetDays(){
		 Db::query("SELECT DISTINCT(DATE_FORMAT(FROM_UNIXTIME(dt/1000),'%e')) as d, DATE_FORMAT(FROM_UNIXTIME(dt/1000),'%d.%m.%y') as days, DATE_FORMAT(FROM_UNIXTIME(dt/1000),'%M') as m, DATE_FORMAT(FROM_UNIXTIME(dt/1000),'%Y') as y FROM tracks");
		 $tmp='<ul class="history_box">';
         while ($Res=mysqli_fetch_array(Db::$result)){			
			$tmp.='<li id="'.$Res['days'].'" class="tracksForDate">'.$Res['d'].' '.$this->DateConvert($Res['m']).' '.$Res['y'].'</li>';
		 }
		 $tmp.='</ul>';
		 return $tmp;
	
	}
	
	
	public function TracksDate($m_data){
		Db::query("SELECT user_id, imei, name, DATE_FORMAT(FROM_UNIXTIME(dt/1000),'%d.%m.%y') as days,lat,lon,color,DATE_FORMAT(FROM_UNIXTIME(dt/1000),'%H:%i:%s') as time
				   FROM tracks 
				   INNER JOIN users 
		           ON tracks.user_id=users.id
				   WHERE DATE_FORMAT(FROM_UNIXTIME(dt/1000),'%d.%m.%y')='".$m_data['day']."'
		           ORDER BY tracks.dt ASC");
		while ($Res=mysqli_fetch_array(Db::$result)){	
			$imei[$Res['name']]=$Res['name'];
			$user[$Res['name']]['cord'][]='#'.$Res['lat'].','.$Res['lon'].','.$Res['days'].','.$Res['time'];		
			$user[$Res['name']]['color']=$Res['color'];
			$user[$Res['name']]['user_id']=$Res['user_id'];
		}
		
		foreach ($imei as $key => $value) {
			$tmp[$key]=array(
				'color'=>$user[$key]['color'],
				'track'=>$user[$key]['cord'],
				'user_id'=>$user[$key]['user_id']
			);
		}
		return json_encode($tmp);
	}
	
	
	public function RaceList(){
		return '<div class="race_list_window">
			<table class="regata_list active">
					<tbody><tr>
						<td class="cen" width="5%"><b>Год</b></td>
						<td class="cen" width="10%"><b>Дата</b></td>
						<td class="cen"><b>Название</b></td>				
						<td class="cen" width="15%"><b>Кол-во дней</b></td>
					</tr>
					<tr id="1">
						<td class="cen">2014</td>
						<td class="cen">5 - 9 мая</td>
						<td class="cen">Хорватия</td>				
						<td class="cen">5</td>
					</tr>
					<tr id="2">
						<td class="cen">2014</td>
						<td class="cen">13 июня</td>
						<td class="cen">Тиурула</td>				
						<td class="cen">1</td>
					</tr>
					<tr id="3">
						<td class="cen">2014</td>
						<td class="cen">14 - 15 сентября</td>
						<td class="cen">Хорватия</td>				
						<td class="cen">2</td>
					</tr>
				</tbody>
			</table>
			</div>';
	
	}

	public function get_r1(){
		return '<div class="table-regata" id="r1">
			<h3 style="color:#0196e0">Хорватия</h3>
			<table>
				<tr>
					<td width="5%" rowspan="3">Место</td>
					<td width="5%" rowspan="3">Парус №</td>
					<td rowspan="3">Участник</td>
					<td colspan="10">Гонки</td>
					<td rowspan="3">Очки</td>
				</tr>
				
				<tr class="days">
					<td colspan="3">1 день</td>
					<td colspan="2">2 день</td>
					<td colspan="2">3 день</td>
					<td colspan="2">4 день</td>
					<td onclick="loadTrack(6)">5 день</td>
				</tr>
				
				<tr>
					<td>1 (2)</td>
					<td class="show" data-track-id="2">2 (1)</td>
					<td class="show" data-track-id="3">3 (М)</td>
					<td class="show" data-track-id="4">4 (2)</td>
					<td class="show" data-track-id="5">5 (2)</td>
					<td class="show" data-track-id="6">6 (2)</td>
					<td class="show" data-track-id="7">7 (М)</td>
					<td class="show" data-track-id="8">8 (2)</td>
					<td class="show" data-track-id="9">9 (1)</td>
					<td class="show" data-track-id="10">10 (1)</td>
				</tr>
				
				<tr>
					<td>1</td>
					<td>23</td>
					<td class="member">Свирида И.</td>
					<td>1</td>
					<td>1</td>
					<td>1</td>				
					<td>2</td>
					<td>2</td>
					<td>4</td>				
					<td>1</td>
					<td>1</td>
					<td>2</td>
					<td>2</td>
					<td>11,0</td>		
				</tr>
				
				<tr>
					<td>2</td>
					<td>24</td>
					<td class="member">Дуванов А.</td>
					<td>4</td>
					<td>8</td>
					<td>4</td>				
					<td>4</td>
					<td>3</td>
					<td>2</td>				
					<td>3</td>
					<td>3</td>
					<td>3</td>
					<td>1</td>
					<td>23,0</td>		
				</tr>
				
				<tr>
					<td>3</td>
					<td>17</td>
					<td class="member">Касьянова А.</td>
					<td>3</td>
					<td>2</td>
					<td>5</td>				
					<td>5</td>
					<td>1</td>
					<td>6</td>				
					<td>4</td>
					<td>2</td>
					<td>4</td>
					<td>8</td>
					<td>26,0</td>		
				</tr>
				
				
				<tr>
					<td>4</td>
					<td>21</td>
					<td class="member">Титаренко М.</td>
					<td>5</td>
					<td>10</td>
					<td>2</td>				
					<td>1</td>
					<td>5</td>
					<td>3</td>				
					<td>2</td>
					<td>7</td>
					<td>dsq</td>
					<td>5</td>
					<td>30,0</td>		
				</tr>
				
				<tr>
					<td>5</td>
					<td>19</td>
					<td class="member">Савинич И.</td>
					<td>2</td>
					<td>3</td>
					<td>11</td>				
					<td>7</td>
					<td>4</td>
					<td>8</td>				
					<td>7</td>
					<td>4</td>
					<td>6</td>
					<td>4</td>
					<td>37,0</td>		
				</tr>
				
				<tr>
					<td>6</td>
					<td>46</td>
					<td class="member">Миронов А.</td>
					<td>8</td>
					<td>6</td>
					<td>7</td>				
					<td>6</td>
					<td>6</td>
					<td>1</td>				
					<td>10</td>
					<td>6</td>
					<td>8</td>
					<td>3</td>
					<td>43,0</td>		
				</tr>
				
				<tr>
					<td>7</td>
					<td>22</td>
					<td class="member">Яхинсон В.</td>
					<td>6</td>
					<td>9</td>
					<td>6</td>				
					<td>8</td>
					<td>8</td>
					<td>5</td>				
					<td>5</td>
					<td>8</td>
					<td>1</td>
					<td>9</td>
					<td>47,0</td>		
				</tr>
				
				<tr>
					<td>8</td>
					<td>18</td>
					<td class="member">Волковой В.</td>
					<td>9</td>
					<td>4</td>
					<td>9</td>				
					<td>3</td>
					<td>7</td>
					<td>7</td>				
					<td>8</td>
					<td>5</td>
					<td>7</td>
					<td>10</td>
					<td>50,0</td>		
				</tr>
				
				<tr>
					<td>9</td>
					<td>20</td>
					<td class="member">Гумеров Д.</td>
					<td>7</td>
					<td>5</td>
					<td>3</td>				
					<td>11</td>
					<td>9</td>
					<td>9</td>				
					<td>6</td>
					<td>9</td>
					<td>10</td>
					<td>7</td>
					<td>55,0</td>		
				</tr>
				
				<tr>
					<td>10</td>
					<td>16</td>
					<td class="member">Родионов А.</td>
					<td>11</td>
					<td>11</td>
					<td>10</td>				
					<td>10</td>
					<td>10</td>
					<td>10</td>				
					<td>9</td>
					<td>11</td>
					<td>5</td>
					<td>6</td>
					<td>71,0</td>		
				</tr>
				
				<tr>
					<td>11</td>
					<td>25</td>
					<td class="member">Шеметило Д.</td>
					<td>10</td>
					<td>7</td>
					<td>8</td>				
					<td>9</td>
					<td>11</td>
					<td>11</td>				
					<td>11</td>
					<td>10</td>
					<td>9</td>
					<td>11</td>
					<td>75,0</td>		
				</tr>
			
			</table>
			</div>';
	
	}
	
	public function get_r2(){
		return '<div class="table-regata" id="r2">
				<h3 style="color:#0196e0">Тиурула</h3>
				<div class="button show" data-track-id="11">Тиурула 1</div>
				<div class="button show" data-track-id="12">Тиурула 2</div>
				<div class="button show" data-track-id="13">Тиурула 28.06</div>
				<div class="button show" data-track-id="14">Тиурула 29.06</div>
				<div class="button show" data-track-id="15">Тиурула 12.07</div>
				<div class="button show" data-track-id="16">Шхеры 12.07</div>
				<div class="button show" data-track-id="17">Тиурула 13.07</div>
				<div class="button show" data-track-id="18">Тиурула 22.07</div>
			</div>';
	
	}
	
	public function get_r3(){
		return '<div class="table-regata" id="r1">
			<h3 style="color:#0196e0">Хорватия</h3>
			<table>
				<tbody><tr>
					<td width="5%" rowspan="3">Место</td>
					<td width="5%" rowspan="3">Парус №</td>
					<td rowspan="3">Участник</td>
					<td colspan="2">Гонки</td>
					<td rowspan="3">Очки</td>
				</tr>
				
				<tr class="days">
					<td colspan="1">1 день</td>
					<td colspan="1">2 день</td>
				</tr>
				
				<tr>
					<td class="show" data-track-id="19">1 (2)</td>
					<td class="show" data-track-id="20">2 (1)</td>
				</tr>
				
				<tr>
					<td>0</td>
					<td>39</td>
					<td class="member">Vasinkevich Mikhail</td>
					<td>0</td>
					<td>0</td>	
					<td> - </td>	
				</tr>
				<tr>
					<td>0</td>
					<td>40</td>
					<td class="member">Samoylov Yury</td>
					<td>0</td>
					<td>0</td>	
					<td> - </td>	
				</tr>
				<tr>
					<td>0</td>
					<td>41</td>
					<td class="member">Dzedziushka Siarhei</td>
					<td>0</td>
					<td>0</td>	
					<td> - </td>	
				</tr>
				<tr>
					<td>0</td>
					<td>42</td>
					<td class="member">Faynberg Feliks</td>
					<td>0</td>
					<td>0</td>	
					<td> - </td>	
				</tr>
				<tr>
					<td>0</td>
					<td>43</td>
					<td class="member">Pinkhasik Dmitrii</td>
					<td>0</td>
					<td>0</td>	
					<td> - </td>	
				</tr>
				<tr>
					<td>0</td>
					<td>44</td>
					<td class="member">Bibichev Igor</td>
					<td>0</td>
					<td>0</td>	
					<td> - </td>	
				</tr>
				<tr>
					<td>0</td>
					<td>45</td>
					<td class="member">Tuzlukov Vasily</td>
					<td>0</td>
					<td>0</td>	
					<td> - </td>	
				</tr>
				<tr>
					<td>0</td>
					<td>52</td>
					<td class="member">Fomin Alexei</td>
					<td>0</td>
					<td>0</td>	
					<td> - </td>	
				</tr>
				<tr>
					<td>0</td>
					<td>47</td>
					<td class="member">Trusov Alexander</td>
					<td>0</td>
					<td>0</td>	
					<td> - </td>	
				</tr>
				<tr>
					<td>0</td>
					<td>48</td>
					<td class="member">Polyanovsky Anatoly</td>
					<td>0</td>
					<td>0</td>	
					<td> - </td>	
				</tr>
				<tr>
					<td>0</td>
					<td>49</td>
					<td class="member">Andreev Oleg</td>
					<td>0</td>
					<td>0</td>	
					<td> - </td>	
				</tr>
				<tr>
					<td>0</td>
					<td>50</td>
					<td class="member">Gurevich Ilya</td>
					<td>0</td>
					<td>0</td>	
					<td> - </td>	
				</tr><tr>
					<td>0</td>
					<td>46</td>
					<td class="member">Mironov Aleksei</td>
					<td>0</td>
					<td>0</td>	
					<td> - </td>	
				</tr>
				<tr>
					<td>0</td>
					<td>53</td>
					<td class="member">Nikitin Aleksei</td>
					<td>0</td>
					<td>0</td>	
					<td> - </td>	
				</tr><tr>
					<td>0</td>
					<td>38</td>
					<td class="member">Yuri Fadeev</td>
					<td>0</td>
					<td>0</td>	
					<td> - </td>	
				</tr>
				
				</tbody></table>';
	}			
	

}

$Action=new action();
echo $Action->getData($_POST['type'],$_POST['data']);
?>