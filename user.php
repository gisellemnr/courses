<?php
	list($user, $extra) = split('@', $_SERVER['REMOTE_USER']);
  	try {
		switch($_GET['action']) {
			case 'getUsername':
				$response = $user;
			break;
			default: throw new Exception('Wrong action');
		}
		echo json_encode($response);
	} catch (Exception $e) {
		die (json_encode(array('error' => $e->getMessage())));
	}
?>