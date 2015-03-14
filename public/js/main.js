'use strict';

(function() {
    var running = false,
        timeout,
        request;

    $('input.search').on('keyup', function() {
        // Get the search term
        var query = $(this).val();

        // Clear any queued up searches/requests
        if (running) {
            clearTimeout(timeout);

            if (typeof(request) === 'object') {
                request.abort();
            }
        }

        // Get a reference to our table
        var $table = $('table');

        // Toggle the table visiblilty
        $table.addClass('hide');
        $table.find('> tbody').empty();

        // Don't execute 0 length queries
        if (query.length > 0) {
            // Show the loading indicator
            $('img').addClass('show');

            // Execute the search after 100ms
            running = true;
            timeout = setTimeout(function() {
                request = $.getJSON('ajax.php/search/' + encodeURIComponent(query)).done(function(instances) {
                    // Loop the response and add it to the table
                    instances.forEach(function(instance) {
                        // Default the IP's if they don't exist
                        instance['private-ip'] = instance['private-ip'] === null ? 'n/a' : instance['private-ip'];
                        instance['public-ip'] = instance['public-ip'] === null ? 'n/a' : instance['public-ip'];

                        // Build the rows
                        var rows =  '<tr>';
                            rows += '<td>' + instance['state'] + '</td>';
                            rows += '<td>' + instance['name'] + '</td>';
                            rows += '<td><input class="select" onfocus="this.select()" value="' + instance['instance-id'] + '"/></td>';
                            rows += '<td><input class="select" onfocus="this.select()" value="' + instance['private-ip'] + '"/></td>';
                            rows += '<td><input class="select" onfocus="this.select()" value="' + instance['public-ip'] + '"/></td>';
                            rows += '</tr>';

                        // Append the rows
                        $table.find('> tbody').append(rows);

                        // Show the table
                        $table.removeClass('hide');
                    });
                }).always(function() {
                    running = false;

                    // Hide the loading image
                    $('img').removeClass('show');
                });
            }, 100);
        }
    });
})();