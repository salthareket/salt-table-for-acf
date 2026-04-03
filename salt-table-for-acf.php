<?php
/**
 * Plugin Name: Extended Table Field Add-on for ACF
 * Plugin URI: https://github.com/salthareket/salt-table-for-acf
 * Description: Adds a table field type for Advanced Custom Fields and Secure Custom Fields.
 * Version: 1.3.31
 * Author: Tolga Koçak
 * Author URI: http://www.salthareket.de
 * License: GPLv2 or later
 * License URI: http://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: salt-table-for-acf
 * Domain Path: /languages
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// Bağımlılık kontrolü
add_action( 'admin_init', function() {
    if ( ! class_exists( 'ACF' ) && ! class_exists( 'acf' ) ) {
        add_action( 'admin_notices', function() {
            echo '<div class="notice notice-error"><p><strong>Extended Table Field:</strong> Advanced Custom Fields (ACF) eklentisi yüklü ve aktif olmalıdır.</p></div>';
        });
    }
});

add_action( 'init', function() {
    load_plugin_textdomain( 'salt-table-for-acf', false, dirname( plugin_basename( __FILE__ ) ) . '/languages/' );
});

add_action( 'init', function() {
    if ( ! function_exists( 'acf_register_field_type' ) ) return;
    require_once __DIR__ . '/class-salt-acf-field-table.php';
    acf_register_field_type( 'salt_acf_field_table' );
});
