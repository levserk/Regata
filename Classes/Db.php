<?php
class Db
{
	private static $link;

	public static $query;
	public static $result;

	public function __construct ()
	{

	}	

	public static function connect($host,$name,$pass,$database)
	{
		try
		{

			self::$link = mysqli_init();	

			if (!self::$link)
			{
			    die('mysqli_init failed');
			}

			if (!mysqli_options(self::$link, MYSQLI_INIT_COMMAND, 'SET AUTOCOMMIT = 1'))
			{
			    die('Setting MYSQLI_INIT_COMMAND failed');
			}

			if (!mysqli_options(self::$link, MYSQLI_OPT_CONNECT_TIMEOUT, 5))
			{
			    die('Setting MYSQLI_OPT_CONNECT_TIMEOUT failed');
			}

			if (!mysqli_real_connect(self::$link,$host,$name,$pass,$database))
			{
			    die('Connect Error (' . mysqli_connect_errno() . ') '
			            . mysqli_connect_error());
			}

			mysqli_query (self::$link,"SET NAMES 'utf8'");
			mysqli_query (self::$link,"set_client='utf8'");
			mysqli_query (self::$link,"set character_set_results='utf8'");
			mysqli_query (self::$link,"set collation_connection='utf8_general_ci'");
		}
		catch (Exception $e)
		{
   			 echo $e->getMessage();
		}		
	}	

	public static function query($a)
	{
		self::$result=mysqli_query(self::$link,$a);
		return mysqli_affected_rows(self::$link);
	}	


}


?>