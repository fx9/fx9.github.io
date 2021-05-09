// for backward compatibility, always append at the end of the list
GUN_OPTIONS = {
   "headshot_percent_enabled":{
      "index":0,
      "default_value":false
   },
   "headshot_percent":{
      "index":1,
      "default_value":20
   },
   "hit_percent_enabled":{
      "index":2,
      "default_value":false
   },
   "hit_percent":{
      "index":3,
      "default_value":100
   },
   "custom_parts_percents_enabled":{
      "index":4,
      "default_value":false
   },
   "custom_parts_percents":{
      "index":5,
      "default_value":[10, 25, 15, 50]
   },
   "range_percent_enabled":{
      "index":6,
      "default_value":false
   },
   "range_percent":{
      "index":7,
      "default_value":100
   },
   "ttk_adjustment_ms_enabled":{
      "index":8,
      "default_value":false
   },
   "ttk_adjustment_ms":{
      "index":9,
      "default_value":0
   },
   "is_gun_for_vs_a":{
      "index":10,
      "default_value":false,
      "not_advanced_option":true
   },
   "is_gun_for_vs_b":{
      "index":11,
      "default_value":false,
      "not_advanced_option":true
   }
}

function get_gun_option(gun, option_name){
	if (option_name in gun){
		return gun[option_name];
	}
	var i = GUN_OPTIONS[option_name].index;
	var d = GUN_OPTIONS[option_name].default_value;
	// "== null " checks both null and undefined
	return gun.advanced_options[i] == null ? d : gun.advanced_options[i];
}

function set_gun_option(gun, option_name, option_value){
	if (option_name in gun){
		gun[option_name] = option_value;
	} else {
		if (!gun.advanced_options) {
			gun.advanced_options = [];
		}
		var i = GUN_OPTIONS[option_name].index;
		while (gun.advanced_options.length <= i){
			gun.advanced_options.push(null);
		}
		gun.advanced_options[i] = option_value;
	}
}


function has_advanced_options(gun){
	for (var option_name in GUN_OPTIONS){
	    if(GUN_OPTIONS[option_name].not_advanced_option){
	        continue;
	    }
		if (JSON.stringify(get_gun_option(gun, option_name)) != JSON.stringify(GUN_OPTIONS[option_name].default_value)){
			return true;
		}
	}
	return false;
}

GUN_STAT_NAMES = [
	'rpm',
	'open_bolt_delay_ms',
//	'sprint_to_fire_time_ms',
//	'bullet_velocity',
	'default_damage_profile',
];

function persistent_gun(gun){
	var gun_copy = JSON.parse(JSON.stringify(gun));
	if (!gun_copy.is_custom){
		for (var i=0; i<GUN_STAT_NAMES.length; i++){
			delete gun_copy[GUN_STAT_NAMES[i]];
		}
	}
	delete gun_copy.attachments;
	return gun_copy;
}

function recover_gun(gun){
	if (!gun.is_custom && gun.name in DEFAULT_GUNS_INDEX){
		var default_gun = DEFAULT_GUNS[DEFAULT_GUNS_INDEX[gun.name]];
		for (var i=0; i<GUN_STAT_NAMES.length; i++){
			gun[GUN_STAT_NAMES[i]] = default_gun[GUN_STAT_NAMES[i]];
		}
	}

	var att_gun = DEFAULT_GUNS[DEFAULT_GUNS_INDEX[gun.attachments_type]];
	if (att_gun){
	    gun.attachments = att_gun.attachments;
    } else {
        gun.attachments = [];
    }

	return gun;
}

function getUrlParameter(sParam) {
	var sPageURL = window.location.search.substring(1),
		sURLVariables = sPageURL.split('&'),
		sParameterName,
		i;

	for (i = 0; i < sURLVariables.length; i++) {
		sParameterName = sURLVariables[i].split('=');
		if (sParameterName[0] === sParam) {
			return typeof sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
		}
	}
	return false;
};

DEFAULT_OPTIONS = {
	total_hp: 250,
	default_headshot_percent: 20,
	default_hit_percent: 100,
	min_headshot_percent: 10,
	max_headshot_percent: 45,
	min_distance: 0,
	max_distance: 50
}

SAVE_DATA = {
	version: '0.1',
	guns: [JSON.parse(JSON.stringify(DEFAULT_GUNS[Math.floor(Math.random() * DEFAULT_GUNS.length)]))],
	options: DEFAULT_OPTIONS
}

function load_saved_data(){
	var save_data_base64 = getUrlParameter('save_data');
	if (save_data_base64){
		var save_data_str = LZString.decompressFromEncodedURIComponent(save_data_base64);
		SAVE_DATA = JSON.parse(save_data_str);
	}
}