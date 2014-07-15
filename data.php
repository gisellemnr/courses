<?php
	list($user, $extra) = split('@', $_SERVER['REMOTE_USER']);
  	try {
		$response = array();
		switch($_GET['action']) {
			case 'addUser':
				$db = new SQLite3("courses.db");
				$sql = $db->prepare("INSERT INTO Courses VALUES (:user, '{}')");
				$sql->bindValue(':user', $user);
				$sql->execute();
				$db->close();
				unset($db);
			break;
			case 'setUser':
				$db = new SQLite3("courses.db");
				$sql = $db->prepare("UPDATE Courses SET json=:json WHERE user=:user");
				$sql->bindValue(':user', $user);
				$sql->bindValue(':json', $_GET['json']);
				$sql->execute();
				$db->close();
				unset($db);
			break;
			case 'getUser':
				$db = new SQLite3("courses.db");
				$sql = $db->prepare("SELECT * FROM Courses WHERE user=:user");
				$sql->bindValue(':user', $user);
				$re = $sql->execute();
				while ($row = $re->fetchArray()) {
					array_push($response, $row);
				}
				$db->close();
				unset($db);
			break;
			case 'getUsers':
				$db = new SQLite3("courses.db");
				$re = $db->query("SELECT * FROM Courses ORDER BY user");
				while ($row = $re->fetchArray()) {
					array_push($response, $row);
				}
				$db->close();
				unset($db);
			break;
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