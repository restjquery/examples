var response = null;

var restjQuery = function( options ) {
	'use strict';

	var hostName = window.location.hostname; // Returns current host name only.

	var protocol = window.location.protocol; // Returns the protocol used. i.e file: or http: or https:

	// These are the default settings.
	var settings = $.extend({
		site_url: protocol + "//" + hostName, // Default is the current host name. Only set if connecting with another site.
		username: '', // Only set if authorization is needed.
		password: '', // Only set if authorization is needed.
		nonce: '', // Must be set so logged in users can access authorized requests.
		namespace: 'wp/v2/', // Default is wp/v2/ for WordPress. For WooCommerce, set it to wc/v1/
		endpoint: 'posts', // Default: Posts
		postData: '{}', // Default: Empty JSON
		mediaFile: '', // Default: Empty - Used to attach the media file to upload.
		filename: '', // Default: Empty - Used to specify the filename that the media file will be called.
		formMethod: 'GET', // Default: GET. Can use POST for posting data.
		dataType: 'json', // Default: json - For cross-domain support, set as jsonp
		cache: true, // Default: true - If dataType is set as jsonp then this will automatically set to false.
	}, options );

	if ( settings.site_url == '' && protocol == 'file:' ) {
		console.error('WP REST API jQuery Error: Script can not run as a file.');
		return false;
	}

	// Checks if a password was entered if username is not empty.
	if ( settings.username !== '' && settings.password == '' ) {
		console.error('WP REST API jQuery Error: Password for authorization is missing!');
		return false;
	}

	// Checks that the namespace is identified.
	if ( settings.namespace == '' ) {
		console.error('WP REST API jQuery Error: Namespace is unknown!');
		return false;
	}

	// Checks that the endpoint is defined.
	if ( settings.endpoint == '' ) {
		console.error('WP REST API jQuery Error: Endpoint was not defined!');
		return false;
	}

	// Checks that the AJAX method is not empty.
	if ( settings.formMethod == '' ) {
		console.error('WP REST API jQuery Error: Ajax method was not set!');
		return false;
	}

	// Checks if we are posting data and post data is not empty.
	if ( settings.formMethod !== 'GET' && settings.postData == '{}' ) {
		console.error('WP REST API jQuery Error: Post data is empty!');
		return false;
	}

	// Set cache to false if dataType is set to jsonp.
	if ( settings.dataType == 'jsonp' ) {
		settings.cache = false;
	}

	// Check if the request requires authentication. False by default.
	var auth_headers = false;
	//if ( settings.username !== '' && settings.password !== '' ) {
	if ( settings.nonce !== '' ) {
		auth_headers = true;
	}

	console.log('Requested Endpoint: ' + settings.site_url + "/wp-json/" + settings.namespace + settings.endpoint );

	var standard_request = true;

	// Checks that we are posting data for uploading media files.
	if ( settings.endpoint == 'media' && settings.formMethod == 'POST' ) {
		standard_request = false;
	}

	if ( standard_request ) {
		response = restRequest( settings );
	}
	else {
		response = restUploadMedia( settings );
	}

	return response;

	/**
	 * This runs the REST API request. Passes the settings variable.
	 */
	function restRequest( settings ) {

		// If authorization is requested then we set the appropriate headers.
		if ( auth_headers ) {

			console.log('WP REST API jQuery Authenticating Request...');

			$.ajax({
				async: false,
				url: settings.site_url + "/wp-json/" + settings.namespace + settings.endpoint,
				method: settings.formMethod,
				//cache: settings.cache,
				crossDomain: true,
				//crossOrigin: true,
				contentType: 'application/json',
				data: settings.postData,
				beforeSend: function ( xhr ) {
					xhr.setRequestHeader( 'X-WP-Nonce', settings.nonce ),
					//xhr.setRequestHeader( 'Authorization', 'Basic ' + settings.username + ':' + settings.password );
					//xhr.setRequestHeader( 'Authorization', 'Basic ' + Base64.encode( settings.username + ':' + settings.password ) );
					xhr.setRequestHeader( 'Authorization', 'Basic ' + btoa( settings.username + ':' + settings.password ) );
				},
				/*success: function( newData ) {
					response = newData;
				},*/
				complete: function( newData ) {
					response = newData;
				},
				error: function( error ) {
					response = error;
				},
				dataType: settings.dataType
			});

		}
		else {

			$.ajax({
				async: false,
				url: settings.site_url + "/wp-json/" + settings.namespace + settings.endpoint,
				method: settings.formMethod,
				cache: settings.cache,
				contentType: "application/json",
				crossDomain: true,
				crossOrigin: true,
				data: settings.postData,
				complete: function( newData ) {
					response = newData.responseJSON;
				},
				error: function( error ) {
					response = error;
				},
				dataType: settings.dataType
			});

		}

		return response;

	}

	function restUploadMedia( settings ) {
		console.log(settings.postData);

		$.ajax({
			//async: false,
			url: settings.site_url + "/wp-json/" + settings.namespace + "media",
			method: 'POST',
			data: settings.postData,
			processData: false,
			//cache: false,
			contentType: false,
			crossDomain: true,
			//dataType: 'json',
			/*xhr: function() {
				var myXhr = $.ajaxSettings.xhr();

				if ( myXhr.upload ) {
					myXhr.upload.addEventListener( 'progress', function(e) {
						if ( e.lengthComputable ) {
							var perc = ( e.loaded / e.total ) * 100;
							perc = perc.toFixed(2);
							//$imgNotice.html('Uploading&hellip;(' + perc + '%)');
						}
					}, false );
				}

				return myXhr;
			},*/
			//headers: { 'Content-Disposition': 'attachment;filename=' + settings.filename },
			beforeSend: function ( xhr ) {
				xhr.setRequestHeader( 'X-WP-Nonce', settings.nonce );
				xhr.setRequestHeader( 'Authorization', 'Basic ' + btoa( settings.username + ':' + settings.password ) );
			},
			complete: function( newData ) {
				response = newData;

				if ( newData.status == '200' ) {
					alert('Upload Done');
				}
				else {
					alert('Upload failed!');
				}
			},
			error: function( error ) {
				response = error;
			},
			dataType: settings.dataType
		});

		return response;
	}

};
