<?php
	header('Content-Type: text/event-stream');
	header('Cache-Control: no-cache');

	$time = date('r');
	echo "data: server time: {$time}\n\n";
	ob_flush();
	flush();
?>