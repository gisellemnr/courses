<?php
  	try {
		$response = array();
		switch($_GET['action']) {		
			case 'getUser':
				$response = $_SERVER['REMOTE_USER'];
			break;
			case 'saveUser':
							
			break;
			default: throw new Exception('Wrong action');
		}
		echo json_encode($response);
	} catch(Exception $e) {
		die(json_encode(array('error' => $e->getMessage())));
	}
?>