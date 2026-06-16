<?php

/**
 * salt_acf_field_table — ACF Table Extended Field Type
 *
 * @version 1.3.31
 *
 * @changelog
 *   1.3.31 - 2026-05-18
 *     - Add: format_value() — image/text_image cell'lerine alt text eklendi
 *       - _wp_attachment_image_alt meta'dan alınır, boşsa post title kullanılır
 *       - Body ve header cell'lerinde çalışır
 *   1.3.30 - Önceki versiyon
 *
 * How to use:
 *   // Twig'de image cell alt text:
 *   <img src="{{ cell.image.url }}" alt="{{ cell.image.alt }}" />
 *
 *   // PHP'de format_value() sonrası:
 *   $table = get_field('table');
 *   foreach ($table['body'] as $row) {
 *       foreach ($row as $cell) {
 *           if ($cell['type'] === 'image') {
 *               echo $cell['image']['alt']; // artık dolu geliyor
 *           }
 *       }
 *   }
 */

class salt_acf_field_table extends acf_field {

	/*
	*  __construct
	*
	*  This function will setup the field type data
	*
	*  @type	function
	*  @date	29/12/2014
	*  @since	5.0.0
	*
	*  @param	n/a
	*  @return	n/a
	*/

	public $settings;

	public $name;

	public $description;

	public $preview_image;

	public $doc_url;

	public $label;

	public $category;

	public $defaults;

	public $l10n;

	function __construct() {

		/*
		*  settings (array) Array of settings
		*/
		$this->settings = array(
			'version' => '1.3.30',
			'dir_url' => plugins_url( '', __FILE__ ) . '/',
		);

		/*
		*  name (string) Single word, no spaces. Underscores allowed
		*/

		$this->name = 'table';

		$this->description = __('This allows you to easily edit tabular content.', 'salt-table-for-acf');

		$this->preview_image = plugins_url( '', __FILE__ ) . '/assets/images/field-preview-table.png';

		$this->doc_url = 'https://github.com/salthareket/salt-table-for-acf';

		/*
		*  label (string) Multiple words, can include spaces, visible when selecting a field type
		*/

		$this->label = __('Table Extended', 'salt-table-for-acf');

		/*
		*  category (string) basic | content | choice | relational | jquery | layout | CUSTOM GROUP NAME
		*/

		$this->category = 'content';

		/*
		*  defaults (array) Array of default settings which are merged into the field object. These are used later in settings
		*/

		$this->defaults = array(
			//'font_size'	=> 14,
		);

		/*
		*  l10n (array) Array of strings that are used in JavaScript. This allows JS strings to be translated in PHP and loaded via:
		*  var message = acf._e('table', 'error');
		*/

		$this->l10n = array(
			//'error'	=> __('Error! Please enter a higher value.', 'salt-table-for-acf'),
		);

		// do not delete!
		parent::__construct();

		// PREVENTS SAVING INVALID TABLE FIELD JSON DATA {

			if (
				! defined( 'ACF_TABLEFIELD_FILTER_POSTMETA' ) OR
				constant( 'ACF_TABLEFIELD_FILTER_POSTMETA' ) === true
			) {

				add_filter( 'update_post_metadata', function( $x, $object_id, $meta_key, $meta_value, $prev_value ) {

					// detecting ACF table json
					if (
						is_string( $meta_value ) and
						strpos( $meta_value, '"acftf":{' ) !== false
					) {

						// is new value a valid json string
						json_decode( $meta_value );

						if ( json_last_error() !== JSON_ERROR_NONE ) {

							// canceling meta value uptdate
							$error_message = 'The plugin salt-table-for-acf prevented a third party update_post_meta( ' . $object_id . ', "' . $meta_key . '", $value ); action that would save a broken JSON string.' . "\n" . 'For details see https://codex.wordpress.org/Function_Reference/update_post_meta#Character_Escaping.';
							trigger_error( esc_html( $error_message ), E_USER_WARNING );
							return true;
						}
					}

					return $x;

				}, 10, 5 );
			}

		// }

	}

	/*
	*  render_field_settings()
	*
	*  Create extra settings for your field. These are visible when editing a field
	*
	*  @type	action
	*  @since	3.6
	*  @date	23/01/13
	*
	*  @param	$field (array) the $field being edited
	*  @return	n/a
	*/

