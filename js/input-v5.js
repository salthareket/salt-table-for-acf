(function($) {
	// Reset modal fields
	function resetModalFields(){
		var modal = $('#acf-table-content-modal');
	    modal.find('.acf-table-mce').val('');
	    modal.find('.acf-table-boolean').prop('checked', false);
	    modal.find('.acf-table-image-id').val('');
	    modal.find('.acf-table-file-id').val('');
	    modal.find('.acf-table-image-url').val('');
	    modal.find('.acf-table-file-url').val('');
	    modal.find('.acf-table-cell-type').val('text');
	    modal.find('.acf-table-image-preview').html('');
	    modal.find('.acf-table-file-preview').html('');
	    modal.find('.acf-table-remove-image').hide();
	    modal.find('.acf-table-remove-file').hide();
	    modal.find('.acf-table-select-image').show();
	    modal.find('.acf-table-select-file').show();
	}
	// Image/File preview ve sil butonu
	function updateImagePreview(modal){
	    var src = modal.find('.acf-table-image-url').val();
	    if(src){
	        //var src = wp.media.attachment(imgId)?.attributes?.url || '';
	        //if(src){
	        	modal.find('.acf-table-image-url').val(src);
	            modal.find('.acf-table-image-preview').html(`<img src="${src}" style="max-width:100px;" />`);
	            modal.find('.acf-table-remove-image').show();
	            modal.find('.acf-table-select-image').hide();
	        //}
	    } else {
	        modal.find('.acf-table-image-preview').html('');
	        modal.find('.acf-table-remove-image').hide();
	        modal.find('.acf-table-select-image').show();
	    }
	}
	function updateFilePreview(modal){
	    var src = modal.find('.acf-table-file-url').val();
	    if(src){
	        //var url = wp.media.attachment(fileId)?.attributes?.url || '';
	        //if(url){
	        	modal.find('.acf-table-file-url').val(src);
	            modal.find('.acf-table-file-preview').html(`<a href="${src}" target="_blank">${src.split('/').pop()}</a>`);
	            modal.find('.acf-table-remove-file').show();
	            modal.find('.acf-table-select-file').hide();
	        //}
	    } else {
	        modal.find('.acf-table-file-preview').html('');
	        modal.find('.acf-table-remove-file').hide();
	        modal.find('.acf-table-select-file').show();
	    }
	}
	function tableCellPreview(cellData) {
	    if (!cellData || typeof cellData !== 'object') return "";
	    let htmlContent = "<div class='d-flex flex-column justify-content-center'>";
	    let type = cellData.type;
	    if ((type == "text" || type == "text_image" || type == "text_file" || type == "text_boolean") && cellData.text) {
	        htmlContent += `<div class="acf-table-cell-preview">${cellData.text}</div>`;
	    }
	    if ((type == "image" || type == "text_image") && cellData.image && cellData.image.url) {
	        htmlContent += `<div class="acf-table-image-preview"><img src="${cellData.image.url}" style="max-width:100px;" /></div>`;
	    }
	    if ((type == "file" || type == "text_file") && cellData.file && cellData.file.url) {
		    let fileName = cellData.file.url.split('/').pop();
		    htmlContent += `<div class="acf-table-file-preview">
		        <a href="${cellData.file.url}" target="_blank">${fileName}</a>
		    </div>`;
		}
	    if ((type == "boolean" || type == "text_boolean")) {
	        htmlContent += '<div class="acf-table-boolean-preview">' + (cellData.boolean?"âœ”":"âŒ") + '</div>';
	    }
	    htmlContent += '</div>';
	    return htmlContent;
	}
	function setCellData(cell, cellData) {
	    if (!cell || !cellData) return;
	    // JSON stringini encode ederek ekle
	    let encoded = encodeURIComponent(JSON.stringify(cellData));
	    cell.attr("data-json", encoded);
	}
	function getCellData(cell) {
	    let raw = cell.attr("data-json");
	    if (!raw) return {};
	    try {
	        return JSON.parse(decodeURIComponent(raw));
	    } catch (e) {
	        console.error("JSON parse hatasÄ±:", e, raw);
	        return {};
	    }
	}
	// Yeni initModalMCE fonksiyonu
	function initModalMCE(modal, content) {
	    let textarea = modal.find('.acf-table-mce');
	    let textareaId = textarea.attr('id');
	    if (!textareaId) return;
	    // TinyMCE zaten varsa sadece content ata
	    if (typeof tinymce !== 'undefined' && tinymce.get(textareaId)) {
	        tinymce.get(textareaId).setContent(content || '');
	        return;
	    }
	    // Quicktags varsa temizle
	    if (typeof quicktags !== 'undefined' && QTags.instances[textareaId]) {
	        delete QTags.instances[textareaId];
	    }
	    // WordPress editÃ¶rÃ¼ init et
	    wp.editor.initialize(textareaId, {
	        tinymce: {
	            wp_autoresize_on: true,
	            toolbar1: 'formatselect bold italic | alignleft aligncenter alignright | bullist numlist | blockquote',
	            toolbar2: 'link unlink | undo redo | removeformat',
	            menubar: false
	        },
	        quicktags: true,
	        mediaButtons: false
	    });
	    // TinyMCE hazÄ±r olunca content ata
	    if (typeof tinymce !== 'undefined') {
	        tinymce.on('AddEditor', function(e) {
	            if (e.editor.id === textareaId) {
	                e.editor.setContent(content || '');
	                tinymce.off('AddEditor'); // sadece bir kez ata
	            }
	        });
	    }
	}
	// Modal aÃ§Ä±ldÄ±ÄŸÄ±nda veya dropdown deÄŸiÅŸtiÄŸinde Ã§aÄŸrÄ±lacak
	function updateCellTypeFields(modal) {
	    let type = modal.find('.acf-table-cell-type').val();
	    // Ã–nce tÃ¼m alanlarÄ± gizle
	    modal.find('.acf-table-field').hide();
	    // Sadece seÃ§ilen tipe ait alanlarÄ± gÃ¶ster
	    switch (type) {
	        case 'text':
	            modal.find('.acf-table-mce-field').show();
	            break;
	        case 'image':
	            modal.find('.acf-table-image-field').show();
	            break;
	        case 'file':
	            modal.find('.acf-table-file-field').show();
	            break;
	        case 'boolean':
	            modal.find('.acf-table-boolean-field').show();
	            break;
	        case 'text_image':
	            modal.find('.acf-table-mce-field').show();
	            modal.find('.acf-table-image-field').show();
	            break;
	        case 'text_file':
	            modal.find('.acf-table-mce-field').show();
	            modal.find('.acf-table-file-field').show();
	            break;
	        case 'text_boolean':
	            modal.find('.acf-table-mce-field').show();
	            modal.find('.acf-table-boolean-field').show();
	            break;
	    }
	}
	// Dropdown deÄŸiÅŸimini yakala
	$(document).on('change', '.acf-table-cell-type', function () {
	    let modal = $(this).closest('.acf-table-modal');
	    updateCellTypeFields(modal);
	});
	// Modal aÃ§Ä±ldÄ±ÄŸÄ±nda da Ã§aÄŸÄ±r
	$(document).on('acf-table-modal-open', function (e, modal) {
	    updateCellTypeFields($(modal));
	});
	// Image seÃ§me butonu
	$('body').on('click', '.acf-table-select-image', function(e){
	    e.preventDefault();
	    var modal = $(this).closest('#acf-table-content-modal');
	    var frame = wp.media({
	        title: 'Select Image',
	        multiple: false,
	        library: { type: 'image' },
	        button: { text: 'Select' }
	    });
	    frame.on('select', function(){
	        var attachment = frame.state().get('selection').first().toJSON();
	        modal.find('.acf-table-image-id').val(attachment.id);
	        modal.find('.acf-table-image-url').val(attachment.url);
	        updateImagePreview(modal);
	    });
	    frame.open();
	});
	// File seÃ§me butonu
	$('body').on('click', '.acf-table-select-file', function(e){
	    e.preventDefault();
	    var modal = $(this).closest('#acf-table-content-modal');
	    var frame = wp.media({
	        title: 'Select File',
	        multiple: false,
	        library: { type: 'application' },
	        button: { text: 'Select' }
	    });
	    frame.on('select', function(){
	        var attachment = frame.state().get('selection').first().toJSON();
	        modal.find('.acf-table-file-id').val(attachment.id);
	        modal.find('.acf-table-file-url').val(attachment.url);
	        updateFilePreview(modal);
	    });
	    frame.open();
	});
	function SaltACFTableField() {
		var t = this;
		t.version = '1.3.30';
		t.param = {};
		// DIFFERENT IN ACF VERSION 4 and 5 {
			t.param.classes = {
				btn_small:		'acf-icon small',
				// "acf-icon-plus" becomes "-plus" since ACF Pro Version 5.3.2
				btn_add_row:	'acf-icon-plus -plus',
				btn_add_col:	'acf-icon-plus -plus',
				btn_remove_row:	'acf-icon-minus -minus',
				btn_remove_col:	'acf-icon-minus -minus',
			};
			t.param.htmlbuttons = {
				add_row:		'<a href="#" class="acf-table-add-row ' + t.param.classes.btn_small + ' ' + t.param.classes.btn_add_row + '"></a>',
				remove_row:		'<a href="#" class="acf-table-remove-row ' + t.param.classes.btn_small + ' ' + t.param.classes.btn_remove_row + '"></a>',
				add_col:		'<a href="#" class="acf-table-add-col ' + t.param.classes.btn_small + ' ' + t.param.classes.btn_add_col + '"></a>',
				remove_col:		'<a href="#" class="acf-table-remove-col ' + t.param.classes.btn_small + ' ' + t.param.classes.btn_remove_row + '"></a>',
			};
		// }
		t.param.htmltable = {
			body_row:	   '<div class="acf-table-body-row">' +
								'<div class="acf-table-body-left">' +
									t.param.htmlbuttons.add_row +
									'<div class="acf-table-body-cont"><!--ph--></div>' +
								'</div>' +
								'<div class="acf-table-body-right">' +
									t.param.htmlbuttons.remove_row +
								'</div>' +
							'</div>',
			top_cell:	   '<div class="acf-table-top-cell" data-colparam="">' +
								t.param.htmlbuttons.add_col +
								'<div class="acf-table-top-cont"><!--ph--></div>' +
							'</div>',
			header_cell:	'<div class="acf-table-header-cell">' +
								'<div class="acf-table-header-cont"><!--ph--></div>' +
							'</div>',
			body_cell:	  '<div class="acf-table-body-cell">' +
								'<div class="acf-table-body-cont"><!--ph--></div>' +
							'</div>',
			bottom_cell:	'<div class="acf-table-bottom-cell">' +
								t.param.htmlbuttons.remove_col +
							'</div>',
			table:		   '<div class="acf-table-wrap">' +
								'<div class="acf-table-table">' + //  acf-table-hide-header acf-table-hide-left acf-table-hide-top
									'<div class="acf-table-top-row">' +
										'<div class="acf-table-top-left">' +
											t.param.htmlbuttons.add_col +
										'</div>' +
										'<div class="acf-table-top-right"></div>' +
									'</div>' +
									'<div class="acf-table-header-row acf-table-header-hide-off">' +
										'<div class="acf-table-header-left">' +
											t.param.htmlbuttons.add_row +
										'</div>' +
										'<div class="acf-table-header-right"></div>' +
									'</div>' +
									'<div class="acf-table-bottom-row">' +
										'<div class="acf-table-bottom-left"></div>' +
										'<div class="acf-table-bottom-right"></div>' +
									'</div>' +
								'</div>' +
							'</div>',
		};
		/*t.param.htmleditor =	'<div class="acf-table-cell-editor">' +
									'<textarea name="acf-table-cell-editor-textarea" class="acf-table-cell-editor-textarea"></textarea>' +
								'</div>';*/
		t.obj = {
			body: $( 'body' ),
		};
		t.var = {
			ajax: false,
		};
		t.tables = {};
		t.state = {
			'current_cell_obj': false,
			'cell_editor_cell': false,
			'cell_editor_last_keycode': false
		};
		t.init = function() {
			// 1. Modal HTML iÃ§ine cell_type dropdown ekle
			if($('#acf-table-content-modal').length === 0){
			var L = (typeof acfTableL10n !== 'undefined') ? acfTableL10n : {};
				    $('body').append(`
				        <div id="acf-table-content-modal" class="acf-table-modal" style="display:none;">
				            <div class="acf-table-modal-overlay"></div>
				            <div class="acf-table-modal-inner">
				                <div class="acf-table-modal-content acf-fields-wrapper">
				                    <div class="acf-field acf-field-cell-type">
				                        <label>${L.cellType || 'Cell Type'}</label>
				                        <select class="acf-table-cell-type">
				                            <option value="text">${L.text || 'Text'}</option>
				                            <option value="image">${L.image || 'Image'}</option>
				                            <option value="file">${L.file || 'File'}</option>
				                            <option value="boolean">${L.boolean || 'Boolean'}</option>
				                            <option value="text_image">${L.textImage || 'Text & Image'}</option>
				                            <option value="text_file">${L.textFile || 'Text & File'}</option>
				                            <option value="text_boolean">${L.textBoolean || 'Text & Boolean'}</option>
				                        </select>
				                    </div>
				                    <div class="acf-table-field acf-field acf-table-mce-field">
				                        <label>${L.text || 'Text'}</label>
				                        <textarea id="acf-table-mce" class="acf-table-mce"></textarea>
				                    </div>
				                    <div class="acf-table-field acf-field acf-table-image-field">
				                        <label>${L.image || 'Image'}</label>
				                        <input type="hidden" class="acf-table-image-id" />
				    					<input type="hidden" class="acf-table-image-url" />
				                        <button type="button" class="acf-table-select-image button">${L.selectImage || 'Select Image'}</button>
				                        <div class="acf-table-image-preview"></div>
				                        <button type="button" class="acf-table-remove-image button" style="display:none;">${L.remove || 'Remove'}</button>
				                    </div>
				                    <div class="acf-table-field acf-field acf-table-file-field">
				                        <label>${L.file || 'File'}</label>
				                        <input type="hidden" class="acf-table-file-id" />
				    					<input type="hidden" class="acf-table-file-url" />
				                        <button type="button" class="acf-table-select-file button">${L.selectFile || 'Select File'}</button>
				                        <div class="acf-table-file-preview"></div>
				                        <button type="button" class="acf-table-remove-file button" style="display:none;">${L.remove || 'Remove'}</button>
				                    </div>
				                    <div class="acf-table-field acf-field acf-table-boolean-field">
				                        <label>${L.boolean || 'Boolean'}</label>
				                        <input type="checkbox" class="acf-table-boolean" />
				                    </div>
				                </div>
				                <div class="acf-table-modal-footer">
				                    <button type="button" class="acf-table-modal-close button">${L.close || 'Close'}</button>
				                    <button type="button" class="acf-table-modal-save button button-primary">${L.save || 'Save'}</button>
				                </div>
				            </div>
				        </div>
				    `);
			}
			var modal = $('#acf-table-content-modal');
			t.init_once();
			t.update_tables();
			// DETECT NEW TABLES AFTER DOM CHANGES {
				var interval = false;
				let mutationObserver = new MutationObserver( function( mutations ) {
					clearInterval( interval );
					interval = setInterval( function() {
						if ( $( '.acf-table-root' ).not( '.acf-table-rendered' ).length > 0 ) {
							t.update_tables();
						}
						clearInterval( interval );
					}, 250 );
				});
				mutationObserver.observe( document.documentElement, {
					childList: true,
					subtree: true,
				});
			// }
				// Delegated event binding ile aÃ§ma
				t.obj.body.on('click', '.acf-table-body-cell, .acf-table-header-cell', function(e){
				    e.stopImmediatePropagation();
				    //t.cell_editor_save && t.cell_editor_save();
				    var that = $(this);
				    t.state.current_cell_obj = that;
				    // HÃ¼cre verilerini modal alanlarÄ±na yÃ¼kle
				    var content = that.find('.acf-table-body-cont, .acf-table-header-cont').html() || '';
				    modal.find('.acf-table-mce').val($(content).find('.acf-table-mce').text() || '');
				    modal.find('.acf-table-boolean').prop('checked', $(content).find('.acf-table-boolean').prop('checked'));
				    modal.find('.acf-table-image-id').val($(content).find('.acf-table-image-id').val() || '');
				    modal.find('.acf-table-image-url').val($(content).find('.acf-table-image-url').val() || '');
				    modal.find('.acf-table-file-id').val($(content).find('.acf-table-file-id').val() || '');
				    modal.find('.acf-table-file-url').val($(content).find('.acf-table-file-url').val() || '');
				    updateImagePreview(modal);
				    updateFilePreview(modal);
				    // TinyMCE baÅŸlat
				    /*if(typeof tinymce !== 'undefined'){
				        tinymce.remove(modal.find('.acf-table-mce'));
				        tinymce.init({
				            target: modal.find('.acf-table-mce')[0],
				            menubar: false,
				            toolbar: 'bold italic | alignleft aligncenter alignright | bullist numlist',
				            setup: function(editor){ editor.setContent(modal.find('.acf-table-mce').val() || ''); }
				        });
				    }*/
				    modal.css('display','flex');
				    updateCellTypeFields(modal);
				    initModalMCE(modal, modal.find('.acf-table-mce').val())
				});
				// Remove buttons
				$('body').on('click', '.acf-table-remove-image', function(){
				    var modal = $(this).closest('#acf-table-content-modal');
				    modal.find('.acf-table-image-id').val('');
				    modal.find('.acf-table-image-url').val('');
				    updateImagePreview(modal);
				    // Cell data'dan sil
				    /*if(t.state.current_cell_obj){
				        var cellData = getCellData(t.state.current_cell_obj);//JSON.parse(t.state.current_cell_obj.attr('data-json') || '{}');
				        cellData.image = null;
				        t.state.current_cell_obj.attr('data-json', JSON.stringify(cellData));
				        t.state.current_cell_obj.find('.acf-table-body-cont, .acf-table-header-cont').find('.acf-table-image-id').val('');
				        t.state.current_cell_obj.find('.acf-table-body-cont, .acf-table-header-cont').find('.acf-table-image-url').val('');
				    }*/
				});
				$('body').on('click', '.acf-table-remove-file', function(){
				    var modal = $(this).closest('#acf-table-content-modal');
				    modal.find('.acf-table-file-id').val('');
				    modal.find('.acf-table-file-url').val('');
				    updateFilePreview(modal);
				    /*if(t.state.current_cell_obj){
				        var cellData = getCellData(t.state.current_cell_obj);//JSON.parse(t.state.current_cell_obj.attr('data-json') || '{}');
				        cellData.file = null;
				        t.state.current_cell_obj.attr('data-json', JSON.stringify(cellData));
				        t.state.current_cell_obj.find('.acf-table-body-cont, .acf-table-header-cont').find('.acf-table-file-id').val('');
				        t.state.current_cell_obj.find('.acf-table-body-cont, .acf-table-header-cont').find('.acf-table-file-url').val('');
				    }*/
				});
		};
		t.update_tables = function() {
			t.each_table();
		};
		// Modal aÃ§ma
		t.cell_editor_modal = function(){
		    t.obj.body.on('click', '.acf-table-body-cell, .acf-table-header-cell', function(e){
		        e.stopImmediatePropagation();
		       // t.cell_editor_save && t.cell_editor_save();
		        var that = $(this);
		        t.state.current_cell_obj = that;
		        var modal = $('#acf-table-content-modal');
		        modal.css('display','flex');
		        // HÃ¼cre datasÄ±nÄ± al
		        //var cellData = that.attr('data-json') ? JSON.parse(that.attr('data-json')) : {};
		        var cellData = getCellData(that);
		         //   cellData = cellData ? JSON.parse(cellData) : {};
		        // Modal alanlarÄ±nÄ± doldur
		   		modal.find('.acf-table-cell-type').val(cellData.type || 'text');
				modal.find('.acf-table-mce').val(cellData.text || '');
				modal.find('.acf-table-boolean').prop('checked', cellData.boolean || false);
				// Image gÃ¼venli
				modal.find('.acf-table-image-id').val(cellData.image?.id || '');
				modal.find('.acf-table-image-url').val(cellData.image?.url || '');
				// File gÃ¼venli
				modal.find('.acf-table-file-id').val(cellData.file?.id || '');
				modal.find('.acf-table-file-url').val(cellData.file?.url || '');
		        updateImagePreview(modal);
		        updateFilePreview(modal);
		        // TinyMCE baÅŸlat
		      /*  if(typeof tinymce !== 'undefined'){
		            tinymce.remove(modal.find('.acf-table-mce'));
		            tinymce.init({
		                target: modal.find('.acf-table-mce')[0],
		                menubar: false,
		                toolbar: 'bold italic | alignleft aligncenter alignright | bullist numlist',
		                setup: function(editor){ editor.setContent(modal.find('.acf-table-mce').val() || ''); }
		            });
		        }*/
		        updateCellTypeFields(modal);
		        initModalMCE(modal, modal.find('.acf-table-mce').val())
		    });
		};
		t.cell_editor_modal_events = function(){
		    var modal = $('#acf-table-content-modal');
		    // Kapat
		    modal.on('click', '.acf-table-modal-close, .acf-table-modal-overlay', function(){
		        resetModalFields();
		        modal.hide();
		        tinymce.remove(modal.find('.acf-table-mce'));
		        t.state.current_cell_obj = null;
		    });
		    // Kaydet butonu
			// Kaydet butonu
			modal.on('click', '.acf-table-modal-save', function() {
			    if (!t.state.current_cell_obj) return;
			    var modalEl = modal;
			    // TinyMCE iÃ§eriÄŸini al
			    var mceContent = tinymce.get(modalEl.find('.acf-table-mce')[0].id)?.getContent() || modalEl.find('.acf-table-mce').val();
			    // HÃ¼cre JSON'u oluÅŸtur
			    var cellData = {
			        type: modalEl.find('.acf-table-cell-type').val() || 'text',
			        text: mceContent || "",
			        image: {
			        	id: modalEl.find('.acf-table-image-id').val() || "",
			        	url: modalEl.find('.acf-table-image-url').val() || ""
			        },
			        file: {
			        	id: modalEl.find('.acf-table-file-id').val() || "",
			        	url: modalEl.find('.acf-table-file-url').val() || ""
			        },
			        boolean: modalEl.find('.acf-table-boolean').prop('checked') || false
			    };
			    // HÃ¼creye JSON olarak ata
			   // t.state.current_cell_obj.attr('data-json', JSON.stringify(cellData));
			    setCellData(t.state.current_cell_obj, cellData);
			    htmlContent = tableCellPreview(cellData);
			    // 4. Preview DOMâ€™a bas
			    t.state.current_cell_obj.find('.acf-table-body-cont, .acf-table-header-cont').html(htmlContent);
			    // JSON ile tabloyu gÃ¼ncelle ve DB'ye kaydet
			    var root = t.state.current_cell_obj.closest('.acf-table-root');
			    var p = {};
			    p.obj_root = root;
			    p.obj_table = root.find('.acf-table-table');
			    // Ä°ÅŸte eski Ã§alÄ±ÅŸan fonksiyon: tÃ¼m table JSON'unu oluÅŸturuyor ve input'a yazÄ±yor
			    t.table_build_json(p);
			    // Modal reset ve TinyMCE temizle
			    resetModalFields();
			    modalEl.find('.acf-table-mce').val('');  
			    if (tinymce.get(modalEl.find('.acf-table-mce')[0].id)) {
			        tinymce.get(modalEl.find('.acf-table-mce')[0].id).setContent('');
			    }
			    modalEl.find('.acf-table-image-id').val('');
			    modalEl.find('.acf-table-file-id').val('');
			    modalEl.find('.acf-table-image-url').val('');
			    modalEl.find('.acf-table-file-url').val('');
			    modalEl.find('.acf-table-boolean').prop('checked', false);
			    modalEl.hide();
			    tinymce.remove(modalEl.find('.acf-table-mce'));
			    t.state.current_cell_obj = null;
			});
		}
		t.table_build_json_from_data = function(root){
		    var tableData = {
		        use_header: root.find('.acf-table-use-header').val() || false,
		        header: [],
		        body: []
		    };
		    // Header
		    root.find('.acf-table-header-row').each(function(){
		        var row = [];
		        $(this).find('.acf-table-header-cell').each(function(){
		            var data = getCellData($(this));//$(this).attr('data-json') ? JSON.parse($(this).attr('data-json')) : {};
		            row.push(data);
		        });
		        tableData.header.push(row);
		    });
		    // Body
		    root.find('.acf-table-body-row').each(function(){
		        var row = [];
		        $(this).find('.acf-table-body-cell').each(function(){
		            var data = getCellData($(this));//$(this).attr('data-json') ? JSON.parse($(this).attr('data-json')) : {};
		            row.push(data);
		        });
		        tableData.body.push(row);
		    });
		    // rootâ€™a attribute olarak kaydet (veya ajax ile backendâ€™e)
		    root.attr('data-json', JSON.stringify(tableData));
		};
		t.init_once = function() {
			t.table_remove_row();
			t.table_remove_col();
			t.table_add_col_event();
			t.table_add_row_event();
			t.sortable_event();
			t.cell_editor_modal(); // modal editor ekledik
			t.cell_editor_modal_events();
		//	t.cell_editor();
		//	t.cell_editor_tab_navigation();
			t.prevent_cell_links();
			//t.ui_event_ajax();
			t.ui_event_use_header();
			t.ui_event_caption();
			t.ui_event_change_location_rule();
		};
		t.ui_event_ajax = function() {
			$( document ).ajaxComplete( function( event ) {
				setTimeout( function() {
					t.each_table();
				}, 1 );
			});
		}
		t.ui_event_change_location_rule = function() {
			t.obj.body.on( 'change', '[name="post_category[]"], [name="post_format"], [name="page_template"], [name="parent_id"], [name="role"], [name^="tax_input"]', function() {
				var interval = setInterval( function() {
					var table_fields = $( '.field_type-table' );
					if ( table_fields.length > 0 ) {
						t.each_table();
						clearInterval( interval );
					}
				}, 100 );
			} );
		};
		t.get_field_key = function( that ) {
			// DETECT BLOCK, GETS BLOCK ID {
				var block_id = '';
				$wp_block = that.closest( '.wp-block' );
				if ( $wp_block.length > 0 ) {
					var block_id = $wp_block.attr( 'id' );
				}
			// }
			var target = that.closest( '[data-key^="field_"]' );
			if ( target.length > 0 ) {
				return block_id + ':' + target.data( 'key' );
			}
			return false;
		};
		t.each_table = function( ) {
			$( '.acf-field-table .acf-table-root' ).not( '.acf-table-rendered' ).each( function() {
				var p = {};
				p.obj_root = $( this );
				var that = $( this ),
					field_key = t.get_field_key( that ),
					table = p.obj_root.find( '.acf-table-wrap' );
				// ADDS TABLE OBJECT {
					t.tables[ field_key ] = p;
				// }
				if ( table.length > 0 ) {
					return;
				}
				p.obj_root.addClass( 'acf-table-rendered' );
				t.data_get( p );
				t.data_default( p );
				t.field_options_get( p );
				t.table_render( p );
				t.misc_render( p );
				if ( typeof p.data.b[ 1 ] === 'undefined' && typeof p.data.b[ 0 ][ 1 ] === 'undefined' && p.data.b[ 0 ][ 0 ].c === '' ) {
					p.obj_root.find( '.acf-table-remove-col' ).hide(),
					p.obj_root.find( '.acf-table-remove-row' ).hide();
				}

				// Boş hücrelere placeholder attribute'u ekle
				var placeholderText = (typeof acfTableL10n !== 'undefined' && acfTableL10n.clickToEdit) ? acfTableL10n.clickToEdit : 'Click to edit';
				p.obj_root.find('.acf-table-body-cont, .acf-table-header-cont').each(function() {
					$(this).attr('data-placeholder', placeholderText);
				});
			} );
		};
		t.field_options_get = function( p ) {
			try {
				p.field_options = JSON.parse( decodeURIComponent( p.obj_root.find( '[data-field-options]' ).data( 'field-options' ) ) );
			}
			catch (e) {
				p.field_options = {
					use_header: 2
				};
			}
		};
		t.ui_event_use_header = function() {
			// HEADER: SELECT FIELD ACTIONS {
				t.obj.body.on( 'change', '.acf-table-fc-opt-use-header', function() {
					var that = $( this ),
						p = {};
					p.obj_root = that.closest( '.acf-table-root' );
					p.obj_table = p.obj_root.find( '.acf-table-table' );
					t.data_get( p );
					t.data_default( p );
					if ( that.val() === '1' ) {
						p.obj_table.removeClass( 'acf-table-hide-header' );
						p.data.p.o.uh = 1;
						t.update_table_data_field( p );
					}
					else {
						p.obj_table.addClass( 'acf-table-hide-header' );
						p.data.p.o.uh = 0;
						t.update_table_data_field( p );
					}
				} );
			// }
		};
		t.ui_event_caption = function() {
			// CAPTION: INPUT FIELD ACTIONS {
				t.obj.body.on( 'change', '.acf-table-fc-opt-caption', function() {
					var that = $( this );
					t.caption_update( that );
				} );
				var interval;
				t.obj.body.on( 'keyup', '.acf-table-fc-opt-caption', function() {
					clearInterval( interval );
					var that = $( this );
					interval = setInterval( function() {
						t.caption_update( that );
						clearInterval( interval );
					}, 300 );
				} );
			// }
		};
		t.caption_update = function( that ) {
			p = {};
			p.obj_root = that.closest( '.acf-table-root' );
			p.obj_table = p.obj_root.find( '.acf-table-table' );
			t.data_get( p );
			t.data_default( p );
			p.data.p.ca = that.val();
			t.update_table_data_field( p );
		};
		t.data_get = function( p ) {
			// DATA FROM FIELD {
				var val = p.obj_root.find( 'input.table' ).val();
				p.data = false;
				// CHECK FIELD CONTEXT {
					if ( p.obj_root.closest( '.acf-fields' ).hasClass( 'acf-block-fields' ) ) {
						p.field_context = 'block';
					}
					else {
						p.field_context = 'box';
					}
				// }
				if ( val !== '' ) {
					try {
						if ( p.field_context === 'box' ) {
							p.data = JSON.parse( decodeURIComponent( val.replace(/\+/g, '%20') ) );
						}
						if ( p.field_context === 'block' ) {
							p.data = JSON.parse( decodeURIComponent( val.replace(/\+/g, '%20') ) );
						}
					}
					catch (e) {
						if ( p.field_context === 'box' ) {
						}
						if ( p.field_context === 'block' ) {
						}
					}
					if ( typeof p.data.p != 'object' ) {
						p.data = false;
					}
				}
				return p.data;
			// }
		};
		t.data_default = function( p ) {
			// DEFINES DEFAULT TABLE DATA {
				p.data_defaults = {
					acftf: {
						v: t.version,
					},
					p: {
						o: {
							uh: 0, // use header
						},
						ca: '', // caption content
					},
					// from data-colparam
					c: [
						{
							c: '',
						},
					],
					// header
					h: [
						{
							c: {},
						},
					],
					// body
					b: [
						[
							{
								c: {},
							},
						],
					],
				};
			// }
			// ADDS MISSING DATA OR DATA SECTIONS FROM DEFAULT {
				if ( p.data ) {
					if ( typeof p.data.c !== 'object' ) {
						p.data.c = p.data_defaults.c;
					}
					if ( typeof p.data.h !== 'object' ) {
						p.data.b = p.data_defaults.h;
					}
					if ( typeof p.data.b !== 'object' ) {
						p.data.b = p.data_defaults.b;
					}
					if ( typeof p.data.p !== 'object' ) {
						p.data.p = p.data_defaults.p;
					}
					if ( typeof p.data.acftf !== 'object' ) {
						p.data.acftf === p.data_defaults.acftf;
					}
				}
				else {
					p.data = p.data_defaults;
				}
			// }
			// MERGES MISSING SECTION PARAMETERS FROM DEFAULTS {
				p.data.acftf = $.extend( true, p.data_defaults.acftf, p.data.acftf );
				p.data.p = $.extend( true, p.data_defaults.p, p.data.p );
			// }
		};
		// preview helper
		t.preview_html = function(content) {
		    if (!content) return '';
		    return '<div class="acf-table-mce">' + content + '</div>';
		};
		t.table_render = function(p) {
		    let build_table_json = false;
		    // TABLE HTML MAIN
		    p.obj_root.find('.acf-table-wrap').remove();
		    p.obj_root.append(t.param.htmltable.table);
		    // TABLE GET OBJECTS
		    p.obj_table = p.obj_root.find('.acf-table-table');
		    p.obj_top_row = p.obj_root.find('.acf-table-top-row');
		    p.obj_top_insert = p.obj_top_row.find('.acf-table-top-right');
		    p.obj_header_row = p.obj_root.find('.acf-table-header-row');
		    p.obj_header_insert = p.obj_header_row.find('.acf-table-header-right');
		    p.obj_bottom_row = p.obj_root.find('.acf-table-bottom-row');
		    p.obj_bottom_insert = p.obj_bottom_row.find('.acf-table-bottom-right');
		    // CHECK FOR EQUAL COLUMNS
		    if (p.data.c && p.data.b && p.data.c.length < p.data.b[0].length) {
		        build_table_json = true;
		        let length = p.data.b[0].length;
		        for (let index = 0; index < length; index++) p.data.c[index] = { o: {} };
		    }
		    let cols = p.data.c.length;
		    // TOP CELLS
		    if (p.data.c) {
		        for (i in p.data.c) p.obj_top_insert.before(t.param.htmltable.top_cell);
		    }
		    t.table_top_labels(p);
		    // HEADER CELLS
		    if (p.data.h) {
		        for (i in p.data.h) {
		            if (cols <= i) { build_table_json = true; break; }
		            let headObj = p.data.h[i] || {};
		            let headContent = tableCellPreview(headObj.c);//(headObj.c || '').replace(/xxx&quot/g, '"');
		            let jsonData = encodeURIComponent(JSON.stringify(headObj.c))
			        p.obj_header_insert.before(
			            t.param.htmltable.header_cell.replace('<!--ph-->', headContent).replace('class="acf-table-header-cell"', 'class="acf-table-header-cell" data-json="'+jsonData+'" ')
			            //t.param.htmltable.body_cell.replace('<!--ph-->', `<div class="acf-table-body-cont sss" data-json='${JSON.stringify(cellObj).replace(/'/g, "&apos;")}'>${cellContent}</div>`)
			        );
		        }
		        // Adds missing cells
		        let existing_cells = i + 1;
		        if (cols > existing_cells) {
		            for (let add_i = 0; add_i < (cols - existing_cells); add_i++)
		                p.obj_header_insert.before(t.param.htmltable.header_cell.replace('<!--ph-->', ''));
		            build_table_json = true;
		        }
		    }
		    // BODY ROWS
		    if (p.data.b) {
		        for (i in p.data.b) {
		            p.obj_bottom_row.before(t.param.htmltable.body_row.replace('<!--ph-->', parseInt(i) + 1));
		        }
		    }
		    // BODY ROWS CELLS (DATA-JSON EKLÄ°)
		    let body_rows = p.obj_root.find('.acf-table-body-row'), row_i = 0;
			if (body_rows) {
			    body_rows.each(function() {
			        let body_row = $(this),
			            row_insert = body_row.find('.acf-table-body-right');
			        for (i in p.data.b[row_i]) {
			            i = parseInt(i);
			            if (cols <= i) { build_table_json = true; break; }
			            let cellObj = p.data.b[row_i][i] || {};
			            let cellContent = tableCellPreview(cellObj);//(cellObj.c || '').replace(/xxx&quot/g, '"');
			            // HÃ¼creyi al
			            let cell = row_insert.children().eq(i);
			            let cellCont = cell.find('.acf-table-body-cont');
			            if(cellCont.length) {
			                // Var olan elemente data-json ekle
			                //cell.attr('data-json', JSON.stringify(cellObj).replace(/'/g, "&apos;"));
			                setCellData(cell, cellData);
			                // HTML iÃ§eriÄŸini gÃ¼ncelle
			                cellCont.html(cellContent);
			            } else {
			                // EÄŸer yoksa (yeni eklenen hÃ¼cre) yarat
			                //let jsonData = JSON.stringify(cellObj);//.replace(/'/g, '&apos;');
			                let jsonData = encodeURIComponent(JSON.stringify(cellObj))
			                row_insert.before(
			                	t.param.htmltable.body_cell.replace('<!--ph-->', cellContent).replace('class="acf-table-body-cell"', 'class="acf-table-body-cell" data-json="'+jsonData+'" ')
			                    //t.param.htmltable.body_cell.replace('<!--ph-->', `<div class="acf-table-body-cont sss" data-json='${JSON.stringify(cellObj).replace(/'/g, "&apos;")}'>${cellContent}</div>`)
			                );
			            }
			        }
			        // Eksik hÃ¼cre ekleme
			        let existing_cells = i + 1;
			        if (cols > existing_cells) {
			            for (let add_i = 0; add_i < (cols - existing_cells); add_i++)
			                row_insert.before(t.param.htmltable.body_cell.replace('<!--ph-->', ''));
			            build_table_json = true;
			        }
			        row_i++;
			    });
			}
		    // TABLE BOTTOM
		    if (p.data.c) {
		        for (i in p.data.c) p.obj_bottom_insert.before(t.param.htmltable.bottom_cell);
		    }
		    // BUILD TABLE JSON
		    if (true === build_table_json) t.table_build_json(p);
		};
		t.misc_render = function( p ) {
			t.init_option_use_header( p );
			t.init_option_caption( p );
		};
		t.init_option_use_header = function( p ) {
			// VARS {
				var v = {};
				v.obj_use_header = p.obj_root.find( '.acf-table-fc-opt-use-header' );
			// }
			// HEADER {
				// HEADER: FIELD OPTIONS, THAT AFFECTS DATA {
					// HEADER IS NOT ALLOWED
					if (
						p.field_options.use_header === 2 &&
						p.data.p.o.uh !== 0
					) {
						p.obj_table.addClass( 'acf-table-hide-header' );
						p.data.p.o.uh = 0;
						t.update_table_data_field( p );
					}
					// HEADER IS REQUIRED
					if (
						p.field_options.use_header === 1 &&
						p.data.p.o.uh !== 1
					) {
						p.data.p.o.uh = 1;
						t.update_table_data_field( p );
					}
				// }
				// HEADER: SET CHECKBOX STATUS {
					if ( p.data.p.o.uh === 1 ) {
						v.obj_use_header.val( '1' );
					}
					if ( p.data.p.o.uh === 0 ) {
						v.obj_use_header.val( '0' );
					}
				// }
				// HEADER: SET HEADER VISIBILITY {
					if ( p.data.p.o.uh === 1 ) {
						p.obj_table.removeClass( 'acf-table-hide-header' );
					}
					if ( p.data.p.o.uh === 0 ) {
						p.obj_table.addClass( 'acf-table-hide-header' );
					}
				// }
			// }
		};
		t.init_option_caption = function( p ) {
			if (
				typeof p.field_options.use_caption !== 'number' ||
				p.field_options.use_caption === 2
			) {
				return;
			}
			// VARS {
				var v = {};
				v.obj_caption = p.obj_root.find( '.acf-table-fc-opt-caption' );
			// }
			// SET CAPTION VALUE {
				v.obj_caption.val( p.data.p.ca );
			// }
		};
		t.table_add_col_event = function() {
			t.obj.body.on( 'click', '.acf-table-add-col', function( e ) {
				e.preventDefault();
				var that = $( this ),
					p = {};
				p.obj_col = that.parent();
				t.table_add_col( p );
			} );
		};
		t.table_add_col = function( p ) {
				// requires
				// p.obj_col
				var that_index = p.obj_col.index();
				p.obj_root = p.obj_col.closest( '.acf-table-root' );
				p.obj_table = p.obj_root.find( '.acf-table-table' );
				$( p.obj_table.find( '.acf-table-top-row' ).children()[ that_index ] ).after( t.param.htmltable.top_cell.replace( '<!--ph-->', '' ) );
				$( p.obj_table.find( '.acf-table-header-row' ).children()[ that_index ] ).after( t.param.htmltable.header_cell.replace( '<!--ph-->', '' ) );
				p.obj_table.find( '.acf-table-body-row' ).each( function() {
					$( $( this ).children()[ that_index ] ).after( t.param.htmltable.body_cell.replace( '<!--ph-->', '' ) );
				} );
				$( p.obj_table.find( '.acf-table-bottom-row' ).children()[ that_index ] ).after( t.param.htmltable.bottom_cell.replace( '<!--ph-->', '' ) );
				t.table_top_labels( p );
				p.obj_table.find( '.acf-table-remove-col' ).show();
				p.obj_table.find( '.acf-table-remove-row' ).show();
				t.table_build_json( p );
		};
		t.table_remove_col = function() {
			t.obj.body.on( 'click', '.acf-table-remove-col', function( e ) {
				e.preventDefault();
				var p = {},
					that = $( this ),
					that_index = that.parent().index(),
					obj_rows = undefined,
					cols_count = false;
				p.obj_root = that.closest( '.acf-table-root' );
				p.obj_table = p.obj_root.find( '.acf-table-table' );
				p.obj_top = p.obj_root.find( '.acf-table-top-row' );
				obj_rows = p.obj_table.find( '.acf-table-body-row' );
				cols_count = p.obj_top.find( '.acf-table-top-cell' ).length;
				$( p.obj_table.find( '.acf-table-top-row' ).children()[ that_index ] ).remove();
				$( p.obj_table.find( '.acf-table-header-row' ).children()[ that_index ] ).remove();
				if ( cols_count == 1 ) {
					obj_rows.remove();
					t.table_add_col( {
						obj_col: p.obj_table.find( '.acf-table-top-left' )
					} );
					t.table_add_row( {
						obj_row: p.obj_table.find( '.acf-table-header-row' )
					} );
					p.obj_table.find( '.acf-table-remove-col' ).hide();
					p.obj_table.find( '.acf-table-remove-row' ).hide();
				}
				else {
					obj_rows.each( function() {
						$( $( this ).children()[ that_index ] ).remove();
					} );
				}
				$( p.obj_table.find( '.acf-table-bottom-row' ).children()[ that_index ] ).remove();
				t.table_top_labels( p );
				t.table_build_json( p );
			} );
		};
		t.table_add_row_event = function() {
			t.obj.body.on( 'click', '.acf-table-add-row', function( e ) {
				e.preventDefault();
				var that = $( this ),
					p = {};
				p.obj_row = that.parent().parent();
				t.table_add_row( p );
			});
		};
		t.table_add_row = function( p ) {
			// requires
			// p.obj_row
			var that_index = 0,
				col_amount = 0,
				body_cells_html = '';
			p.obj_root = p.obj_row.closest( '.acf-table-root' );
			p.obj_table = p.obj_root.find( '.acf-table-table' );
			p.obj_table_rows = p.obj_table.children();
			col_amount = p.obj_table.find( '.acf-table-top-cell' ).length;
			that_index = p.obj_row.index();
			for ( i = 0; i < col_amount; i++ ) {
				body_cells_html = body_cells_html + t.param.htmltable.body_cell.replace( '<!--ph-->', '' );
			}
			$( p.obj_table_rows[ that_index ] )
				.after( t.param.htmltable.body_row )
				.next()
				.find('.acf-table-body-left')
				.after( body_cells_html );
			t.table_left_labels( p );
			p.obj_table.find( '.acf-table-remove-col' ).show();
			p.obj_table.find( '.acf-table-remove-row' ).show();
			t.table_build_json( p );
		};
		t.table_remove_row = function() {
			t.obj.body.on( 'click', '.acf-table-remove-row', function( e ) {
				e.preventDefault();
				var p = {},
					that = $( this ),
					rows_count = false;
				p.obj_root = that.closest( '.acf-table-root' );
				p.obj_table = p.obj_root.find( '.acf-table-table' );
				p.obj_rows = p.obj_root.find( '.acf-table-body-row' );
				rows_count = p.obj_rows.length;
				that.parent().parent().remove();
				if ( rows_count == 1 ) {
					t.table_add_row( {
						obj_row: p.obj_table.find( '.acf-table-header-row' )
					} );
					p.obj_table.find( '.acf-table-remove-row' ).hide();
				}
				t.table_left_labels( p );
				t.table_build_json( p );
			} );
		};
		t.table_top_labels = function( p ) {
			var letter_i_1 = 'A'.charCodeAt( 0 ),
				letter_i_2 = 'A'.charCodeAt( 0 ),
				use_2 = false;
			p.obj_table.find( '.acf-table-top-cont' ).each( function() {
				var string = '';
				if ( !use_2 ) {
					string = String.fromCharCode( letter_i_1 );
					if ( letter_i_1 === 'Z'.charCodeAt( 0 ) ) {
						letter_i_1 = 'A'.charCodeAt( 0 );
						use_2 = true;
					}
					else {
						letter_i_1 = letter_i_1 + 1;
					}
				}
				else {
					string = String.fromCharCode( letter_i_1 ) + String.fromCharCode( letter_i_2 );
					if ( letter_i_2  === 'Z'.charCodeAt( 0 ) ) {
						letter_i_1 = letter_i_1 + 1;
						letter_i_2 = 'A'.charCodeAt( 0 );
					}
					else {
						letter_i_2 = letter_i_2 + 1;
					}
				}
				$( this ).text( string );
			} );
		};
		t.table_left_labels = function( p ) {
			var i = 0;
			p.obj_table.find( '.acf-table-body-left' ).each( function() {
				i = i + 1;
				$( this ).find( '.acf-table-body-cont' ).text( i );
			} );
		};
		t.table_build_json = function(p) {
		    var rerender_table = false;
		    // eski datayÄ± Ã§ek
		    p.data = t.data_get(p);
		    t.data_default(p);
		    p.data.c = [];
		    p.data.h = [];
		    p.data.b = [];
		    // TOP (kolon parametreleri)
		    p.obj_table.find('.acf-table-top-cont').each(function(i) {
		        p.data.c[i] = {};
		        p.data.c[i].p = $(this).parent().data('colparam');
		    });
		    let cols = p.data.c.length;
		    // HEADER
		    /*p.obj_table.find('.acf-table-header-cont').each(function(i) {
		        if (cols <= i) {
		            rerender_table = true;
		            return;
		        }
		        p.data.h[i] = {};
		        p.data.h[i].c = $(this).html();
		    });*/
		    p.obj_table.find('.acf-table-header-cell').each(function(i) {
		        if (cols <= i) {
		            rerender_table = true;
		            return;
		        }
		        p.data.h[i] = {};
		        let cell = $(this);
		        let cellData = {};
		        let json = getCellData(cell);
		            if (json) {
		                try {
		                    cellData = json;
		                } catch(e) {
		                    cellData = { c: $(this).find('.acf-table-header-cont').html() };
		                }
		            } else {
		                // fallback: sadece html
		                cellData = $(this).find('.acf-table-header-cont').html();
		            }
		        p.data.h[i].c = cellData;
		    });
		    // eksik header hÃ¼crelerini doldur
		    if (p.data.h.length < cols) {
		        for (let add_i = p.data.h.length; add_i < cols; add_i++) {
		            p.data.h[add_i] = { c: '' };
		            rerender_table = true;
		        }
		    }
		    // BODY
		    p.obj_table.find('.acf-table-body-row').each(function(i) {
		        p.data.b[i] = [];
		        let row = $(this);
		        row.find('.acf-table-body-cell').each(function(i2) {
		            if (cols <= i2) {
		                rerender_table = true;
		                return;
		            }
		            let cell = $(this);
		            let cellData = {};
		            // Ã–ncelik: data-json
		             //let json = $(this).attr('data-json');
		           let json = getCellData(cell);
		            if (json) {
		                try {
		                    cellData = json;
		                } catch(e) {
		                    cellData = { c: $(this).find('.acf-table-body-cont').html() };
		                }
		            } else {
		                // fallback: sadece html
		                cellData.c = $(this).find('.acf-table-body-cont').html();
		            }
		            p.data.b[i][i2] = cellData;
		        });
		        // eksik body hÃ¼crelerini doldur
		        if (p.data.b[i].length < cols) {
		            for (let add_i = p.data.b[i].length; add_i < cols; add_i++) {
		                p.data.b[i][add_i] = { c: '' };
		                rerender_table = true;
		            }
		        }
		    });
		    // DBâ€™ye yaz
		    t.update_table_data_field(p);
		    // gerekiyorsa tekrar render et
		    if (rerender_table === true) {
		        t.table_render(p);
		    }
		};
		/*t.update_table_data_field = function(p) {
		    if (!p.data) return;
		    // Data versiyon kontrolÃ¼
		    p.data = t.update_table_data_version(p.data);
		    // JSON string
		    let dataStr = JSON.stringify(p.data);
		    dataStr = encodeURIComponent(dataStr);
		    // Input'a yaz
		    let input = p.obj_root.find('input.table');
		    if (input.length) input.val(dataStr);
		    // Field changed tetikleme: sadece post edit context varsa
		    if (typeof t.field_changed === 'function') {
		        let isPostEditor = input.closest('.postbox, .edit-post-visual-editor').length > 0;
		        if (isPostEditor) {
		            //t.field_changed(p);
		        } else {
		            console.warn('ACF field_changed atlanÄ±yor: postType config yok');
		        }
		    }
		};*/
		t.update_table_data_field = function( p ) {
			// UPDATE INPUT WITH NEW DATA {
				p.data = t.update_table_data_version( p.data );
				// makes json string from data object
				//var data = JSON.stringify( p.data );
				// adds backslash to all \" in JSON string because encodeURIComponent() strippes backslashes
				//data.replace( /\\"/g, '\\"' );
				// encodes the JSON string to URI component, the format, the JSON string is saved to the database
				//data = encodeURIComponent( data )
				// JSON string
		        let data = JSON.stringify(p.data);
		            data = encodeURIComponent(data);
				p.obj_root.find( 'input.table' ).val( data );
				t.field_changed( p );
			// }
		};
		t.update_table_data_version = function( data ) {
			data = data || {};
			if ( typeof data.acftf === 'undefined' ) {
				data.acftf = {};
			}
			data.acftf.v = t.version;
			return data;
		}
		/*t.cell_editor_save = function() {
			var cell_editor = t.obj.body.find( '.acf-table-cell-editor' ),
				cell_editor_textarea = cell_editor.find( '.acf-table-cell-editor-textarea' ),
				p = {},
				cell_editor_val = '';
			if ( typeof cell_editor_textarea.val() !== 'undefined' ) {
				p.obj_root = cell_editor.closest( '.acf-table-root' );
				p.obj_table = p.obj_root.find( '.acf-table-table' );
				var cell_editor_val = cell_editor_textarea.val();
				// prevent XSS injection
				cell_editor_val = cell_editor_val.replace( /\<(script)/ig, '&#060;$1' );
				cell_editor_val = cell_editor_val.replace( /\<\/(script)/ig, '&#060;/$1' );
				cell_editor.next().html( cell_editor_val );
				t.table_build_json( p );
				cell_editor.remove();
				t.state.cell_editor_is_open = false;
				p.obj_root.find( '.acf-table-remove-col' ).show(),
				p.obj_root.find( '.acf-table-remove-row' ).show();
			}
		};*/
		t.get_next_table_cell = function( p ) {
			var defaults = {
				'key': false
			};
			p = $.extend( true, defaults, p );
			// next cell of current row
			var next_cell = t.state.current_cell_obj
								.next( '.acf-table-body-cell, .acf-table-header-cell' );
			// else if get next row
			if ( next_cell.length === 0 ) {
				next_cell = t.state.current_cell_obj
					.parent()
					.next( '.acf-table-body-row' )
					.find( '.acf-table-body-cell')
					.first();
			}
			// if next row, get first cell of that row
			if ( next_cell.length !== 0 ) {
				t.state.current_cell_obj = next_cell;
			}
			else {
				t.state.current_cell_obj = false;
			}
		};
		t.get_prev_table_cell = function( p ) {
			var defaults = {
				'key': false
			};
			p = $.extend( true, defaults, p );
			// prev cell of current row
			var table_obj = t.state.current_cell_obj.closest( '.acf-table-table' ),
				no_header = table_obj.hasClass( 'acf-table-hide-header' );
				prev_cell = t.state.current_cell_obj
								.prev( '.acf-table-body-cell, .acf-table-header-cell' );
			// else if get prev row
			if ( prev_cell.length === 0 ) {
				var row_selectors = [ '.acf-table-body-row' ];
				// prevents going to header cell if table header is hidden
				if ( no_header === false ) {
					row_selectors.push( '.acf-table-header-row' );
				}
				prev_cell = t.state.current_cell_obj
					.parent()
					.prev( row_selectors.join( ',' ) )
					.find( '.acf-table-body-cell, .acf-table-header-cell' )
					.last();
			}
			// if next row, get first cell of that row
			if ( prev_cell.length !== 0 ) {
				t.state.current_cell_obj = prev_cell;
			}
			else {
				t.state.current_cell_obj = false;
			}
		};
		/*t.cell_editor_tab_navigation = function() {
			t.obj.body.on( 'keydown', '.acf-table-cell-editor', function( e ) {
				var keyCode = e.keyCode || e.which;
				if ( keyCode == 9 ) {
					e.preventDefault();
					t.cell_editor_save();
					if ( t.state.cell_editor_last_keycode === 16 ) {
						t.get_prev_table_cell();
					}
					else {
						t.get_next_table_cell();
					}
					t.cell_editor_add_editor({
						'that': t.state.current_cell_obj
					});
				}
				t.state.cell_editor_last_keycode = keyCode;
			});
		};*/
		t.prevent_cell_links = function() {
			t.obj.body.on( 'click', '.acf-table-body-cont a, .acf-table-header-cont a', function( e ) {
				e.preventDefault();
			} );
		};
		t.sortable_fix_width = function(e, ui) {
			ui.children().each( function() {
				var that = $( this );
				that.width( that.width() );
			} );
			return ui;
		};
		t.sortable_row = function( that ) {
			var param = {
				axis: 'y',
				items: '> .acf-table-body-row',
				containment: 'parent',
				handle: '.acf-table-body-left',
				helper: t.sortable_fix_width,
				update: function( event, ui ) {
					var p = {};
					p.obj_root = ui.item.closest( '.acf-table-root' );
					p.obj_table = p.obj_root.find( '.acf-table-table' );
					t.table_left_labels( p );
					t.table_build_json( p );
				},
			};
			that.sortable( param );
		};
		t.sortable_col = function( that ) {
			var p = {};
			p.start_index = 0;
			p.end_index = 0;
			var param = {
				axis: 'x',
				items: '> .acf-table-top-cell',
				containment: 'parent',
				helper: t.sortable_fix_width,
				start: function(event, ui) {
					p.start_index = ui.item.index();
				},
				update: function( event, ui ) {
					p.end_index = ui.item.index();
					p.obj_root = ui.item.closest( '.acf-table-root' );
					p.obj_table = p.obj_root.find( '.acf-table-table' );
					t.table_top_labels( p );
					t.sort_cols( p );
					t.table_build_json( p );
				},
			};
			that.find( '.acf-table-top-row' ).sortable( param );
		};
		t.sortable_event = function() {
			t.obj.body.on( 'mouseenter', '.acf-table-table:not(.sortable-initialized)', function() {
				var that = $( this );
				t.sortable_row( that );
				t.sortable_col( that );
				that.addClass( 'sortable-initialized' );
			} );
		};
		t.field_changed = function( p ) {
			setTimeout( function() {
				p.obj_root.trigger( 'change' );
			}, 0 );
		};
		t.sort_cols = function( p ) {
			p.obj_table.find('.acf-table-header-row').each( function() {
				p.header_row = $(this),
				p.header_row_children = p.header_row.children();
				if ( p.end_index < p.start_index ) {
					$( p.header_row_children[ p.end_index ] ).before( $( p.header_row_children[ p.start_index ] ) );
				}
				if ( p.end_index > p.start_index ) {
					$( p.header_row_children[ p.end_index ] ).after( $( p.header_row_children[ p.start_index ] ) );
				}
			} );
			p.obj_table.find('.acf-table-body-row').each( function() {
				p.body_row = $(this),
				p.body_row_children = p.body_row.children();
				if ( p.end_index < p.start_index ) {
					$( p.body_row_children[ p.end_index ] ).before( $( p.body_row_children[ p.start_index ] ) );
				}
				if ( p.end_index > p.start_index ) {
					$( p.body_row_children[ p.end_index ] ).after( $( p.body_row_children[ p.start_index ] ) );
				}
			} );
		};
		t.helper = {
			getLength: function( o ) {
				var len = o.length ? --o.length : -1;
				for (var k in o) {
					len++;
				}
				return len;
			},
		};
	};
	var acf_table_field = new SaltACFTableField();
	acf_table_field.init();
})( jQuery );
