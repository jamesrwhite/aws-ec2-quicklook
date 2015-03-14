<?php

// Load the composer autoloader
require '../vendor/autoload.php';

// Load our aws config
$config = require '../config/aws.php';

// Create our Slim app
$app = new \Slim\Slim();

// Get an instance of the ec2 client
$ec2 = \Aws\Ec2\Ec2Client::factory($config);

// Execute a search of ec2 instances
$app->get('/search/:query', function ($query) use($ec2) {
    // Build the search term
    $query = urldecode("*{$query}*");

    // Execute the search
    $results = $ec2->describeInstances(array(
        'Filters' => array(
            array(
                'Name' => 'tag-value',
                'Values' => array("*{$query}*")
            ),
        ),
    ))->toArray();

    $response = array();

    // Format our response
    foreach ($results['Reservations'] as $reservation) {
        foreach ($reservation['Instances'] as $instance) {
            // Try and find the name tag
            $name = array_filter($instance['Tags'], function($tag) {
                return $tag['Key'] === 'Name';
            });
            $name = reset($name);
            $name = !empty($name['Value']) ? $name['Value'] : null;

            $response[] = array(
                'name' => $name,
                'instance-id' => $instance['InstanceId'],
                'state' => $instance['State']['Name'],
                'private-ip' => !empty($instance['PrivateIpAddress']) ? $instance['PrivateIpAddress'] : null,
                'public-ip' => !empty($instance['PublicIpAddress']) ? $instance['PublicIpAddress'] : null,
            );
        }
    }

    // Return a JSON response
    header('Content-Type: application/json');
    echo json_encode($response);
});

// Off we go..
$app->run();
