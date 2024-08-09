document.addEventListener("DOMContentLoaded", function() {
    var ajaxRequestSent = false; // Variable to track whether the AJAX request has been sent

    // Function to make the AJAX request
    function makeRequest() {
        // Add a class to the body tag to indicate that an AJAX request is in progress
        $('body').addClass('ajax-request-in-progress');

        // AJAX request for scraping other websites
        $.ajax({
            type: "POST",
            url: "{% url 'scrap_other' %}",
            headers: { "X-CSRFToken": "{{ csrf_token }}" }, // Include CSRF token
            data: { 'q': '{{ query }}' },
            success: function(response) {
                // Remove the class from the body tag when the request is complete
                $('body').removeClass('ajax-request-in-progress');

                // Remove any existing rows from the table
                $('#job-listings-table tbody').empty();

                // Append each job listing to the table
                $.each(response.job_listings, function(index, job) {
                    var row = '<tr>' +
                        '<td><a href="' + job.url + '"><b>' + job.title + '</b></a></td>' +
                        '<td>' + job.discription + '</td>' +
                        '<td>' + job.location + '</td>' +
                        '<td>' +
                        '<form id="save-job-form">' +
                        '{% csrf_token %}' +
                        '<input type="hidden" name="job_id" value="' + job.id + '">' +
                        '<button type="button" class="btn btn-outline-secondary save-btn">' +
                        '<i class="fas fa-save"></i> Save' +
                        '</button>' +
                        '</form>' +
                        '</td>' +
                        '</tr>';
                    $('#job-listings-table tbody').append(row);

                });

                // Set the total jobs count
                $('#total-job').text('Total Jobs: ' + response.total_jobs);

                // Set the total pages count
                $('#total-pagination').text('Total Pages: ' + response.total_pages);

                // Update pagination links
                $('#pagination-links').empty();

                $.each(response.limited_page_range, function(index, num) {
                    var pageLink = '<li class="page-item ' + (num == response.current_page ? 'active' : '') + '">' +
                        '<a class="page-link" href="?page=' + num + '" data-page="' + num + '">' + num + '</a>' +
                        '</li>';
                    $('#pagination-links').append(pageLink);
                });

                // Add Previous button if available
                if (response.has_previous) {
                    var previousPageLink = '<li class="page-item">' +
                        '<a class="page-link" href="?page=' + (parseInt(response.current_page) - 1) + '">Previous</a>' +
                        '</li>';
                    $('#pagination-links').prepend(previousPageLink);
                }

                // Add Next button if available
                if (response.has_next) {
                    var nextPageLink = '<li class="page-item">' +
                        '<a class="page-link" href="?page=' + (parseInt(response.current_page) + 1) + '">Next</a>' +
                        '</li>';
                    $('#pagination-links').append(nextPageLink);
                }

                // Call the byat function after successfully adding data to the table
                alert('Mustakbil Scraped');
                byat();

            },
            error: function(xhr, status, error) {
                console.error(xhr.responseText);
            }
        });
    }

    // Call the function to make the request only if the request hasn't been sent already
    if ('{{ query }}') {
        if (!ajaxRequestSent) {
            makeRequest();
            ajaxRequestSent = true; // Set the flag to true to indicate that the request has been sent
        }
    }

});
$(document).ready(function() {
    // Event listener for the save job button
    $(document).on('click', '.save-btn', function(e) {
        e.preventDefault(); // Prevent the default form submission

        var formData = $(this).closest('form').serialize(); // Serialize the form data for the clicked button

        $.ajax({
            type: "POST",
            url: "{% url 'save_job' %}",
            headers: { "X-CSRFToken": "{{ csrf_token }}" },
            data: formData,
            success: function(response) {
                // Handle success response
                alert('Job saved successfully!');
            },
            error: function(xhr, status, error) {
                // Handle error response
                alert('Error saving job: ' + error);
            }
        });
    });

    // Event listener for pagination links
    $(document).on('click', '.pagination a', function(e) {
        e.preventDefault(); // Prevent default link behavior

        var pageUrl = $(this).attr('href'); // Get the URL from the clicked pagination link
        loadJobListings(pageUrl); // Call the function to load job listings for the clicked page
    });

    // Function to load job listings dynamically
    function loadJobListings(url) {
        $.ajax({
            url: url,
            type: 'GET',
            success: function(data) {
                $('#job-listings-table').html(data.html); // Update the job listings table with the new data
                window.history.pushState(null, null, url); // Update the browser URL
            },
            error: function(xhr, status, error) {
                console.error(xhr.responseText);
            }
        });
    }
});
$(document).ready(function() {
    $(document).on('click', '.pagination a', function(e) {
        e.preventDefault();
        var pageUrl = $(this).attr('href');
        loadJobListings(pageUrl);
    });

    function loadJobListings(url) {
        $.ajax({
            url: url,
            type: 'GET',
            success: function(data) {
                $('#job-listings-table').html(data.html);
                window.history.pushState(null, null, url); // Update the browser URL
            },
            error: function(xhr, status, error) {
                console.error(xhr.responseText);
            }
        });
    }
});

