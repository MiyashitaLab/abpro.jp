<?php
    $id = htmlspecialchars($_GET['id'], ENT_QUOTES, 'UTF-8');
    $url = 'http://api.twitter.com/1/statuses/user_timeline.xml?id=' . $id;
    $response = @file_get_contents($url);
    $xml = simplexml_load_string($response);
    $json = '{';
    $json .= '"following": "' . $xml->status->user->friends_count . '",';
    $json .= '"followed": "' . $xml->status->user->followers_count . '"';
    $json .= '}';
    print $json;
?>
