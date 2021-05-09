gun_checkbox_index = 0;
function next_checkbox_id(){
	gun_checkbox_index++;
	return ('checkbox_' + gun_checkbox_index);
}

collapse_index = 0;
function next_collapse_id(){
	collapse_index++;
	return ('collapse_' + collapse_index);
}

function create_gun_div(gun){
    var div= $('<div class="gun p-2 mb-2" style="border: 1px solid rgba(0, 0, 0, 0.125)"></div>');

	var remove_button = $('<button type="button" class="close"><span>&times;</span></button>');
	remove_button.click(function(){
		div.remove();
		update_page();
	});
	div.append(remove_button);
	
	
	var checked = '';
	var checkbox_id = '';
	var option_div = null;
	var tooltip = '';
	var gun_info = $('<div class="row"></div>');
	var info_column = $('<div class="col gun_options"></div>');
    var title_div = $('<div class="gun_title"></div>');

    title_div.append($('<strong>'+gun.name+'</strong>'));
	title_div.append($('<span class="badge badge-dark mx-1">'+gun.type+'</span>'));

	function add_gun_for_vs_a(){
        var gun_for_vs_a = $('<span class="badge badge-primary mx-1 gun_for_vs_a">Gun A</span>');
//        gun_for_vs_a.data('option_name','is_gun_for_vs_a');
	    title_div.append(gun_for_vs_a);
	}
	function add_gun_for_vs_b(){
        var gun_for_vs_b = $('<span class="badge badge-secondary mx-1 gun_for_vs_b">Gun B</span>');
//        gun_for_vs_b.data('option_name','is_gun_for_vs_b');
	    title_div.append(gun_for_vs_b);
	}
	if (get_gun_option(gun, 'is_gun_for_vs_a')){
	    add_gun_for_vs_a();
	}
	if (get_gun_option(gun, 'is_gun_for_vs_b')){
	    add_gun_for_vs_b();
	}

	info_column.append(title_div);
	info_column.append($('<div>Display name: <input class="gun_display_name" size="8" value="'+gun.display_name+'"></div>'));
    info_column.append($('<div>Original RPM: '+gun.rpm+'</div>'));
	
	tooltip = 'Included in TTK. Can be neutralized by ttk adjustment in options.';
	var obd_div = $('<div>Open bolt delay<strong data-toggle="tooltip" data-placement="top" title="'+tooltip+'">&#9432;</strong>: '+get_gun_option(gun, 'open_bolt_delay_ms')+'ms</div>');
	obd_div.find('[data-toggle="tooltip"]').tooltip();
    info_column.append(obd_div);
	
	if (gun.sprint_to_fire_time_ms) {
		info_column.append($('<div>Sprint to fire time: '+gun.sprint_to_fire_time_ms+'ms</div>'));
	}

    var damage_profile_div = $('<div class="gun_damage_profile"></div>');
	damage_profile_div.append(make_damage_div(gun.default_damage_profile));
	info_column.append(damage_profile_div);

	var set_gun_for_vs_a_button = $('<button class="btn btn-outline-secondary btn-sm my-1 mr-1">Set as Gun A</button>');
	set_gun_for_vs_a_button.click(function(){
	    $('.gun_for_vs_a').remove();
	    add_gun_for_vs_a();
		update_page();
	});
	info_column.append(set_gun_for_vs_a_button);

	var set_gun_for_vs_b_button = $('<button class="btn btn-outline-secondary btn-sm my-1 mx-1">Set as Gun B</button>');
	set_gun_for_vs_b_button.click(function(){
	    $('.gun_for_vs_b').remove();
	    add_gun_for_vs_b();
		update_page();
	});
	info_column.append(set_gun_for_vs_b_button);

	var advanced_options_id = next_collapse_id();
	var collapse_button_div = $('<div><button class="btn btn-outline-secondary btn-sm my-1" data-toggle="collapse" data-target="#'+advanced_options_id+'">Advanced Options</button><div>');
	info_column.append(collapse_button_div);
	gun_info.append(info_column);
	
    var attachments = $('<div class="col gun_attachments"><strong>Attachments</strong></div>');
    for (var i=0;i< gun.attachments.length;i++){
        var att = gun.attachments[i];
        checked = gun.selected_attachments.includes(att.att_name) ? 'checked="checked"' : '';
		checkbox_id = next_checkbox_id();
		tooltip = attachment_tooltip(att, gun);
		var attachment_obj = $(
			'<div class="gun_attachment">'+
				'<input class="mx-1" type="checkbox" id="' + checkbox_id + '" '+checked + '>' +
				'<label for="'+checkbox_id+'">' + 
					'<div data-toggle="tooltip" data-placement="right" data-html="true" title="' + tooltip + '">' + att.att_name + '</div>' +
				'</label>' +
			'</div>'
		);
		
		attachment_obj.find('[data-toggle="tooltip"]').tooltip();
		attachment_obj.find('input').data('att_name', att.att_name);
		attachment_obj.find('input').data('att_slot', att.slot);
		attachment_obj.find('input').change(function (){
			var att_name = $(this).data('att_name');
			var att_slot = $(this).data('att_slot');
			$(this).closest('.gun_attachments').find('input').each(function(){
				if ($(this).data('att_name') != att_name && $(this).data('att_slot') == att_slot && $(this).prop('checked')){
					$(this).prop('checked', false);
				}
			});
		});
        attachments.append(attachment_obj);
    }
	gun_info.append(attachments);
	div.append(gun_info);
	
	var collapse_class = has_advanced_options(gun) ? 'collapse.show' : 'collapse';
	var advanced_options_div = $('<div class="'+collapse_class+' gun_advanced_options" id="'+advanced_options_id+'"><hr></div>');
	
	// Headshot accuracy
	option_div = make_option_div(gun, 'headshot_percent_enabled', 'Headshot accuracy', null, 
		'<input type="number" class="gun_number_input" value="'+get_gun_option(gun, 'headshot_percent')+'" min="0" max="100" size="3">%'
	)
	option_div.find('.gun_number_input').data('option_name','headshot_percent');
	advanced_options_div.append(option_div);
	
	
	// Head/chest/stomach/ext accuracy: 
	option_div = make_option_div(gun, 'custom_parts_percents_enabled', 'Head/chest/stomach/ext accuracy', null,
		'<br>' +
		get_gun_option(gun, 'custom_parts_percents').map(x => '<input type="number" class="'+gun_option_unique_class('custom_parts_percents')+' mb-2" value="'+x+'" min="0" max="100" size="3">').join('/')+
		'%'
	)
	option_div.find("input").last().prop("disabled", true);
	advanced_options_div.append(option_div);
	
	advanced_options_div.find('.'+gun_option_unique_class('headshot_percent_enabled')).change(function(){
		$(this).closest('.gun_advanced_options').find('.'+gun_option_unique_class('custom_parts_percents_enabled')).prop('checked',false);
	});
	advanced_options_div.find('.'+gun_option_unique_class('custom_parts_percents_enabled')).change(function(){
		$(this).closest('.gun_advanced_options').find('.'+gun_option_unique_class('headshot_percent_enabled')).prop('checked',false);
	});
	
	// Hit accuracy
	option_div = make_option_div(gun, 'hit_percent_enabled', 'Hit accuracy', null, 
		'<input type="number" class="gun_number_input" value="'+get_gun_option(gun, 'hit_percent')+'" min="0" max="100" size="3">%'
	)
	option_div.find('.gun_number_input').data('option_name','hit_percent');
	advanced_options_div.append(option_div);
	
	// Range mod
	tooltip = 'A custom percentage that overwrites range mods on attachments.';
	option_div = make_option_div(gun, 'range_percent_enabled', 'Range mod', tooltip, 
		'<input type="number" class="gun_number_input" value="'+get_gun_option(gun, 'range_percent')+'" min="0" max="1000" size="3">%'
	)
	option_div.find('.gun_number_input').data('option_name','range_percent');
	advanced_options_div.append(option_div);
	
	// TTK adjustment
	tooltip = 'Time to add on TTK calculated for this gun. Can be used for ADS time, sprint to shot time, etc. Can be negative if needed.';	
	option_div = make_option_div(gun, 'ttk_adjustment_ms_enabled', 'TTK adjustment', tooltip, 
		'<input type="number" class="gun_number_input" value="'+get_gun_option(gun, 'ttk_adjustment_ms')+'" min="-9999" max="9999" size="3">ms'
	)
	option_div.find('.gun_number_input').data('option_name','ttk_adjustment_ms');
	advanced_options_div.append(option_div);
	
	div.append(advanced_options_div);
	
	div.find('input').change(function(){
		update_page();
	});
	div.data('gun_data', JSON.stringify(gun));
    return div
}