function byat() {
    $(document).ready(function() {
        // Add a class to the body tag to indicate that an AJAX request is in progress
        $('body').addClass('ajax-request-in-progress');

        // AJAX request for scraping other websites
        $.ajax({
            type: "POST",
            url: "{% url 'byat' %}",
            headers: { "X-CSRFToken": "{{ csrf_token }}" }, // Include CSRF token
            data: { 'q': '{{ query }}' },
            success: function(response) {
                // Remove the class from the body tag when the request is complete
                $('body').removeClass('ajax-request-in-progress');

                // Remove any existing rows from the table
                $('#job-listings-table tbody').empty();

                // Append each job listing to the table
                $.each(response.job_listings, function(index, job) {
                    var row = '<tr>' +
                        '<td><a href="' + job.url + '"><b>' + job.title + '</b></a></td>' +
                        '<td>' + job.discription + '</td>' + // corrected 'discription' to 'description'
                        '<td>' + job.location + '</td>' +
                        '<td>' +
                        '<form class="save-job-form">' + // changed id to class to avoid duplicate IDs
                        '{% csrf_token %}' +
                        '<input type="hidden" name="job_id" value="' + job.id + '">' +
                        '<button type="button" class="btn btn-outline-secondary save-btn">' +
                        '<i class="fas fa-save"></i> Save' +
                        '</button>' +
                        '</form>' +
                        '</td>' +
                        '</tr>';
                    $('#job-listings-table tbody').append(row);
                });

                // Set the total jobs count
                $('#total-job').text('Total Jobs: ' + response.total_jobs);

                // Set the total pages count
                $('#total-pagination').text('Total Pages: ' + response.total_pages);

                // Update pagination links
                $('#pagination-links').empty();

                $.each(response.limited_page_range, function(index, num) {
                    var pageLink = '<li class="page-item ' + (num == response.current_page ? 'active' : '') + '">' +
                        '<a class="page-link" href="?page=' + num + '" data-page="' + num + '">' + num + '</a>' +
                        '</li>';
                    $('#pagination-links').append(pageLink);
                });

                // Add Previous button if available
                if (response.has_previous) {
                    var previousPageLink = '<li class="page-item">' +
                        '<a class="page-link" href="?page=' + (parseInt(response.current_page) - 1) + '">Previous</a>' +
                        '</li>';
                    $('#pagination-links').prepend(previousPageLink);
                }

                // Add Next button if available
                if (response.has_next) {
                    var nextPageLink = '<li class="page-item">' +
                        '<a class="page-link" href="?page=' + (parseInt(response.current_page) + 1) + '">Next</a>' +
                        '</li>';
                    $('#pagination-links').append(nextPageLink);
                }

                // Call the byat function after successfully adding data to the table
                alert('Byat Scraped');
            },
            error: function(xhr, status, error) {
                console.error(xhr.responseText);
            }
        });
    });
}
alert("Asad");