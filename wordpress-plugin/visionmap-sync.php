<?php
/**
 * Plugin Name: Vision MAP Sync
 * Description: Stores each student's Vision MAP against their WordPress account so it follows them across devices. Exposes two REST routes authenticated by the same JWT the vercel_sso_iframe shortcode already issues.
 * Version:     1.0.0
 * Author:      The Sellership System
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Origin allowed to call these routes. This is the Vision MAP app on Vercel.
 * Override in wp-config.php with:
 *   define( 'VISIONMAP_ALLOWED_ORIGIN', 'https://visionmap.sellershipuniversity.com' );
 */
function visionmap_allowed_origin() {
	return defined( 'VISIONMAP_ALLOWED_ORIGIN' )
		? VISIONMAP_ALLOWED_ORIGIN
		: 'https://visionmap.sellershipuniversity.com';
}

/** Where a student's MAP lives. One row per user. */
const VISIONMAP_META_KEY = 'visionmap_state';

/** Reject anything larger than this, so a runaway payload cannot fill the DB. */
const VISIONMAP_MAX_BYTES = 2097152; // 2 MB

/* -------------------------------------------------------------------------
 * JWT verification
 *
 * Mirrors the signing done in the vercel_sso_iframe shortcode: HS256 over
 * "header.payload" using the secret in wp-config.php. We verify the signature
 * before trusting any claim, then use user_id from the payload.
 * ---------------------------------------------------------------------- */

function visionmap_base64url_decode( $input ) {
	$remainder = strlen( $input ) % 4;
	if ( $remainder ) {
		$input .= str_repeat( '=', 4 - $remainder );
	}
	return base64_decode( strtr( $input, '-_', '+/' ) );
}

/**
 * Verify a JWT and return its payload, or a WP_Error explaining the refusal.
 */
function visionmap_verify_token( $token ) {
	if ( ! defined( 'VISIONMAP_JWT_SECRET' ) || '' === VISIONMAP_JWT_SECRET ) {
		return new WP_Error(
			'visionmap_no_secret',
			'VISIONMAP_JWT_SECRET is not defined in wp-config.php.',
			array( 'status' => 500 )
		);
	}

	$parts = explode( '.', (string) $token );
	if ( 3 !== count( $parts ) ) {
		return new WP_Error( 'visionmap_bad_token', 'Malformed token.', array( 'status' => 401 ) );
	}

	list( $header_b64, $payload_b64, $signature_b64 ) = $parts;

	// Only HS256 is accepted. Refusing everything else prevents an attacker
	// swapping the algorithm to "none" and bypassing the signature entirely.
	$header = json_decode( visionmap_base64url_decode( $header_b64 ), true );
	if ( ! is_array( $header ) || ! isset( $header['alg'] ) || 'HS256' !== $header['alg'] ) {
		return new WP_Error( 'visionmap_bad_alg', 'Unsupported token algorithm.', array( 'status' => 401 ) );
	}

	$expected = hash_hmac( 'sha256', $header_b64 . '.' . $payload_b64, VISIONMAP_JWT_SECRET, true );
	$provided = visionmap_base64url_decode( $signature_b64 );

	// Constant time comparison, so response timing cannot leak the signature.
	if ( ! hash_equals( $expected, $provided ) ) {
		return new WP_Error( 'visionmap_bad_signature', 'Token signature does not match.', array( 'status' => 401 ) );
	}

	$payload = json_decode( visionmap_base64url_decode( $payload_b64 ), true );
	if ( ! is_array( $payload ) ) {
		return new WP_Error( 'visionmap_bad_payload', 'Unreadable token payload.', array( 'status' => 401 ) );
	}

	// 60s of leeway for clock drift between the browser and the server.
	if ( isset( $payload['exp'] ) && time() > ( (int) $payload['exp'] + 60 ) ) {
		return new WP_Error( 'visionmap_expired', 'Token has expired.', array( 'status' => 401 ) );
	}

	if ( empty( $payload['user_id'] ) || ! get_userdata( (int) $payload['user_id'] ) ) {
		return new WP_Error( 'visionmap_no_user', 'Token does not identify a valid user.', array( 'status' => 401 ) );
	}

	return $payload;
}

/**
 * Permission callback. Resolves the caller to a WordPress user id, which is the
 * only thing the handlers are allowed to read or write against. A student can
 * never address another student's row, because the id comes from the signed
 * token rather than from anything the client sends.
 */
function visionmap_authenticate( WP_REST_Request $request ) {
	$header = $request->get_header( 'authorization' );
	if ( ! $header && isset( $_SERVER['HTTP_AUTHORIZATION'] ) ) {
		$header = $_SERVER['HTTP_AUTHORIZATION'];
	}
	if ( ! $header || 0 !== stripos( $header, 'bearer ' ) ) {
		return new WP_Error( 'visionmap_no_token', 'Missing bearer token.', array( 'status' => 401 ) );
	}

	$payload = visionmap_verify_token( trim( substr( $header, 7 ) ) );
	if ( is_wp_error( $payload ) ) {
		return $payload;
	}

	$GLOBALS['visionmap_user_id'] = (int) $payload['user_id'];
	return true;
}

