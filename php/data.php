<?php
  	try {
		$response = array();
		switch($_GET['action']) {		
			case 'getUser':
				$response = $_SERVER['REMOTE_USER'];
			break;
			case 'delUser':
				session_destroy();
  				session_unset($_SESSION['session_id']);
				session_unset($_SESSION['logged']);
				unset($_COOKIE['pubcookie_s_www_qatar']);
				setcookie('pubcookie_s_www_qatar', '', -1);
			break;
			default: throw new Exception('Wrong action');
		}
		echo json_encode($response);
	} catch(Exception $e) {
		die(json_encode(array('error' => $e->getMessage())));
	}
?>