	function render_field_settings( $field ) {

		/*
		*  acf_render_field_setting
		*
		*  This function will create a setting for your field. Simply pass the $field parameter and an array of field settings.
		*  The array of settings does not require a `value` or `prefix`; These settings are found from the $field array.
		*
		*  More than one setting can be added by copy/paste the above code.
		*  Please note that you must also have a matching $defaults value for the field name (font_size)
		*/

		acf_render_field_setting( $field, array(
			'label'			=> __('Table Header','salt-table-for-acf'),
			'instructions'	=> __('Presetting the usage of table header','salt-table-for-acf'),
			'type'			=> 'radio',
			'name'			=> 'use_header',
			'choices'   	=>  array(
				0   =>  __( "Optional", 'salt-table-for-acf' ),
				1   =>  __( "Yes", 'salt-table-for-acf' ),
				2   =>  __( "No", 'salt-table-for-acf' ),
			),
			'layout'		=>  'horizontal',
			'default_value'	=> 0,
		));

		acf_render_field_setting( $field, array(
			'label'			=> __('Table Caption','salt-table-for-acf'),
			'instructions'	=> __('Presetting the usage of table caption','salt-table-for-acf'),
			'type'			=> 'radio',
			'name'			=> 'use_caption',
			'choices'   	=>  array(
				1   =>  __( "Yes", 'salt-table-for-acf' ),
				2   =>  __( "No", 'salt-table-for-acf' ),
			),
			'layout'		=>  'horizontal',
			'default_value'	=> 2,
		));

	}

	/*
	*  render_field()
	*
	*  Create the HTML interface for your field
	*
	*  @param	$field (array) the $field being rendered
	*
	*  @type	action
	*  @since	3.6
	*  @date	23/01/13
	*
	*  @param	$field (array) the $field being edited
	*  @return	n/a
	*/

	function render_field( $field ) {

		/*
		*  Review the data of $field.
		*  This will show what data is available
		*/

		if ( empty( $field['use_header'] ) ) {

			$field['use_header'] = 0;
		}

		if ( empty( $field['use_caption'] ) ) {

			$field['use_caption'] = 0;
		}

		$data_field['use_header'] = $field['use_header'];
		$data_field['use_caption'] = $field['use_caption'];

		$e = '';

		$e .= '<div class="acf-table-root">';

			$e .= '<div class="acf-table-optionwrap">';

				// OPTION HEADER {

					if ( $data_field['use_header'] === 0 ) {

						$e .= '<div class="acf-table-optionbox">';
							$e .= '<label for="acf-table-opt-use-header">' . __( 'use table header', 'salt-table-for-acf' ) . ' </label>';
							$e .= '<select class="acf-table-optionbox-field acf-table-fc-opt-use-header" id="acf-table-opt-use-header" name="acf-table-opt-use-header">';
								$e .= '<option value="0">' . __( 'No', 'salt-table-for-acf' ) . '</option>';
								$e .= '<option value="1">' . __( 'Yes', 'salt-table-for-acf' ) . '</option>';
							$e .= '</select>';
						$e .= '</div>';
					}

				// }

				// OPTION CAPTION {

					if ( $data_field['use_caption'] === 1 ) {

						$e .= '<div class="acf-table-optionbox">';
							$e .= '<label for="acf-table-opt-caption">' . __( 'Table Caption', 'salt-table-for-acf' ) . ' </label><br>';
							$e .= '<input class="acf-table-optionbox-field acf-table-fc-opt-caption" id="acf-table-opt-caption" type="text" name="acf-table-opt-caption" value=""></input>';
						$e .= '</div>';
					}

				// }


			$e .= '</div>';

			if ( is_array( $field['value'] ) ) {

				$field['value'] = wp_json_encode( $field['value'] );
			}

			if ( is_string( $field['value'] ) ) {

				if ( substr( $field['value'] , 0 , 1 ) === '{' ) {

					$field['value'] = urlencode( $field['value'] );
				}
			}


			$e .= '<div class="acf-input-wrap">';
				$e .= '<input type="hidden" data-field-options="' . urlencode( wp_json_encode( $data_field ) ) . '" id="' . esc_attr( $field['id'] ) . '"  class="' . esc_attr( $field['type'] ) . '" name="' . esc_attr( $field['name'] ) . '" value="' . $field['value'] . '"/>';
			$e .= '</div>';

		$e .= '</div>';

		echo $e;

	}

	/*
	*  input_admin_enqueue_scripts()
	*/