function make_damage_div(damage_profile){
    return $(
		'<div style="tab-size:2">' +
			'<strong>Default damage head/chest/stomach/ext:</strong><br>' +
			damage_profile.map(x => x[0]+'m:&nbsp;&nbsp;'+x[1].join('/')).join('<br>') +
		'</div>'
	);
}

function gun_option_unique_class(option_name){
	return 'gun_option_' + option_name;
}

function make_option_div(gun, checkbox_option_name, description_html, tooltip, input_html){
	var tooltip_html = tooltip ? '<strong data-toggle="tooltip" data-placement="top" title="'+tooltip+'">&#9432;</strong>' : '';
	var checked = (get_gun_option(gun, checkbox_option_name) ? 'checked="checked"' : '');
	var checkbox_id = next_checkbox_id();
    var option_div = $(
		'<div>' +
			'<input class="mx-1 gun_checkbox_input '+gun_option_unique_class(checkbox_option_name)+'" type="checkbox" id="' + checkbox_id + '" '+ checked + '>' +
			'<label for="'+checkbox_id+'">'+
				description_html + tooltip_html + ': ' +
			'</label>' + input_html +
		'</div>'
	);
	if (tooltip){
		option_div.find('[data-toggle="tooltip"]').tooltip();
	}
	option_div.find('.gun_checkbox_input').data('option_name', checkbox_option_name);
	return option_div;
}

