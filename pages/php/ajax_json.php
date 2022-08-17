<?php
header('Content-type: application/json');
sleep(1);
exit(json_encode([
  "items" => [
    'ajax' => [1,2,3],
    'json'=>[4,5,6],
    'response'=>[
      ["id"=>1, "name"=>"Apples",  "price"=>"$2"],
      ["id"=>2, "name"=>"Peaches", "price"=>"$5"]
    ]
  ]
]));
?>