function visionmap_current_user_id() {
	return isset( $GLOBALS['visionmap_user_id'] ) ? (int) $GLOBALS['visionmap_user_id'] : 0;
}

/* -------------------------------------------------------------------------
 * Routes
 * ---------------------------------------------------------------------- */

add_action( 'rest_api_init', function () {
	register_rest_route( 'visionmap/v1', '/state', array(
		array(
			'methods'             => 'GET',
			'callback'            => 'visionmap_get_state',
			'permission_callback' => 'visionmap_authenticate',
		),
		array(
			'methods'             => 'POST',
			'callback'            => 'visionmap_save_state',
			'permission_callback' => 'visionmap_authenticate',
		),
	) );
} );

function visionmap_get_state( WP_REST_Request $request ) {
	$user_id = visionmap_current_user_id();
	$stored  = get_user_meta( $user_id, VISIONMAP_META_KEY, true );
	$state   = $stored ? json_decode( $stored, true ) : null;

	return new WP_REST_Response( array(
		'state'      => is_array( $state ) ? $state : new stdClass(),
		'updated_at' => get_user_meta( $user_id, VISIONMAP_META_KEY . '_updated', true ),
	), 200 );
}

function visionmap_save_state( WP_REST_Request $request ) {
	$user_id = visionmap_current_user_id();
	$body    = $request->get_json_params();

	if ( ! isset( $body['state'] ) || ! is_array( $body['state'] ) ) {
		return new WP_Error( 'visionmap_bad_body', 'Expected a state object.', array( 'status' => 400 ) );
	}

	$encoded = wp_json_encode( $body['state'] );
	if ( false === $encoded ) {
		return new WP_Error( 'visionmap_bad_json', 'State could not be encoded.', array( 'status' => 400 ) );
	}
	if ( strlen( $encoded ) > VISIONMAP_MAX_BYTES ) {
		return new WP_Error(
			'visionmap_too_large',
			'State is larger than the 2 MB limit. This usually means large vision board images.',
			array( 'status' => 413 )
		);
	}

	$now = current_time( 'mysql' );
	update_user_meta( $user_id, VISIONMAP_META_KEY, $encoded );
	update_user_meta( $user_id, VISIONMAP_META_KEY . '_updated', $now );

	return new WP_REST_Response( array( 'ok' => true, 'updated_at' => $now ), 200 );
}

/* -------------------------------------------------------------------------
 * CORS
 *
 * The app is served from the Vision MAP subdomain and calls this API on the
 * main domain, so the browser sends a cross origin request. We allow exactly
 * one origin rather than "*", and no credentials, because auth rides in the
 * Authorization header instead of a cookie.
 * ---------------------------------------------------------------------- */

add_action( 'rest_api_init', function () {
	remove_filter( 'rest_pre_serve_request', 'rest_send_cors_headers' );

	add_filter( 'rest_pre_serve_request', function ( $served, $result, $request ) {
		if ( 0 !== strpos( $request->get_route(), '/visionmap/v1' ) ) {
			return $served;
		}

		$origin = get_http_origin();
		if ( $origin && $origin === visionmap_allowed_origin() ) {
			header( 'Access-Control-Allow-Origin: ' . $origin );
			header( 'Access-Control-Allow-Methods: GET, POST, OPTIONS' );
			header( 'Access-Control-Allow-Headers: Authorization, Content-Type' );
			header( 'Access-Control-Max-Age: 86400' );
			header( 'Vary: Origin' );
		}

		return $served;
	}, 10, 3 );
}, 15 );

// Answer the browser's preflight before WordPress tries to route it.
add_action( 'parse_request', function () {
	if ( empty( $_SERVER['REQUEST_METHOD'] ) || 'OPTIONS' !== $_SERVER['REQUEST_METHOD'] ) {
		return;
	}
	if ( empty( $_SERVER['REQUEST_URI'] ) || false === strpos( $_SERVER['REQUEST_URI'], '/visionmap/v1' ) ) {
		return;
	}

	$origin = get_http_origin();
	if ( $origin && $origin === visionmap_allowed_origin() ) {
		header( 'Access-Control-Allow-Origin: ' . $origin );
		header( 'Access-Control-Allow-Methods: GET, POST, OPTIONS' );
		header( 'Access-Control-Allow-Headers: Authorization, Content-Type' );
		header( 'Access-Control-Max-Age: 86400' );
		header( 'Vary: Origin' );
	}
	status_header( 204 );
	exit;
}, 0 );