	function input_admin_enqueue_scripts() {

		// register & include JS
		wp_enqueue_script( 'acf-input-table', $this->settings['dir_url'] . 'js/input-v5.js', array( 'jquery', 'acf-input' ), $this->settings['version'], true );

		// Modal string'lerini JS'e çevrilebilir olarak geç
		wp_localize_script( 'acf-input-table', 'acfTableL10n', [
			'cellType'     => __( 'Cell Type', 'salt-table-for-acf' ),
			'text'         => __( 'Text', 'salt-table-for-acf' ),
			'image'        => __( 'Image', 'salt-table-for-acf' ),
			'file'         => __( 'File', 'salt-table-for-acf' ),
			'boolean'      => __( 'Boolean', 'salt-table-for-acf' ),
			'textImage'    => __( 'Text & Image', 'salt-table-for-acf' ),
			'textFile'     => __( 'Text & File', 'salt-table-for-acf' ),
			'textBoolean'  => __( 'Text & Boolean', 'salt-table-for-acf' ),
			'selectImage'  => __( 'Select Image', 'salt-table-for-acf' ),
			'selectFile'   => __( 'Select File', 'salt-table-for-acf' ),
			'remove'       => __( 'Remove', 'salt-table-for-acf' ),
			'save'         => __( 'Save', 'salt-table-for-acf' ),
			'close'        => __( 'Close', 'salt-table-for-acf' ),
			'clickToEdit'  => __( 'Click to edit', 'salt-table-for-acf' ),
		]);

		// register & include CSS
		wp_register_style( 'acf-input-table', $this->settings['dir_url'] . 'css/input.css', array( 'acf-input' ), $this->settings['version'] );
		wp_enqueue_style( 'acf-input-table' );

	}

	/*
	*  update_value()
	*/

	function update_value( $value, $post_id, $field ) {

		if ( is_string( $value ) ) {

			$value = wp_unslash( $value );
			$value = urldecode( $value );
			$value = json_decode( $value, true );
		}

		// UPDATE via update_field() {

			if (
				isset( $value['header'] ) OR
				isset( $value['body'] )
			) {

				// try post_meta
				$data = get_post_meta( $post_id, $field['name'], true );

				// try user meta
				if ( empty( $data ) ) {

					$data = get_user_meta( str_replace('user_', '', $post_id ), $field['name'], true );
				}

				// try term_meta
				if ( empty( $data ) ) {

					$data = get_term_meta( str_replace('term_', '', $post_id ), $field['name'], true );
				}

				// try options
				if (
					empty( $data ) AND (
						$post_id === 'options' OR
						$post_id === 'option'
					)
				) {
					$data = get_option('options_' . $field['name']);
				}

				// prevents updating a field, thats data are not defined yet
				if ( empty( $data ) ) {

					return false;
				}

				if ( is_string( $data ) ) {

					$data = json_decode( $data, true );
				}

				if ( ! empty( $value['use_header'] ) ) {

					$data['p']['o']['uh'] = 1;
				}
				else {

					$data['p']['o']['uh'] = 0;
				}

				if ( isset( $value['caption'] ) ) {

					$data['p']['ca'] = $value['caption'];
				}

				if (
					isset( $value['header'] ) AND
					$value['header'] !== false
				 ) {

					$data['h'] = $value['header'];
				}

				if ( isset( $value['body'] ) ) {

					$data['b'] = $value['body'];
				}

				// SYNCHRONICE TOP ROW DATA WITH CHANGED AMOUNT OF BODY COLUMNS  {

					$new_amount_of_body_cols = count( $value['body'][0] );
					$db_amount_of_top_cols = count( $data['c'] );

					if ( $new_amount_of_body_cols > $db_amount_of_top_cols ) {

						for ( $i = $db_amount_of_top_cols; $i < $new_amount_of_body_cols; $i++ ) {

							// adds a column entry in top row data
							array_push( $data['c'], array( 'p' => '' ) );
						}
					}

					if ( $new_amount_of_body_cols < $db_amount_of_top_cols ) {

						for ( $i = $new_amount_of_body_cols; $i < $db_amount_of_top_cols; $i++ ) {

							// removes a column entry in top row data
							array_shift( $data['c'] );
						}
					}

				// }

				$value = $data;
			}

		// }

		// $post_id is integer when post is saved, $post_id is string when block is saved
		if ( gettype( $post_id ) === 'integer' ) {

			// only saving a post needs addslashes
			$value = $this->table_slash( $value );
		}

		return $value;
	}



	/*
	*  format_value()
	*
	*  This filter is appied to the $value after it is loaded from the db and before it is returned to the template
	*
	*  @type	filter
	*  @since	3.6
	*  @date	23/01/13
	*
	*  @param	$value (mixed) the value which was loaded from the database
	*  @param	$post_id (mixed) the $post_id from which the value was loaded
	*  @param	$field (array) the field array holding all the field options
	*
	*  @return	$value (mixed) the modified value
	*/