function attachment_tooltip(att, gun){
	var tooltips=[];
	if (att.alt_damage_profile){
		tooltips.push("Damage profile");
	}
	var sign = '';
	var percent = '';
	if (att.modifiers.rpm_mod != 1){
		sign = att.modifiers.rpm_mod > 1 ? '+' : '';
		percent = Math.round(100 * (att.modifiers.rpm_mod - 1));
		tooltips.push(sign + percent + "% RPM");
	}
	if (att.modifiers.range_mod != 1){
		sign = att.modifiers.range_mod > 1 ? '+' : '';
		percent = Math.round(100 * (att.modifiers.range_mod - 1));
		tooltips.push(sign + percent + "% Range");
	}
	return tooltips.join('<br>');
}

function get_gun_obj(gun_div){
    var gun_data=$(gun_div).data('gun_data');
    var gun=JSON.parse(gun_data);
	
	$(gun_div).find('.gun_checkbox_input').each(function(){
		gun[$(this).data('option_name')] = $(this).prop('checked');
	});
	
	$(gun_div).find('.gun_number_input').each(function(){
		gun[$(this).data('option_name')] = Number($(this).val());
	});

    gun.is_gun_for_vs_a = ($(gun_div).find('.gun_for_vs_a').length > 0);
    gun.is_gun_for_vs_b = ($(gun_div).find('.gun_for_vs_b').length > 0);

	var option_value = [];
	var sum_option_value = 0;
    $(gun_div).find('.'+gun_option_unique_class('custom_parts_percents')+':not(:last)').each(function(){
        var value = Number($(this).val());
        sum_option_value += value;
		option_value.push(value);
    });
    $(gun_div).find('.'+gun_option_unique_class('custom_parts_percents')).last().each(function(){
        var value = 100 - sum_option_value;
        if (value < 0){
            $('#warning').text('WARNING: some custom parts hit ratios < 0');
        }
		option_value.push(value);
        $(this).val(value);
    });
	set_gun_option(gun, 'custom_parts_percents', option_value);

    gun.display_name=$(gun_div).find('.gun_display_name').val();
	
    gun.selected_attachments = [];
    $(gun_div).find('.gun_attachment').each(function(){
        var checkbox = $(this).find('input');
        if (checkbox.prop('checked')){
            gun.selected_attachments.push(checkbox.data('att_name'));
        }
    });
    return gun;
}