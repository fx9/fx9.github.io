Highcharts.setOptions({
    lang: {
        thousandsSep: ""
    }
});

// gun selection and list operations
function create_gun_selection(){
    var select_gun = $('#select_gun');
    for (var i = 0; i < DEFAULT_GUNS.length; i++) {
        var el = document.createElement('option');
        el.text = DEFAULT_GUNS[i].name;
        el.value = JSON.stringify(DEFAULT_GUNS[i]);
        select_gun.append(el);
    }
}
function get_selected_gun(){
    var selected=$('#select_gun option:selected');
    if(selected.length == 0){
        return null;
    }
    var gun_json=selected.eq(0).val();
    return JSON.parse(gun_json);
}

$('#use_all_data').click(function(){
    var gun = get_selected_gun();
    if (!gun){
        return;
    }
    set_stats(gun, "Custom ");
    set_damage(gun.default_damage_profile);
    set_att(gun);
    update_page();
});

$('#use_stats').click(function(){
    var gun = get_selected_gun();
    if (!gun){
        return;
    }
    set_stats(gun, "Custom ");
    update_page();
});


$('#use_damage').click(function(){
    var gun = get_selected_gun();
    if (!gun){
        return;
    }
    set_damage(gun);
    update_page();
});

$('#use_att').click(function(){
    var gun = get_selected_gun();
    if (!gun){
        return;
    }
    set_att(gun);
    update_page();
});


function set_stats(gun, name_prefix=""){
    $('#gun_name').val(name_prefix + gun.name);
    $('#gun_type').val(gun.type);
    $('#gun_rpm').val(gun.rpm);
    $('#gun_open_bolt_delay').val(gun.open_bolt_delay_ms);

}

function self_remove_div(){
    var div= $('<div class="p-2 mb-2" style="border: 1px solid rgba(0, 0, 0, 0.125)"></div>');
	var remove_button = $('<button type="button" class="close"><span>&times;</span></button>');
	remove_button.click(function(){
		div.remove();
		update_page();
	});
	div.append(remove_button);
	return div;
}

function set_att(gun){
    $('#attachments').empty();

    var div = self_remove_div();

    var title = $('<strong id="attachments_type">Attachments of '+gun.name+'</strong>');
    title.data('attachments_type', gun.name);
    div.append(title);

    for (var i = 0; i<gun.attachments.length; i++){
         div.append($('<div>'+gun.attachments[i].att_name +'</div>'));
    }

    $('#attachments').append(div);
}

DEFAULT_DAMAGE_RANGE=[0,[1,1,1,1]]
function add_damage_range(damage_range=null){
    if (!damage_range){
        damage_range = DEFAULT_DAMAGE_RANGE
    }
    var div = self_remove_div();
    div.addClass("damage_range");

	div.append($('<div><strong>Start distance</strong> <input type="number" class="distance mb-2" value="'+damage_range[0]+'" min="0" size="3">m</div>'))
    div.append($('<div><strong>Damage Head/Chest/Stomach/Ext</strong></div>'))
    div.append($('<div>'+damage_range[1].map(x => '<input type="number" class="damage mb-2" value="'+x+'" min="1" size="3">').join('<br>')+'</div>'))

	div.find('input').change(function(){
		update_page()
	});

    $('#damage_profile').append(div);
}


function set_damage(damage_profile){
    $('#damage_profile').empty();

    for (var i = 0; i < damage_profile.length; i++){
        add_damage_range(damage_profile[i]);
    }
}


$('#add_damage_range').click(function(){
    add_damage_range();
    update_page();
});

function get_damage_profile(){
    var damage_profile = [];
    $('.damage_range').each(function(){
        var range = $(this).find('.distance').val();
        var damage_range=[range,[]];
        $(this).find('.damage').each(function(){
            damage_range[1].push(Number($(this).val()));
        });
        damage_profile.push(damage_range);
    });

    damage_profile.sort(function(a, b){
      return a[0] - b[0];
    });

    return damage_profile;
}


$('#sort_damage_range').click(function(){
    var damage_profile = get_damage_profile();
    set_damage(damage_profile);
    update_page();
});

function compose_gun_obj(){
    return {
            name: $('#gun_name').val(),
            display_name: $('#gun_name').val(),
            attachments_type: $('#attachments_type').data('attachments_type'),
            type: $('#gun_type').val(),
            rpm: $('#gun_rpm').val(),
            open_bolt_delay_ms: $('#gun_open_bolt_delay').val(),
            default_damage_profile: get_damage_profile(),
            is_custom: true,
            selected_attachments: [],
            advanced_options: [],
    };
}

function lz_string(obj){
    return LZString.compressToEncodedURIComponent(JSON.stringify(obj));
}

function update_page(){
    var custom_gun_str = lz_string(compose_gun_obj());
    var save_data_str = lz_string(SAVE_DATA);
    var newurl = window.location.origin + window.location.pathname + '?custom_gun=' + custom_gun_str + '&save_data=' + save_data_str;
    window.history.replaceState({ path: newurl }, '', newurl);
    setTimeout(update_chart, 0);
}

function update_chart(){
    var custom_gun = compose_gun_obj();

    var error = damage_profile_check(custom_gun.default_damage_profile);
    if (!(error === null)){
        $('#warning').text('WARNING: ' + error + '. Chart is not updated.');
        return;
    } else {
        $('#warning').empty();
    }

    var guns = [custom_gun];
    var options = SAVE_DATA.options;
    update_ttk_for_various_distance(guns, options);
}

function damage_profile_check(damage_profile){
    if (!damage_profile || damage_profile.length == 0){
        return 'Damage profile is empty';
    }
    for (var i = 0; i < damage_profile.length; i++){
        var damage = damage_profile[i][1];
        for (var j = 0; j < damage.length; j++){
            if (damage[j] <= 0){
                return 'Some numbers <= 0 in damage profile';
            }
        }
    }
    return null;
}

function load_custom_gun(){
	var custom_gun_base64 = getUrlParameter('custom_gun');
	if (custom_gun_base64){
		var custom_gun_str = LZString.decompressFromEncodedURIComponent(custom_gun_base64);
		var custom_gun = JSON.parse(custom_gun_str);
        set_stats(custom_gun);
        set_damage(custom_gun.default_damage_profile);
        var att_gun = DEFAULT_GUNS[DEFAULT_GUNS_INDEX[custom_gun.attachments_type]];
        if (att_gun){
            set_att(att_gun);
        }
	}
}


$('#save_changes').click(function(){
    var custom_gun = compose_gun_obj();

    var error = damage_profile_check(custom_gun.default_damage_profile);
    if (!(error === null)){
        alert("INVALID GUN: " + error + ". Won't return to ttk page.");
        return;
    }

    var new_save_data = JSON.parse(JSON.stringify(SAVE_DATA));
    new_save_data.guns.push(custom_gun);
    var save_data_str = lz_string(new_save_data);
    var newurl ='ttk.html?save_data=' + save_data_str;
    window.location.href = newurl;
});

function init(){
    // initialize page elements
    create_gun_selection();
    $('#select_gun').change();
    load_saved_data();
    load_custom_gun();

    $('#discard_changes').attr('href', 'ttk.html?save_data=' + LZString.compressToEncodedURIComponent(JSON.stringify(SAVE_DATA)))

	$('#stats').find('input').change(function(){
		update_page();
	});

    update_page();
}
init();