	function format_value( $value, $post_id, $field ) {

		if ( is_string( $value ) ) {

			// CHECK FOR GUTENBERG BLOCK CONTENT (URL ENCODED JSON) {

				if ( substr( $value , 0 , 1 ) === '%' ) {

					$value = urldecode( $value );
				}

			// }

			$value = json_decode( $value, true ); // decode gutenberg JSONs, but also old table JSONs strings to array
		}
        
        //error_log("format_value");
		//error_log(print_r($value, true));

		$a = $value;

		$value = false;

		// IF BODY DATA

		if (
			! empty( $a['b'] ) AND
			is_countable( $a['b'] ) AND
			count( $a['b'] ) > 0
		) {

			$value = array();

			// IF HEADER DATA

			if ( isset( $a['p']['o']['uh'] ) ) {

				if ( 0 === $a['p']['o']['uh'] ) {

					$value['use_header'] = false;
				}
				elseif ( 1 === $a['p']['o']['uh'] ) {

					$value['use_header'] = true;
				}
			}

			if ( ! empty( $a['p']['o']['uh'] ) ) {

				$value['header'] = $a['h'];
			}
			else {

				$value['header'] = false;
			}

			// IF CAPTION DATA

			if (
				! empty( $field['use_caption'] ) AND
				$field['use_caption'] === 1 AND
				! empty( $a['p']['ca'] )
			) {

				$value['caption'] = $a['p']['ca'];
			}
			else {

				$value['caption'] = false;
			}

			// BODY

			$value['body'] = $a['b'];

			// Image cell'lerine alt text ekle
			foreach ( $value['body'] as $row_idx => $row ) {
				foreach ( $row as $col_idx => $cell ) {
					if ( isset( $cell['type'] ) && in_array( $cell['type'], ['image', 'text_image'], true ) ) {
						if ( ! empty( $cell['image']['id'] ) ) {
							$alt = get_post_meta( (int) $cell['image']['id'], '_wp_attachment_image_alt', true );
							if ( empty( $alt ) ) {
								$alt = get_the_title( (int) $cell['image']['id'] );
							}
							$value['body'][ $row_idx ][ $col_idx ]['image']['alt'] = $alt ?: '';
						}
					}
				}
			}

			// Header image cell'lerine alt text ekle
			if ( ! empty( $value['header'] ) && is_array( $value['header'] ) ) {
				foreach ( $value['header'] as $col_idx => $cell ) {
					$c = $cell['c'] ?? $cell;
					if ( isset( $c['type'] ) && in_array( $c['type'], ['image', 'text_image'], true ) ) {
						if ( ! empty( $c['image']['id'] ) ) {
							$alt = get_post_meta( (int) $c['image']['id'], '_wp_attachment_image_alt', true );
							if ( empty( $alt ) ) {
								$alt = get_the_title( (int) $c['image']['id'] );
							}
							$value['header'][ $col_idx ]['c']['image']['alt'] = $alt ?: '';
						}
					}
				}
			}

			// IF SINGLE EMPTY CELL, THEN DO NOT RETURN TABLE DATA

			if (
				count( $a['b'] ) === 1
				AND count( $a['b'][0] ) === 1
				AND trim( $a['b'][0][0]['c'] ) === ''
			) {

				$value = false;
			}
		}

		return $value;
	}

	/**
	* get_rest_schema()
	*/

	public function get_rest_schema( array $field ) {

		$schema = array(
			'type'     => array( 'object', 'null' ),
			'title' => 'ACF table custom field type',
			'type' => array( 'object', 'boolean' ),
			//'properties' => array(),
			'required' => ! empty( $field['required'] ) ? array() : false,
		);

		return $schema;
	}

	/**
	* table_slash()
	*
	* Add slashes to a string or strings in an array.
	*
	* This should be used instead of wp_slash() because wp_slash() convertes all
	* array values to strings which affects also the table object values of
	* type number converting to string.
	*/

	function table_slash( $value ) {

		if ( is_array( $value ) ) {

			foreach ( $value as $k => $v ) {

				if (
					is_array( $v ) OR
					is_object( $v )
				) {
					$value[ $k ] = $this->table_slash( $v );
				}
				else if( is_string( $v ) ) {

					$value[ $k ] = addslashes( $v );
				}
				else {

					$value[ $k ] = $v;
				}
			}

		} else {

			if ( null !== $value ) {

				$value = addslashes( $value );
			}
		}

		return $value;
	}

}
