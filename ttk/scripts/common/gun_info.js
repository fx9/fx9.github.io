function get_range_multiplier(gun, atts){
	if (get_gun_option(gun, 'range_percent_enabled')){
		return get_gun_option(gun, 'range_percent') / 100.0;
	}
    var range_multiplier = 1;
    for (var i=0;i < atts.length;i++){
        range_multiplier *= atts[i].modifiers.range_mod;
    }
    return range_multiplier;
}

function get_rpm(gun, atts){
    var rpm_multiplier = 1;
    for (var i=0;i < atts.length;i++){
        rpm_multiplier *= atts[i].modifiers.rpm_mod;
    }
    return gun.rpm * rpm_multiplier;
}

function get_selected_atts(gun){
    var atts = [];
    for (var i=0;i < gun.selected_attachments.length;i++){
        for (var j=0;j < gun.attachments.length;j++){
            if(gun.selected_attachments[i] == gun.attachments[j].att_name){
                atts.push(gun.attachments[j]);
            }
        }
    }
    return atts;
}

function get_damage_profile(gun, atts){
    var damage_profile = null;
    for (var i=0;i < atts.length;i++){
        if (atts[i].alt_damage_profile){
			damage_profile = atts[i].alt_damage_profile;
			break;
        }
    }
    if (!damage_profile){
        damage_profile =  gun.default_damage_profile;
    }
    var range_multiplier = get_range_multiplier(gun, atts);
    var damage_profile_with_range = [];
    for (var i = 0; i < damage_profile.length; i++){
        damage_profile_with_range.push([damage_profile[i][0] * range_multiplier, damage_profile[i][1]])
    }
    return damage_profile_with_range;
}

function get_info_name(gun, ignore_custom_parts_percents = false){
	var info_name = gun.display_name ? gun.display_name : gun.name;
	var advanced_options=[]

	if (!ignore_custom_parts_percents){
		if (get_gun_option(gun, 'custom_parts_percents_enabled')){
			advanced_options.push(get_gun_option(gun, 'custom_parts_percents').map(x => (Math.round(x) + '%')).join('/'));
		} else if (get_gun_option(gun, 'headshot_percent_enabled')) {
			advanced_options.push(Math.round(get_gun_option(gun, 'headshot_percent')) + '% head');
		}
	}

	if (get_gun_option(gun, 'range_percent_enabled')){
		advanced_options.push(Math.round(get_gun_option(gun, 'range_percent')) + '% range');
	}

	if (get_gun_option(gun, 'hit_percent_enabled')){
		advanced_options.push(Math.round(get_gun_option(gun, 'hit_percent')) + '% hit');
	}

	if (get_gun_option(gun, 'ttk_adjustment_ms_enabled')){
		var sign = get_gun_option(gun, 'ttk_adjustment_ms') >= 0 ? '+' : '';
		advanced_options.push(sign + get_gun_option(gun, 'ttk_adjustment_ms') + 'ms')
	}

	if (advanced_options.length > 0){
		info_name += ' ('+advanced_options.join('; ')+')';
	}
	return info_name
}

function get_parts_ratios(gun, default_headshot_ratio){
	if (get_gun_option(gun, 'custom_parts_percents_enabled')){
		return get_gun_option(gun, 'custom_parts_percents').map(x => x /100.0);
	} else if (get_gun_option(gun, 'headshot_percent_enabled')) {
		return headshot_to_parts(get_gun_option(gun, 'headshot_percent') / 100.0);
	} else {
		return headshot_to_parts(default_headshot_ratio);
	}
}

function get_hit_ratio(gun, default_hit_ratio){
	if (get_gun_option(gun, 'hit_percent_enabled')){
		return get_gun_option(gun, 'hit_percent') / 100.0;
	} else {
		return default_hit_ratio;
	}
}

function GunInfo(gun, default_headshot_ratio, default_hit_ratio){
    this.distance_ttk_name = get_info_name(gun);
    this.headshot_ttk_name = get_info_name(gun, true);
    this.atts = get_selected_atts(gun);
    this.damage_profile = get_damage_profile(gun, this.atts);
    this.rpm = get_rpm(gun,  this.atts);
    this.parts_ratios = get_parts_ratios(gun, default_headshot_ratio);
    this.hit_ratio = get_hit_ratio(gun, default_hit_ratio);
    this.extra_time_ms = gun.open_bolt_delay_ms + get_gun_option(gun, 'ttk_adjustment_ms');
    this.get_damage = function (distance){
        var damage = this.damage_profile[0][1];
        for (var i = 1; i < this.damage_profile.length; i++){
            if (this.damage_profile[i][0] <= distance) {
                damage = this.damage_profile[i][1];
            }
        }
        return damage;
    }
    this.get_ttk_info = function (total_hp, distance, parts_ratios=null, hit_ratio=null, extra_time_ms=null){
        return {
            total_hp: total_hp,
            damage: this.get_damage(distance),
            parts_ratios: ((parts_ratios == null) ? this.parts_ratios : parts_ratios),
            rpm: this.rpm,
            interval_ms: 60000.0 / this.rpm,
            hit_ratio: ((hit_ratio == null) ? this.hit_ratio : hit_ratio),
            extra_time_ms: ((extra_time_ms == null) ? this.extra_time_ms : extra_time_ms)
        };
    }
}