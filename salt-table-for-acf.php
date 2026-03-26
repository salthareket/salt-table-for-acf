<?php
/*
Plugin Name: Extended Table Field Add-on for ACF
Plugin URI: https://www.acf-table-field.com
Description: This free Add-on adds a table field type for the plugins Advanced Custom Fields and Secure Custom Fields.
Version: 1.3.30
Author: Tolga Koçak
Author URI: http://www.salthareket.de
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html
Text Domain: salt-table-for-acf
Domain Path: /languages
*/

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Loads plugin textdomain.
 * https://codex.wordpress.org/Function_Reference/load_plugin_textdomain
 */

function acf_table_extended_load_plugin_textdomain( $version ) {

	load_plugin_textdomain( 'salt-table-for-acf', false, dirname( plugin_basename(__FILE__) ) . '/languages/' );
}

add_action( 'init', 'acf_table_extended_load_plugin_textdomain' );


/**
 * Registers the ACF field type.
 */

add_action( 'init', 'salt_include_acf_field_table' );


function salt_include_acf_field_table() {

	if ( ! function_exists( 'acf_register_field_type' ) ) {

		return;
	}

	require_once __DIR__ . '/class-salt-acf-field-table.php';

	acf_register_field_type( 'salt_acf_field_table' );
}
